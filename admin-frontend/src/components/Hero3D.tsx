'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

function CosmicScene() {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef  = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4 + Math.PI / 2;
      ring1Ref.current.rotation.z = t * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.25 + Math.PI / 4;
      ring2Ref.current.rotation.z = -t * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.18;
      coreRef.current.rotation.y = t * 0.22;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} floatIntensity={1.5}>
        {/* Glowing wireframe icosahedron */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color="#a855f7"
            wireframe
            emissive="#c084fc"
            emissiveIntensity={2}
          />
        </mesh>

        {/* Solid inner core */}
        <mesh>
          <icosahedronGeometry args={[1.35, 0]} />
          <meshStandardMaterial color="#3b0764" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Orbital ring 1 — cyan */}
        <mesh ref={ring1Ref} scale={3.5}>
          <torusGeometry args={[1, 0.012, 32, 100]} />
          <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.5} />
        </mesh>

        {/* Orbital ring 2 — pink */}
        <mesh ref={ring2Ref} scale={4}>
          <torusGeometry args={[1, 0.015, 32, 100]} />
          <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={1} />
        </mesh>
      </Float>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#020617] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#2dd4bf" />
        <Sparkles count={150} scale={12} size={1.5} speed={0.6} opacity={0.3} color="#f472b6" />

        <CosmicScene />
      </Canvas>
    </div>
  );
}
