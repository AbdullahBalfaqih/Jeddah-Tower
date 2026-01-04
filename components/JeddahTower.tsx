// Fix for React Three Fiber intrinsic elements typing
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Floor from './Floor';
import Crane, { Flag } from './Crane';

interface JeddahTowerProps {
  currentFloors: number;
  isFinished: boolean;
}

// Helipad / Sky Terrace Component
const Helipad: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Background - Concrete Grey
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 512, 512);
    
    // Outer concrete border area
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Landing Area Circle
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(256, 256, 230, 0, Math.PI * 2);
    ctx.fill();
    
    // Yellow Warning Circle
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();
    
    // "H" Letter - Large and bold
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 280px Arial'; // Larger font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', 256, 256);
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <group position={position}>
      {/* Cantilever Bridge Structure - Connecting back to tower */}
      <group position={[-45 * scale, -2, 0]}>
         {/* Main horizontal beam */}
         <mesh position={[0, 1, 0]}>
            <boxGeometry args={[65 * scale, 4, 15 * scale]} />
            <meshStandardMaterial color="#555" roughness={0.6} />
         </mesh>
         
         {/* Diagonal strut support underneath */}
         <mesh rotation={[0, 0, -0.35]} position={[5 * scale, -8 * scale, 0]}>
            <boxGeometry args={[50 * scale, 2.5, 10 * scale]} />
            <meshStandardMaterial color="#444" roughness={0.7} />
         </mesh>
      </group>
      
      {/* Landing Disc */}
      <group>
        {/* Main concrete slab */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[28 * scale, 26 * scale, 3, 64]} />
            <meshStandardMaterial map={texture} roughness={0.8} color="#fff" />
        </mesh>

        {/* Bottom hull shape */}
        <mesh position={[0, -3, 0]}>
            <cylinderGeometry args={[26 * scale, 5 * scale, 6, 64]} />
            <meshStandardMaterial color="#444" roughness={0.6} />
        </mesh>
      </group>
      
      {/* Perimeter Safety Railing */}
      <mesh position={[0, 1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[27.5 * scale, 0.3 * scale, 16, 100]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      
      {/* Landing Lights */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 26.5 * scale;
        const z = Math.sin(angle) * 26.5 * scale;
        return (
          <mesh key={i} position={[x, 1.6, z]}>
            <sphereGeometry args={[0.4 * scale, 8, 8]} />
            <meshStandardMaterial 
              color="#3b82f6" 
              emissive="#3b82f6" 
              emissiveIntensity={4} 
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Animated Spire Component
const Spire: React.FC<{ position: [number, number, number], scaleFactor: number }> = ({ position, scaleFactor }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Animate growth from 0 to 1 over approx 2.5 seconds
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, 1, delta * 0.8);
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, 1, delta * 0.8);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, 1, delta * 0.8);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[1, 0, 1]}> 
      {/* Base Transition Section (Glass) */}
      <mesh position={[0, 40, 0]}>
         <cylinderGeometry args={[2, 60 * scaleFactor, 80, 4]} /> {/* Tapering form */}
         <meshPhysicalMaterial color="#a5d8ff" transparent opacity={0.8} roughness={0.05} metalness={0.9} transmission={0.4} reflectivity={1} />
      </mesh>
      
      {/* Main Metallic Spire Section */}
      <mesh position={[0, 150, 0]}>
         <cylinderGeometry args={[1.5, 2, 140, 8]} />
         <meshStandardMaterial color="#eef2f6" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* The Needle Tip */}
      <mesh position={[0, 260, 0]}>
         <cylinderGeometry args={[0.1, 1.5, 80, 8]} />
         <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} emissive="#fff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Aviation Warning Light */}
      <mesh position={[0, 300, 0]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Saudi Flag at the absolute top */}
      <group position={[0, 300, 0]} scale={[3, 3, 3]}>
        <Flag height={0} />
      </group>
    </group>
  );
};

