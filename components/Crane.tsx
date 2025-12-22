
// Fix for React Three Fiber intrinsic elements typing
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CraneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  height?: number;
  type?: 'hammer' | 'luffing';
  showFlag?: boolean;
}

const Flag: React.FC<{ height: number }> = ({ height }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 341;
    const ctx = canvas.getContext('2d')!;
    
    // Saudi Green Background
    ctx.fillStyle = '#006c35';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Shadow effect for the flag
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    
    // Stylized White Text (Shahada)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 44px "Tajawal", "Segoe UI", Tahoma, Arial';
    ctx.fillText('لا إله إلا الله', canvas.width / 2, canvas.height * 0.38);
    ctx.fillText('محمد رسول الله', canvas.width / 2, canvas.height * 0.52);
    
    // Sword
    const swordY = canvas.height * 0.72;
    ctx.fillRect(canvas.width * 0.25, swordY, canvas.width * 0.45, 10); // Blade
    ctx.fillRect(canvas.width * 0.68, swordY - 12, 12, 34); // Hilt cross
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const vertices = meshRef.current.geometry.attributes.position;
      const time = state.clock.elapsedTime;
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        // More realistic flag waving animation: higher frequency, dampened near the pole
        const wave = Math.sin(x * 1.8 + time * 4) * 0.3 * (x / 5);
        const wave2 = Math.cos(y * 1.2 + time * 2) * 0.1 * (x / 5);
        vertices.setZ(i, wave + wave2);
      }
      vertices.needsUpdate = true;
    }
  });

  return (
    <group position={[0, height, 0]}>
      {/* Flag Pole */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 12, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Flag Fabric */}
      <mesh ref={meshRef} position={[3, 8.5, 0]}>
        <planeGeometry args={[6, 4, 30, 20]} />
        <meshStandardMaterial 
          map={texture} 
          side={THREE.DoubleSide} 
          roughness={0.6} 
          metalness={0} 
          emissive="#006c35"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
};

const Crane: React.FC<CraneProps> = ({ position, rotation, color, height = 30, type = 'hammer', showFlag = false }) => {
  const jibRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Mesh>(null);
  const luffingJibRef = useRef<THREE.Group>(null);

  // Reusable Lattice Material
  const latticeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.8,
    roughness: 0.2,
    wireframe: true,
  }), [color]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (jibRef.current) {
      jibRef.current.rotation.y = Math.sin(t * 0.12 + position[0]) * 1.5;
    }
    if (luffingJibRef.current) {
      luffingJibRef.current.rotation.y = Math.sin(t * 0.1 + position[0]) * 1.2;
      // Luffing action (arm going up and down)
      luffingJibRef.current.rotation.z = -0.3 + Math.sin(t * 0.3) * 0.4;
    }
    if (hookRef.current) {
      hookRef.current.position.y = -8 + Math.sin(t * 0.5) * 5;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Base / Mast Connection */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[3, 3.5, 5, 8]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>

      {/* Main Mast (Lattice Structure) */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[2, height, 2]} />
        <primitive object={latticeMaterial} attach="material" />
      </mesh>
      {/* Internal Mast (Solid core for better visual depth) */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Top Turntable / Cab Section */}
      <group position={[0, height, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.5, 3, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Operator Cabin */}
        <mesh position={[1.8, 1, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 2]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[1.8, 1, 1]} rotation={[0, 0, 0]}>
           <planeGeometry args={[1.5, 1.2]} />
           <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.2} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Flag Attachment */}
      {showFlag && <Flag height={height + 3} />}

      {/* HAMMERHEAD TYPE JIB */}
      {type === 'hammer' && (
        <group ref={jibRef} position={[0, height + 1.5, 0]}>
          <mesh position={[12, 0, 0]} castShadow>
            <boxGeometry args={[28, 1.2, 1.2]} />
            <primitive object={latticeMaterial} attach="material" />
          </mesh>
          <mesh position={[-6, 0, 0]} castShadow>
            <boxGeometry args={[12, 1, 1]} />
            <primitive object={latticeMaterial} attach="material" />
          </mesh>
          <mesh position={[-9, -0.8, 0]} castShadow>
            <boxGeometry args={[3, 2, 2.5]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Cable and Hook */}
          <group position={[20, 0, 0]}>
            <mesh position={[0, -5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 10]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh ref={hookRef} position={[0, -10, 0]} castShadow>
              <boxGeometry args={[1.5, 0.8, 1.5]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>
      )}

      {/* LUFFING TYPE JIB (Angled arm like in the photo) */}
      {type === 'luffing' && (
        <group ref={luffingJibRef} position={[0, height + 2, 0]}>
          <group rotation={[0, 0, -0.4]}> {/* Pivot group */}
            <mesh position={[15, 0, 0]} castShadow>
              <boxGeometry args={[32, 1.5, 1.5]} />
              <primitive object={latticeMaterial} attach="material" />
            </mesh>
            {/* Cable from luffing tip */}
            <group position={[30, 0, 0]}>
               <mesh position={[0, -15, 0]} rotation={[0, 0, 0.4]}>
                 <cylinderGeometry args={[0.04, 0.04, 30]} />
                 <meshStandardMaterial color="#111" />
               </mesh>
               <mesh ref={hookRef} position={[0, -30, 0]} castShadow rotation={[0, 0, 0.4]}>
                 <boxGeometry args={[2, 1, 2]} />
                 <meshStandardMaterial color="#111" />
               </mesh>
            </group>
          </group>
          {/* A-Frame Tower */}
          <mesh position={[0, 4, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.8, 10, 2]} />
            <primitive object={latticeMaterial} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Crane;
