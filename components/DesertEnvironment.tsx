
// Fix for React Three Fiber intrinsic elements typing
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const DesertEnvironment: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  // Animate water surface slightly
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = -10 + Math.sin(state.clock.elapsedTime * 0.4) * 0.5;
    }
  });

  return (
    <group>
      {/* Main Ground Plane - Slightly lowered to avoid shadow acne and precision issues at Y=0 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[70000, 70000]} />
        <meshStandardMaterial color="#c2a585" roughness={1} metalness={0} />
      </mesh>

      {/* Red Sea - Separated from main ground and lowered */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -20000]} receiveShadow>
        <planeGeometry args={[70000, 35000]} />
        <meshPhysicalMaterial 
          color="#003d55" 
          roughness={0.05} 
          metalness={0.1} 
          transmission={0} 
          reflectivity={1}
          opacity={0.95}
          transparent
        />
      </mesh>

      {/* Coastal Road Strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, -2500]}>
        <planeGeometry args={[70000, 150]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* Background City Scape - Distant Clusters */}
      <group position={[0, 0, 8000]}>
        {[...Array(80)].map((_, i) => {
          const x = (Math.random() - 0.5) * 15000;
          const z = Math.random() * 8000;
          const h = 40 + Math.random() * 250;
          return (
            <mesh key={i} position={[x, h / 2 - 0.5, z]} castShadow receiveShadow>
              <boxGeometry args={[50 + Math.random() * 50, h, 50 + Math.random() * 50]} />
              <meshStandardMaterial color="#ddd" roughness={0.7} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export default DesertEnvironment;
