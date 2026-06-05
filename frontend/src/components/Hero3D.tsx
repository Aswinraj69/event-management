'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  // Rotate slowly over time
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color="#6d28d9"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Floating orbital rings around the sphere */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={2.5}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={3}>
        <torusGeometry args={[1, 0.01, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.2} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <AnimatedSphere />
        </PresentationControls>

        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4.5}
          color="#000000"
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
