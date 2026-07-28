import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { DoubleSide, Vector2 } from 'three';
import { createWaterUniforms, vertexShader, fragmentShader } from './WaterShader';
import { ScrollTrigger } from '../../utils/gsap-config';
import { logLifecycle } from '../../utils/debug';

interface WaterPlaneProps {
  lowPower?: boolean;
}

function WaterPlane({ lowPower = false }: WaterPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const startTime = useRef(performance.now() * 0.001);
  const { viewport } = useThree();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = e.clientX / window.innerWidth;
    mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Theme-aware water colors
  useEffect(() => {
    const applyThemeColors = () => {
      if (!meshRef.current) return;
      const material = meshRef.current.material as ShaderMaterial;
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        material.uniforms.uColorA.value.set('#bae6fd');
        material.uniforms.uColorB.value.set('#7dd3fc');
      } else {
        material.uniforms.uColorA.value.set('#002d5f');
        material.uniforms.uColorB.value.set('#5052c8');
      }
    };

    // Set initial color based on current theme
    applyThemeColors();

    window.addEventListener('theme-changed', applyThemeColors);
    return () => window.removeEventListener('theme-changed', applyThemeColors);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as ShaderMaterial;
    // Use performace.now() to avoid deprecated THREE.Clock
    material.uniforms.uTime.value = performance.now() * 0.001 - startTime.current;
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
  const [lowPower, setLowPower] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const visibleRef = useRef(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setLowPower(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => setLowPower(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // ScrollTrigger: bidirectional fade + lift, tied directly to scroll.
  // This is a scroll-DRIVEN visibility mechanism (user-controlled), NOT an
  // autonomous animation — it must run even under prefers-reduced-motion,
  // otherwise the waves would stay visible forever.
  // lowPower only reduces geometry/dpr, never disables this effect.
  useEffect(() => {
    if (!wrapperRef.current) return;

    const st = ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const { progress } = self;
        const el = wrapperRef.current!;

        // Progressive fade + lift — tied to hero scroll
        el.style.opacity = String(1 - progress);
        el.style.transform = `translateY(${-10 * progress}vh)`;

        // Once past the hero section, unmount the 3D canvas entirely —
        // stops all GPU/shader work, not just visual hiding.
        const show = progress < 0.99;
        el.style.visibility = show ? 'visible' : 'hidden';
        if (show !== visibleRef.current) {
          visibleRef.current = show;
          setIsVisible(show);
          logLifecycle(
            'tide',
            show ? 'waves visible — canvas remounted' : 'waves hidden — canvas unmounted, GPU stopped'
          );
        }
      },
    });

    return () => st.kill();
  }, [lowPower]);

  return (
    <div
      ref={wrapperRef}
      role="img"
      aria-label="Interactive 3D water visualization background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 5,
        pointerEvents: 'none',
        opacity: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '30vh',
        }}
      >
        {isVisible && (
          <Canvas
            frameloop="always"
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
    </div>
  );
}
