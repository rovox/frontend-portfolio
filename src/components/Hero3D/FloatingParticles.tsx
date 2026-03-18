import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 60;

export default function FloatingParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random positions and speeds for each particle
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 12,
      y: Math.random() * 0.6 + 0.1,
      z: (Math.random() - 0.5) * 6,
      speed: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.04 + 0.015,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Float and bob gently
      dummy.position.set(
        p.x + Math.sin(time * p.speed + p.phase) * 0.3,
        p.y + Math.sin(time * p.speed * 1.5 + p.phase) * 0.15,
        p.z + Math.cos(time * p.speed * 0.8 + p.phase) * 0.2
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#00e5ff"
        emissive="#00aacc"
        emissiveIntensity={0.6}
        transparent
        opacity={0.55}
        roughness={0.3}
      />
    </instancedMesh>
  );
}