// Realistic Yellow Climbing Form (Safety Screen)
const ClimbingForm: React.FC<{ position: [number, number, number], rotation?: [number, number, number], size: [number, number, number] }> = ({ position, rotation = [0, 0, 0], size }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Panel with vertical ribbing simulation */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color="#fbbf24" 
          roughness={0.4}
          metalness={0.1}
          bumpScale={0.1}
        />
      </mesh>
      {/* Vertical Support Beams */}
      {[-0.45, 0, 0.45].map((xOffset, i) => (
        <mesh key={i} position={[xOffset * size[0], 0, size[2] / 2 + 0.2]}>
          <boxGeometry args={[0.4, size[1] * 1.1, 0.4]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}
    </group>
  );
};

const JeddahTower: React.FC<JeddahTowerProps> = ({ currentFloors, isFinished }) => {
  const towerRef = useRef<THREE.Group>(null);
  const TOTAL_TARGET_FLOORS = 167;
  const TOTAL_TARGET_HEIGHT = 1000;
  const FLOOR_HEIGHT = TOTAL_TARGET_HEIGHT / TOTAL_TARGET_FLOORS;
  const CORE_WIDTH = 10;
  const HELIPAD_FLOOR = 110;

  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#5a5a5a', 
    roughness: 0.85,
    metalness: 0.05
  }), []);

  const floorIndices = useMemo(() => Array.from({ length: currentFloors }, (_, i) => i), [currentFloors]);

  const getScaleAtFloor = (floor: number) => {
    const progress = floor / TOTAL_TARGET_FLOORS;
    // Smoother taper curve
    return Math.max(0.05, Math.pow(1 - progress, 1.1));
  };

  const topY = currentFloors * FLOOR_HEIGHT + 20;
  const coreTopY = topY + 60; // Core always leads the floors
  
  const glassFacadeCount = isFinished ? TOTAL_TARGET_FLOORS : Math.max(0, currentFloors - 8);

  return (
    <group ref={towerRef}>
      {/* --- PODIUM & LOBBY --- */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1, 0]} receiveShadow>
          <cylinderGeometry args={[140, 160, 2, 3]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[0, 10, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[80, 105, 18, 3]} />
          <meshPhysicalMaterial color="#a5d8ff" transparent opacity={0.6} roughness={0.1} metalness={0.9} transmission={0.4} />
        </mesh>
      </group>

      {/* --- TOWER CORE --- */}
      <mesh position={[0, coreTopY / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[CORE_WIDTH * getScaleAtFloor(currentFloors), coreTopY, CORE_WIDTH * getScaleAtFloor(currentFloors)]} />
        <primitive object={coreMaterial} attach="material" />
      </mesh>

      {/* Exposed Core Top (Construction state only) */}
      {!isFinished && (
        <group position={[0, coreTopY, 0]}>
          <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[CORE_WIDTH * getScaleAtFloor(currentFloors) * 0.95, 4, CORE_WIDTH * getScaleAtFloor(currentFloors) * 0.95]} />
            <meshStandardMaterial color="#333" roughness={1} />
          </mesh>
          {/* Rebar simulation */}
          {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[(Math.random()-0.5)*8, 5, (Math.random()-0.5)*8]}>
              <cylinderGeometry args={[0.05, 0.05, 6]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          ))}
        </group>
      )}

      {/* CORE CLIMBING FORMS (Yellow Screens at Core Top) - Hide when finished */}
      {!isFinished && (
        <group position={[0, coreTopY - 15, 0]}>
          {[0, 90, 180, 270].map((angle) => (
            <ClimbingForm 
              key={angle}
              position={[
                Math.cos(THREE.MathUtils.degToRad(angle)) * (CORE_WIDTH * getScaleAtFloor(currentFloors) / 1.8), 
                0, 
                Math.sin(THREE.MathUtils.degToRad(angle)) * (CORE_WIDTH * getScaleAtFloor(currentFloors) / 1.8)
              ]} 
              rotation={[0, THREE.MathUtils.degToRad(angle + 90), 0]}
              size={[CORE_WIDTH * getScaleAtFloor(currentFloors) * 1.2, 30, 0.8]} 
            />
          ))}
        </group>
      )}

      {/* --- FLOOR SLABS --- */}
      {floorIndices.map((i) => (
        <Floor 
          key={i} 
          index={i} 
          yPos={i * FLOOR_HEIGHT + 20}
          scale={getScaleAtFloor(i)} 
          isLatest={i === currentFloors - 1}
        />
      ))}

      {/* HELIPAD (Sky Terrace) - Feature at Floor 110 */}
      {currentFloors >= HELIPAD_FLOOR && (
        <group rotation={[0, THREE.MathUtils.degToRad(120), 0]}>
          <Helipad 
            position={[
              100 * getScaleAtFloor(HELIPAD_FLOOR), 
              HELIPAD_FLOOR * FLOOR_HEIGHT + 20, 
              0
            ]} 
            scale={getScaleAtFloor(HELIPAD_FLOOR)}
          />
        </group>
      )}

      {/* WING TIP SAFETY SCREENS - Hide when finished */}
      {!isFinished && (
        <group position={[0, topY, 0]}>
          {[0, 120, 240].map((angle) => (
            <group key={angle} rotation={[0, THREE.MathUtils.degToRad(angle), 0]}>
               <ClimbingForm 
                  position={[52 * getScaleAtFloor(currentFloors), -15, 0]}
                  rotation={[0, Math.PI / 2, 0]}
                  size={[30 * getScaleAtFloor(currentFloors), 45, 1.2]} 
               />
            </group>
          ))}
        </group>
      )}

      {/* CONSTRUCTION CRANES - Render only if NOT finished */}
      {!isFinished && currentFloors < TOTAL_TARGET_FLOORS && (
        <group>
          {/* Main Luffing Crane */}
          <Crane 
            position={[0, coreTopY + 12, 0]} 
            rotation={[0, 0, 0]} 
            color="#ef4444"
            height={45}
            type="luffing"
            showFlag={true}
          />
          {/* Support Cranes */}
          {[0, 240].map((angle, i) => (
            <Crane 
              key={angle}
              position={[
                Math.cos(THREE.MathUtils.degToRad(angle)) * 18 * getScaleAtFloor(currentFloors), 
                topY + (i * 15), 
                Math.sin(THREE.MathUtils.degToRad(angle)) * 18 * getScaleAtFloor(currentFloors)
              ]} 
              rotation={[0, THREE.MathUtils.degToRad(angle + 45), 0]} 
              color="#fbbf24"
              height={32}
              type="hammer"
            />
          ))}
        </group>
      )}

      {/* GLASS FACADE */}
      <group>
        {[...Array(glassFacadeCount)].map((_, i) => (
          <mesh key={i} position={[0, i * FLOOR_HEIGHT + 20 + (FLOOR_HEIGHT/2), 0]} receiveShadow>
            <cylinderGeometry args={[60 * getScaleAtFloor(i+1), 60 * getScaleAtFloor(i), FLOOR_HEIGHT, 3]} />
            <meshPhysicalMaterial 
              color={isFinished ? "#88ccff" : "#a5d8ff"} 
              transparent 
              opacity={isFinished ? 0.9 : 0.7} 
              roughness={0.05} 
              metalness={0.9} 
              transmission={isFinished ? 0.1 : 0.4} 
              reflectivity={1} 
            />
          </mesh>
        ))}
      </group>

      {/* FINAL ANIMATED SPIRE (Only shown when finished) */}
      {isFinished && (
         <Spire 
            position={[0, TOTAL_TARGET_FLOORS * FLOOR_HEIGHT + 20, 0]} 
            scaleFactor={getScaleAtFloor(TOTAL_TARGET_FLOORS)} 
         />
      )}
    </group>
  );
};

export default JeddahTower;