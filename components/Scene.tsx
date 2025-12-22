// Fix for React Three Fiber intrinsic elements typing
import React from 'react';
import JeddahTower from './JeddahTower';
import DesertEnvironment from './DesertEnvironment';

interface SceneProps {
  floorCount: number;
}

const Scene: React.FC<SceneProps> = ({ floorCount }) => {
  return (
    /* @ts-ignore */
    <group>
      <JeddahTower currentFloors={floorCount} />
      <DesertEnvironment />
    {/* @ts-ignore */}
    </group>
  );
};

export default Scene;