
import React, { useState, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, ContactShadows, Loader } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import * as THREE from 'three';

const CameraController = ({ preset, currentFloors }: { preset: string; currentFloors: number }) => {
  const { camera, controls } = useThree() as any;
  const [isAutoMoving, setIsAutoMoving] = useState(false);
  const lastPreset = useRef(preset);
  
  const FLOOR_HEIGHT = 1000 / 167;
  const topY = (currentFloors * FLOOR_HEIGHT) + 20;

  useEffect(() => {
    if (preset !== lastPreset.current) {
      setIsAutoMoving(true);
      lastPreset.current = preset;
    }
  }, [preset]);

  // Stop auto-moving if user interacts
  useEffect(() => {
    if (!controls) return;
    const onStart = () => setIsAutoMoving(false);
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controls]);

  useFrame(() => {
    if (controls && isAutoMoving) {
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3();

      switch (preset) {
        case 'overview':
          targetPos.set(2200, 1000, 2200);
          targetLook.set(0, 300, 0);
          break;
        case 'construction':
          targetPos.set(450, topY + 200, 450);
          targetLook.set(0, topY, 0);
          break;
        case 'ground':
          targetPos.set(600, 80, 600); 
          targetLook.set(0, 300, 0);
          break;
      }

      camera.position.lerp(targetPos, 0.05);
      controls.target.lerp(targetLook, 0.05);
      controls.update();

      if (camera.position.distanceTo(targetPos) < 2) {
        setIsAutoMoving(false);
      }
    }
  });

  return null;
};

const App: React.FC = () => {
  const [floorCount, setFloorCount] = useState(81);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [isNight, setIsNight] = useState(false);

  const skyProps = useMemo(() => {
    return isNight 
      ? { sunPosition: [0, -10, 0] as [number, number, number], turbidity: 0, rayleigh: 0, mieCoefficient: 0, mieDirectionalG: 0 }
      : { sunPosition: [100, 40, 100] as [number, number, number], turbidity: 0.05, rayleigh: 0.3, mieCoefficient: 0.005, mieDirectionalG: 0.8 };
  }, [isNight]);

  return (
    <div className={`relative w-full h-screen ${isNight ? 'bg-[#020617]' : 'bg-[#d8c8ae]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Canvas
        shadows
        gl={{ 
          logarithmicDepthBuffer: true, 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false
        }}
        camera={{ position: [2500, 1500, 2500], fov: 35, near: 10, far: 80000 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[isNight ? '#020617' : '#d8c8ae']} />
          <Sky {...skyProps} distance={450000} />
          
          <fog attach="fog" args={[isNight ? '#020617' : '#d8c8ae', 1000, 60000]} />
          
          <Environment preset={isNight ? "night" : "city"} />
          
          <ambientLight intensity={isNight ? 0.3 : 0.8} />
          <directionalLight
            position={[1000, 2000, 1000]}
            intensity={isNight ? 0.2 : 2.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-2000}
            shadow-camera-right={2000}
            shadow-camera-top={2000}
            shadow-camera-bottom={-2000}
            shadow-bias={-0.0001}
          />

          <Scene floorCount={floorCount} />
          
          <CameraController preset={cameraPreset} currentFloors={floorCount} />
          
          <OrbitControls 
            makeDefault
            maxPolarAngle={Math.PI / 1.8} 
            enableDamping 
            dampingFactor={0.05}
            maxDistance={50000}
            minDistance={2}
          />
          
          <ContactShadows resolution={1024} scale={10000} blur={2.5} opacity={isNight ? 0.2 : 0.4} far={200} color="#333" />
        </Suspense>
      </Canvas>

      <UIOverlay 
        floorCount={floorCount} 
        setFloorCount={setFloorCount}
        isAutoBuilding={isAutoBuilding}
        setIsAutoBuilding={setIsAutoBuilding}
        setCameraPreset={setCameraPreset}
        cameraPreset={cameraPreset}
        language={language}
        setLanguage={setLanguage}
        isNight={isNight}
        setIsNight={setIsNight}
      />
      
      <Loader />
    </div>
  );
};

export default App;
