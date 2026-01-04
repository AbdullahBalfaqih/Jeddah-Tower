import React from 'react';
import JeddahTower from './JeddahTower';
import DesertEnvironment from './DesertEnvironment';

interface SceneProps {
  floorCount: number;
  isFinished: boolean;
}

const Scene: React.FC<SceneProps> = ({ floorCount, isFinished }) => {
  return (
    <group>
      <JeddahTower currentFloors={floorCount} isFinished={isFinished} />
      <DesertEnvironment />
    </group>
  );
};

export default Scene;