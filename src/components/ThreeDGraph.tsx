import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Module } from '@/types/api';
import { useAppStore } from '@/store/useAppStore';

interface NodeProps {
  module: Module;
  position: [number, number, number];
  status: 'not_started' | 'in_progress' | 'completed';
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

const Node = ({ module, position, status, onClick, onHover }: NodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const color = useMemo(() => {
    switch (status) {
      case 'completed': return '#10B981'; // success
      case 'in_progress': return '#8B5CF6'; // accent
      default: return '#6366F1'; // primary
    }
  }, [status]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {status === 'completed' && (
        <mesh position={[0, 0, 0.51]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
        </mesh>
      )}

      <Html
        position={[0, -0.8, 0]}
        center
        distanceFactor={10}
        style={{
          color: 'white',
          fontSize: '12px',
          textAlign: 'center',
          width: '120px',
          pointerEvents: 'none',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {module.module_name}
      </Html>
    </group>
  );
};

interface ThreeDGraphProps {
  modules: Module[];
  onModuleClick: (moduleId: number) => void;
}

export const ThreeDGraph = ({ modules, onModuleClick }: ThreeDGraphProps) => {
  const { moduleProgress } = useAppStore();
  const [hoveredModule, setHoveredModule] = useState<Module | null>(null);

  // Calculate positions in a 3D spiral layout
  const positions = useMemo(() => {
    return modules.map((_, index) => {
      const angle = (index / modules.length) * Math.PI * 4;
      const radius = 3 + index * 0.3;
      const height = index * 0.8;

      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [modules]);

  // Sequential edges (backend doesn't provide explicit prerequisites,
  // so connect modules in generated order as a reasonable default)
  const edges = useMemo(() => {
    const edgesList: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];

    for (let i = 1; i < positions.length; i++) {
      edgesList.push({
        start: positions[i - 1],
        end: positions[i],
      });
    }

    return edgesList;
  }, [positions]);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        className="bg-gradient-to-br from-background to-muted"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
        />

        {/* Edges */}
        {edges.map((edge, index) => (
          <Line
            key={index}
            points={[edge.start, edge.end]}
            color="#6366F1"
            lineWidth={2}
            opacity={0.3}
            transparent
          />
        ))}

        {/* Nodes */}
        {modules.map((module, index) => (
          <Node
            key={module.id}
            module={module}
            position={positions[index]}
            status={moduleProgress[module.id] || 'not_started'}
            onClick={() => onModuleClick(module.id)}
            onHover={(hovered) => setHoveredModule(hovered ? module : null)}
          />
        ))}
      </Canvas>

      {/* Hover Tooltip */}
      {hoveredModule && (
        <div className="absolute top-4 left-4 glass p-4 rounded-lg max-w-xs">
          <h4 className="font-semibold mb-1">{hoveredModule.module_name}</h4>
          <p className="text-sm text-muted-foreground">{hoveredModule.description}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            {hoveredModule.estimated_time} • {hoveredModule.resources.length} resources
          </div>
        </div>
      )}
    </div>
  );
};