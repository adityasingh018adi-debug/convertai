"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Torus, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Floating document slab ────────────────────────────────────────── */
function DocSlab({
  position,
  color,
  label,
  speed = 0.2,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    meshRef.current.rotation.y += dt * speed;
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={meshRef} position={position}>
        {/* Main slab */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.9, 0.06]} />
          <meshStandardMaterial
            color={color}
            metalness={0.4}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* Lines on the doc */}
        {[0.25, 0.1, -0.05, -0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0.04]}>
            <boxGeometry args={[0.45, 0.04, 0.01]} />
            <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        ))}
        {/* Corner fold */}
        <mesh position={[0.25, 0.38, 0.04]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.14, 0.14, 0.01]} />
          <meshStandardMaterial color="#ffffff" opacity={0.25} transparent />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Glowing orb ──────────────────────────────────────────────────── */
function GlowOrb({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <Float speed={1.8} floatIntensity={2} rotationIntensity={0.2}>
      <Sphere args={[0.28, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          distort={0.45}
          speed={3}
          transparent
          opacity={0.75}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </Sphere>
    </Float>
  );
}

/* ── Spinning ring ────────────────────────────────────────────────── */
function SpinRing({
  radius,
  tube,
  color,
  tiltX = 0,
  tiltZ = 0,
  speed = 0.4,
}: {
  radius: number;
  tube: number;
  color: string;
  tiltX?: number;
  tiltZ?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

/* ── Particle cloud ───────────────────────────────────────────────── */
function Particles({ count = 120 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#93c5fd" size={0.045} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ── Scene root ───────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#3b82f6" />
      <pointLight position={[-4, -3, 3]} intensity={1.2} color="#8b5cf6" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#f59e0b" />

      {/* Star field */}
      <Stars radius={12} depth={6} count={600} factor={2.5} saturation={0} fade speed={0.8} />

      {/* Particles */}
      <Particles count={150} />

      {/* Document slabs */}
      <DocSlab position={[1.6, 0.5, 0]}   color="#ef4444" label="PDF" speed={0.18} />
      <DocSlab position={[-1.2, 0.9, -0.4]} color="#3b82f6" label="DOC" speed={0.14} />
      <DocSlab position={[0.4, -1.0, 0.2]} color="#10b981" label="XLS" speed={0.22} />

      {/* Glowing orbs */}
      <GlowOrb position={[2.2, -1.0, -0.8]} color="#8b5cf6" />
      <GlowOrb position={[-1.8, 1.6, -0.6]} color="#f59e0b" />
      <GlowOrb position={[0.2, 1.8, -1.0]}  color="#06b6d4" />

      {/* Rings */}
      <SpinRing radius={1.8} tube={0.025} color="#3b82f6" tiltX={1.1} tiltZ={0.4} speed={0.35} />
      <SpinRing radius={2.5} tube={0.018} color="#8b5cf6" tiltX={0.5} tiltZ={1.0} speed={-0.2} />
    </>
  );
}

/* ── Export ───────────────────────────────────────────────────────── */
export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 58 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
