"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";

// ----- palette (matches the estate) -----
const CREAM = "#ece0c4";
const CREAM2 = "#ddcca8";
const GOLD = "#caa24e";
const SLATE = "#323d4c";
const GLASS = "#ffe0a6";
const WOOD = "#3a2a1c";
const STONE = "#d6cab0";

type Spin = { y: number; drag: boolean; px: number };

function Win({ x, y, z, ry = 0 }: { x: number; y: number; z: number; ry?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.46, 0.66, 0.04]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.36, 0.56, 0.05]} />
        <meshStandardMaterial color={GLASS} emissive={GLASS} emissiveIntensity={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.36, 0.04, 0.05]} />
        <meshStandardMaterial color={GOLD} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.04, 0.56, 0.05]} />
        <meshStandardMaterial color={GOLD} />
      </mesh>
    </group>
  );
}

function HipRoof({ pos, scale }: { pos: [number, number, number]; scale: [number, number, number] }) {
  return (
    <mesh position={pos} rotation={[0, Math.PI / 4, 0]} scale={scale}>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color={SLATE} roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

function Mansion({ spin }: { spin: MutableRefObject<Spin> }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    if (!spin.current.drag) spin.current.y += Math.min(dt, 0.05) * 0.22; // slow auto-spin (~28s / turn)
    o.rotation.y = spin.current.y;
  });

  return (
    <group ref={g} position={[0, -1.45, 0]}>
      {/* terrace + steps */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[6.6, 0.3, 3.1]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.08, 1.55]}>
        <boxGeometry args={[2.2, 0.18, 0.5]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 1.85]}>
        <boxGeometry args={[2.7, 0.14, 0.4]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>

      {/* central block + wings */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[3, 2, 1.8]} />
        <meshStandardMaterial color={CREAM} roughness={0.8} />
      </mesh>
      <mesh position={[-2.4, 0.95, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color={CREAM2} roughness={0.8} />
      </mesh>
      <mesh position={[2.4, 0.95, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color={CREAM2} roughness={0.8} />
      </mesh>

      {/* gilt cornices */}
      <mesh position={[0, 2.26, 0]}>
        <boxGeometry args={[3.2, 0.14, 2.0]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-2.4, 1.74, 0]}>
        <boxGeometry args={[2.2, 0.12, 1.7]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[2.4, 1.74, 0]}>
        <boxGeometry args={[2.2, 0.12, 1.7]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* mansard roofs */}
      <HipRoof pos={[0, 2.9, 0]} scale={[2.12, 1.2, 1.42]} />
      <HipRoof pos={[-2.4, 2.18, 0]} scale={[1.55, 0.9, 1.2]} />
      <HipRoof pos={[2.4, 2.18, 0]} scale={[1.55, 0.9, 1.2]} />

      {/* central cupola + dome */}
      <mesh position={[0, 3.62, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.5, 16]} />
        <meshStandardMaterial color={CREAM} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.92, 0]}>
        <sphereGeometry args={[0.4, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* portico: columns + entablature + medallion */}
      {[-0.85, -0.3, 0.3, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.95, 0.96]}>
          <cylinderGeometry args={[0.1, 0.11, 1.5, 12]} />
          <meshStandardMaterial color="#f3ecd8" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.8, 0.96]}>
        <boxGeometry args={[2.3, 0.24, 0.4]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.06, 0.97]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.07, 18]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* grand door */}
      <mesh position={[0, 0.72, 0.97]}>
        <boxGeometry args={[0.82, 1.4, 0.06]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.68, 1.0]}>
        <boxGeometry args={[0.62, 1.22, 0.05]} />
        <meshStandardMaterial color={WOOD} roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 0.68, 1.04]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* windows */}
      <Win x={-1.05} y={1.5} z={0.92} />
      <Win x={1.05} y={1.5} z={0.92} />
      <Win x={-1.15} y={0.78} z={0.92} />
      <Win x={1.15} y={0.78} z={0.92} />
      <Win x={-2.4} y={1.02} z={0.78} />
      <Win x={2.4} y={1.02} z={0.78} />
      <Win x={-3.32} y={1.02} z={0} ry={Math.PI / 2} />
      <Win x={3.32} y={1.02} z={0} ry={-Math.PI / 2} />
    </group>
  );
}

export default function Mansion3D() {
  const spin = useRef<Spin>({ y: -0.5, drag: false, px: 0 });
  const down = (e: React.PointerEvent) => { spin.current.drag = true; spin.current.px = e.clientX; };
  const move = (e: React.PointerEvent) => {
    if (!spin.current.drag) return;
    spin.current.y += (e.clientX - spin.current.px) * 0.01;
    spin.current.px = e.clientX;
  };
  const up = () => { spin.current.drag = false; };

  return (
    <div
      className="mansion3d"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
      title="Drag to turn the estate"
      style={{ width: "min(380px,86vw)", height: 300, margin: "4px auto 26px", cursor: "grab", touchAction: "none" }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [4.6, 2.9, 6.2], fov: 32 }}
      >
        <ambientLight intensity={0.85} color="#fff2da" />
        <directionalLight position={[5, 9, 6]} intensity={1.15} color="#ffe9c4" />
        <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#9fb8d6" />
        <pointLight position={[0, 2.4, 4]} intensity={9} distance={22} color="#ffd9a0" />
        <Mansion spin={spin} />
      </Canvas>
    </div>
  );
}
