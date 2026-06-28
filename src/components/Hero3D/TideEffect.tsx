import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback, useState } from 'react';
import type { Mesh, ShaderMaterial, Vector2 } from 'three';
import { DoubleSide, Vector2 as ThreeVector2 } from 'three';
import WaterShader from './WaterShader';

function WaterPlane() {
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
    const current = material.uniforms.uMouse.value as { x: number; y: number };
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 2, 96, 96]} />
      <shaderMaterial
        uniforms={WaterShader.uniforms}
        vertexShader={WaterShader.vertexShader}
        fragmentShader={WaterShader.fragmentShader}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function TideEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        role="img"
        aria-label="Interactive 3D water visualization background"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '30vh',
          zIndex: 5,
          pointerEvents: 'none',
          background: 'linear-gradient(to top, #002d5f 0%, #04070f 100%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
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
      }}
    >
      {isVisible && (
        <Canvas
          camera={{ position: [0, 2.5, 4], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 3]} intensity={0.8} color="#aaddff" />
          <pointLight position={[-3, 2, -2]} intensity={0.3} color="#2de2e6" />
          <WaterPlane />
        </Canvas>
      )}
    </div>
  );
}
