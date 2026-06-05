'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      {/* Bright glowing core */}
      <Icosahedron ref={meshRef} args={[1.5, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          wireframe={true} 
          emissive="#8b5cf6" 
          emissiveIntensity={2} 
        />
      </Icosahedron>

      {/* Solid inner core */}
      <Icosahedron args={[1.4, 0]}>
        <meshStandardMaterial 
          color="#4c1d95" 
          roughness={0.2}
          metalness={0.8}
        />
      </Icosahedron>

      {/* Floating orbital rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={3}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#c4b5fd" emissiveIntensity={1} />
      </mesh>
      
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]} scale={3.5}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1} />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-gray-50 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#c4b5fd" />
        
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <AnimatedGeometry />
        </PresentationControls>

        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.7}
          scale={20}
          blur={2.5}
          far={4.5}
          color="#8b5cf6"
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
