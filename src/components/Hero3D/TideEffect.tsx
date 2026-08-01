import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { Mesh, ShaderMaterial, WebGLRenderer } from 'three';
import { DoubleSide, Vector2 } from 'three';
import { createWaterUniforms, vertexShader, fragmentShader } from './WaterShader';
import { ScrollTrigger } from '../../utils/gsap-config';

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
    // Use performance.now() to avoid deprecated THREE.Clock
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
  const [contextLost, setContextLost] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setLowPower(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setLowPower(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Scroll-driven: waves grow and fade as user scrolls through hero.
  // Runs even under prefers-reduced-motion (user-controlled, not autonomous).
  //
  // The Canvas stays mounted — visibility is driven purely by wrapper CSS
  // (opacity/visibility). Unmounting the canvas on hide (as a previous version
  // did) could trigger `webglcontextlost` in Firefox and permanently kill this
  // ScrollTrigger, making the waves disappear forever. Keeping it mounted means
  // the fade always comes back when scrolling up.
  const createFadeTrigger = useCallback((): ScrollTrigger | null => {
    if (!wrapperRef.current) return null;

    return ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const { progress } = self;
        const el = wrapperRef.current!;

        // Firefox emits "async scrolling disabled" warning here — expected, no visible jank observed.
        // Waves grow larger while fading out — "submerging" effect
        el.style.opacity = String(1 - progress);
        el.style.transform = `scale(${1 + progress * 0.6})`;
        el.style.transformOrigin = 'center bottom';
        el.style.visibility = progress < 0.99 ? 'visible' : 'hidden';
      },
    });
  }, []);

  useEffect(() => {
    stRef.current = createFadeTrigger();
    return () => {
      stRef.current?.kill();
      stRef.current = null;
    };
  }, [createFadeTrigger]);

  // WebGL context-loss handlers. If the context is genuinely lost (GPU reset),
  // show the static fallback. The ScrollTrigger is recreated on restore so the
  // controlled fade always comes back.
  const handleContextLost = useCallback((e: Event) => {
    e.preventDefault();
    setContextLost(true);
    stRef.current?.kill();
    stRef.current = null;
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    if (!stRef.current) {
      stRef.current = createFadeTrigger();
    }
  }, [createFadeTrigger]);

  const onCanvasCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      gl.domElement.addEventListener('webglcontextlost', handleContextLost);
      gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
    },
    [handleContextLost, handleContextRestored],
  );

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
      {contextLost && (
        <div
          aria-live="polite"
          className="sr-only"
        >
          3D visualization temporarily unavailable.
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '20vh',
        }}
      >
        {contextLost ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,45,95,0.3) 100%)',
            }}
          />
        ) : (
          <Canvas
            frameloop="always"
            camera={{ position: [0, 2.5, 4], fov: 50 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            dpr={lowPower ? [1, 1] : [1, 1.5]}
            style={{ background: 'transparent' }}
            onCreated={onCanvasCreated}
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
