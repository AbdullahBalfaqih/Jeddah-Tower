import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface FloorProps {
  index: number;
  yPos: number; // This is the center Y position of the floor's allocated vertical space
  scale: number;
  isLatest: boolean;
}

const Floor: React.FC<FloorProps> = ({ index, yPos, scale, isLatest }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Define these constants locally for calculations within Floor component
  const TOTAL_TARGET_HEIGHT = 1000;
  const TOTAL_TARGET_FLOORS = 167;
  const FLOOR_UNIT_HEIGHT = TOTAL_TARGET_HEIGHT / TOTAL_TARGET_FLOORS; // ~5.988

  // Make the floor slab itself fill the entire vertical space allocated to it
  // This removes any visible gaps between floor levels, as per user request.
  const slabVerticalThickness = FLOOR_UNIT_HEIGHT; 

  useEffect(() => {
    if (isLatest && meshRef.current) {
      // Initialize scale and position for animation
      meshRef.current.scale.set(0.1, 0.1, 0.1); // Start small for pop-in effect
      meshRef.current.position.y = yPos - (FLOOR_UNIT_HEIGHT * 2); // Start lower for a rising animation
    }
  }, [isLatest, yPos, FLOOR_UNIT_HEIGHT]);

  useFrame(() => {
    if (isLatest && meshRef.current) {
      // Animate scale and position
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, yPos, 0.1);
    }
  });

  const wingWidth = 65 * scale;
  const wingThickness = 20 * scale; // Depth along the Z axis for the triangular wing
  const beamHeight = 1.5; // Fixed height for yellow construction beams

  return (
    <group ref={meshRef} position={[0, yPos, 0]}>
      {[0, 120, 240].map((angle) => (
        <group key={angle} rotation={[0, THREE.MathUtils.degToRad(angle), 0]}>
          {/* Main Structural Slab - Now fills the entire vertical height */}
          <mesh position={[wingWidth / 2.5, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[wingWidth, slabVerticalThickness, wingThickness]} />
            <meshStandardMaterial color={index % 10 === 0 ? "#444" : "#888"} roughness={0.9} />
          </mesh>
          
          {/* Outer Construction Beams (Yellow elements) */}
          {/* Positioned on top of the slab, height relative to floor unit */}
          <mesh position={[wingWidth * 0.95, slabVerticalThickness / 2 + beamHeight / 2, 0]} castShadow>
            <boxGeometry args={[1, beamHeight, wingThickness * 0.9]} /> 
            <meshStandardMaterial color="#fbbf24" roughness={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* Structural Central Connection - Now spans the full floor unit height */}
      <mesh position={[0, 0, 0]}> {/* Centered on the floor group's yPos */}
        <cylinderGeometry args={[5 * scale, 5.5 * scale, slabVerticalThickness]} /> {/* Height matches floor unit */}
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
};

export default Floor;