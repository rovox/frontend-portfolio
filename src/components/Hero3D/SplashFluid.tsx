import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

function WaterParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const rippleRef = useRef<{ time: number; strength: number; x: number; y: number }>({
    time: 0,
    strength: 0,
    x: 0,
    y: 0,
  });

  const particles = useMemo(() => {
    return Array.from({ length: 800 }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Track mouse for ripple effect
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;

      // Detect significant mouse movement to trigger ripple
      const dx = nx - mouseRef.current.prevX;
      const dy = ny - mouseRef.current.prevY;
      const delta = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;

      if (delta > 0.02) {
        rippleRef.current = {
          time: 0,
          strength: Math.min(delta * 8, 1.5),
          x: nx * 5,
          y: ny * 3,
        };
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Decay ripple
    const ripple = rippleRef.current;
    ripple.time += 0.05;
    ripple.strength *= 0.95;

    particles.forEach((p, i) => {
      const waveHeight = Math.sin(p.x * 2 + time * 2) * 0.3;
      const waveHeight2 = Math.cos(p.y * 1.5 + time * 1.5) * 0.2;

      // Mouse ripple: displace nearby particles
      const rdx = p.x - ripple.x;
      const rdy = p.y - ripple.y;
      const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
      const rippleRing = Math.sin(rdist * 3 - ripple.time * 4);
      const rippleAmount =
        ripple.strength *
        rippleRing *
        Math.exp(-rdist * 0.6) *
        (1 - Math.exp(-ripple.time * 2));

      dummy.position.set(
        p.x + rdx * rippleAmount * 0.3,
        p.y + waveHeight + waveHeight2 + rippleAmount * 0.4,
        p.z + rdy * rippleAmount * 0.3
      );
      dummy.scale.setScalar(0.05 + Math.sin(time + p.phase) * 0.02);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 800]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#2de2e6"
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.8}
      />
    </instancedMesh>
  );
}

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ pointer }) => {
    if (!lightRef.current) return;
    lightRef.current.position.set(pointer.x * 5, pointer.y * 3, 2);
  });

  return (
    <pointLight ref={lightRef} color="#ffffff" intensity={2} distance={10} />
  );
}

export default function SplashFluid() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      frameloop="always"
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.3} />
      <MouseLight />
      <WaterParticles />
    </Canvas>
  );
}
