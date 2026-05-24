"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Torus } from "@react-three/drei";
import * as THREE from "three";

function DocBox({
  position,
  color,
  phase = 0,
}: {
  position: [number, number, number];
  color: string;
  phase?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    ref.current.rotation.x = t * 0.7;
    ref.current.rotation.y = t * 1.1;
    ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[0.55, 0.7, 0.07]} />
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.25}
        emissive={color}
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

function Arrows() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.18;
  });
  return (
    <group ref={ref}>
      {[-0.12, 0, 0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <coneGeometry args={[0.07, 0.18, 6]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Rings() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    r1.current.rotation.x += dt * 1.2;
    r1.current.rotation.z += dt * 0.6;
    r2.current.rotation.y += dt * 0.9;
    r2.current.rotation.z -= dt * 0.5;
  });
  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[1.1, 0.025, 12, 80]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.018, 12, 80]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

function Scene({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={2.5} color={fromColor} />
      <pointLight position={[-2, -2, 2]} intensity={2} color={toColor} />

      <DocBox position={[-1.05, 0, 0]} color={fromColor} phase={0} />
      <DocBox position={[1.05, 0, 0]}  color={toColor}   phase={Math.PI} />

      <Arrows />
      <Rings />
    </>
  );
}

export function ConvertAnimation({
  fromColor = "#3b82f6",
  toColor   = "#ef4444",
}: {
  fromColor?: string;
  toColor?: string;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 52 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <Scene fromColor={fromColor} toColor={toColor} />
    </Canvas>
  );
}
