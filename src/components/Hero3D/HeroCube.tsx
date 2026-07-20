import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo } from 'react';
import { Color, BoxGeometry } from 'three';
import type { Mesh, LineSegments } from 'three';

const BG_COLORS = [
  new Color('#000000'),
  new Color('#0055ff'),
  new Color('#dd0000'),
  new Color('#ffcc00'),
];

const _tmp = new Color();

function lerpColor(c1: Color, c2: Color, t: number): Color {
  _tmp.r = c1.r + (c2.r - c1.r) * t;
  _tmp.g = c1.g + (c2.g - c1.g) * t;
  _tmp.b = c1.b + (c2.b - c1.b) * t;
  return _tmp;
}

function CubeScene() {
  const meshRef = useRef<Mesh>(null);
  const edgesRef = useRef<LineSegments>(null);
  const [reduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const geo = useMemo(() => new BoxGeometry(1.2, 1.2, 1.2), []);

  useFrame((state) => {
    if (reduced) {
      state.scene.background = BG_COLORS[0];
      return;
    }

    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.25) * 0.4;
      meshRef.current.rotation.y = t * 0.35;
      meshRef.current.position.x = Math.sin(t * 0.35) * 1.6;
      meshRef.current.position.y = Math.cos(t * 0.28) * 1.0;
      meshRef.current.position.z = Math.sin(t * 0.12) * 0.3;
    }

    if (edgesRef.current && meshRef.current) {
      edgesRef.current.position.copy(meshRef.current.position);
      edgesRef.current.rotation.copy(meshRef.current.rotation);
    }

    const speed = 0.65;
    const total = BG_COLORS.length;
    const phase = (t * speed) % total;
    const idx = Math.floor(phase);
    const frac = phase - idx;
    const c1 = BG_COLORS[idx % total];
    const c2 = BG_COLORS[(idx + 1) % total];

    state.scene.background = lerpColor(c1, c2, frac);
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geo}>
        <meshPhysicalMaterial
          color="#2de2e6"
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.3}
          emissive="#2de2e6"
          emissiveIntensity={0.4}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[geo]} />
        <lineBasicMaterial color="#55ff9f" />
      </lineSegments>
      <OrbitingRing />
    </group>
  );
}

function OrbitingRing() {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * 0.12) * 0.3;
    ref.current.rotation.z = t * 0.08;
    ref.current.position.x = Math.cos(t * 0.18) * 2.4;
    ref.current.position.y = Math.sin(t * 0.22) * 1.2;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.5, 0.025, 12, 48]} />
      <meshBasicMaterial color="#8f6bff" transparent opacity={0.5} />
    </mesh>
  );
}

export default function HeroCube() {
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
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {isReady && (
        <Canvas
          dpr={lowPower ? [1, 1] : [1, 1.5]}
          camera={{ position: [0, 0, 4], fov: 60 }}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
          frameloop={lowPower ? 'demand' : 'always'}
        >
          <CubeScene />
        </Canvas>
      )}
    </div>
  );
}
