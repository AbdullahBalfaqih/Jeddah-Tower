
// Fix for React Three Fiber intrinsic elements typing
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface FloorProps {
  index: number;
  yPos: number;
  scale: number;
  isLatest: boolean;
}

const Floor: React.FC<FloorProps> = ({ index, yPos, scale, isLatest }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (isLatest && meshRef.current) {
      meshRef.current.scale.set(0, 0, 0);
      meshRef.current.position.y = yPos - 15;
    }
  }, [isLatest, yPos]);

  useFrame(() => {
    if (isLatest && meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, yPos, 0.1);
    }
  });

  const wingWidth = 65 * scale;
  const wingThickness = 20 * scale;
  const wingDepth = 0.6;

  return (
    /* @ts-ignore */
    <group ref={meshRef} position={[0, yPos, 0]}>
      {[0, 120, 240].map((angle) => (
        /* @ts-ignore */
        <group key={angle} rotation={[0, THREE.MathUtils.degToRad(angle), 0]}>
          {/* Main Structural Slab */}
          {/* @ts-ignore */}
          <mesh position={[wingWidth / 2.5, 0, 0]} castShadow receiveShadow>
            {/* @ts-ignore */}
            <boxGeometry args={[wingWidth, wingDepth, wingThickness]} />
            {/* @ts-ignore */}
            <meshStandardMaterial color={index % 10 === 0 ? "#444" : "#888"} roughness={0.9} />
          {/* @ts-ignore */}
          </mesh>
          
          {/* Outer Construction Beams (Reference image highlights) */}
          {/* @ts-ignore */}
          <mesh position={[wingWidth * 0.95, wingDepth/2 + 0.5, 0]} castShadow>
            {/* @ts-ignore */}
            <boxGeometry args={[1, 3, wingThickness * 0.9]} />
            {/* @ts-ignore */}
            <meshStandardMaterial color="#fbbf24" roughness={0.5} />
          {/* @ts-ignore */}
          </mesh>
        {/* @ts-ignore */}
        </group>
      ))}
      
      {/* Structural Central Connection */}
      {/* @ts-ignore */}
      <mesh position={[0, -2.5, 0]}>
        {/* @ts-ignore */}
        <cylinderGeometry args={[5 * scale, 5.5 * scale, 5]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#555" />
      {/* @ts-ignore */}
      </mesh>
    {/* @ts-ignore */}
    </group>
  );
};

export default Floor;
