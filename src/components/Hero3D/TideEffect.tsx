import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { DoubleSide, Vector2 } from 'three';
import { createWaterUniforms, vertexShader, fragmentShader } from './WaterShader';

interface WaterPlaneProps {
  lowPower?: boolean;
}

function WaterPlane({ lowPower = false }: WaterPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const { viewport } = useThree();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX / window.innerWidth;
    mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const target = mouseRef.current;
    const current = material.uniforms.uMouse.value as Vector2;
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
  });

  // Reduced geometry on low-power / reduced-motion devices
  const segments = lowPower ? 24 : 48;

  const uniforms = useMemo(() => createWaterUniforms(), []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 2, segments, segments]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function TideEffect() {
  const [isReady, setIsReady] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setLowPower(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => setLowPower(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleReady = () => setIsReady(true);

    if ((window as any).__portfolioLoaderDone) {
      handleReady();
    } else {
      window.addEventListener('preloader:done', handleReady, { once: true });
    }

    return () => window.removeEventListener('preloader:done', handleReady);
  }, []);

  return (
    <div
      role="img"
      aria-label="Interactive 3D water visualization background"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '35vh',
        zIndex: 5,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      {isReady && (
        <Canvas
          camera={{ position: [0, 2.5, 4], fov: 50 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          dpr={lowPower ? [1, 1] : [1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 3]} intensity={0.8} color="#aaddff" />
          <pointLight position={[-3, 2, -2]} intensity={0.3} color="#2de2e6" />
          <WaterPlane lowPower={lowPower} />
        </Canvas>
      )}
    </div>
  );
}
