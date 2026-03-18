import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import WaterShader from './WaterShader';

function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const { viewport } = useThree();

  // Track mouse position
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
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 2, 96, 96]} />
      <shaderMaterial
        uniforms={WaterShader.uniforms}
        vertexShader={WaterShader.vertexShader}
        fragmentShader={WaterShader.fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function TideEffect() {
  return (
    <div
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
      <Canvas
        camera={{ position: [0, 2.5, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 3]} intensity={0.8} color="#aaddff" />
        <pointLight position={[-3, 2, -2]} intensity={0.3} color="#2de2e6" />
        <WaterPlane />
      </Canvas>
    </div>
  );
}
