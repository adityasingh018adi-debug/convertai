"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Sphere, MeshDistortMaterial, Html, RoundedBox, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const PALETTE = {
  bg: "#050816",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  purple: "#8B5CF6",
  white: "#FFFFFF",
};

/* ── Mouse-reactive parallax rig — the whole scene gently follows the cursor ── */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  useFrame(({ pointer }) => {
    const targetY = (pointer.x * Math.PI) / 18;
    const targetX = (-pointer.y * Math.PI) / 24;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    group.current.position.x += (pointer.x * 0.25 - group.current.position.x) * 0.03;
    group.current.position.y += (pointer.y * 0.15 - group.current.position.y) * 0.03;
  });
  return <group ref={group}>{children}</group>;
}

/* ── Particle field that drifts and gently breathes ── */
function ParticleField({ count = 800 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) * 0.5 - 2;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={PALETTE.cyan} size={0.03} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/* ── The central glass document the AI scans ── */
function GlassDocument({ scanT }: { scanT: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    groupRef.current.rotation.y += dt * 0.18;
  });
  const scanY = THREE.MathUtils.lerp(0.7, -0.7, (Math.sin(scanT * Math.PI * 2) + 1) / 2);

  return (
    <Float speed={1.4} floatIntensity={0.5} rotationIntensity={0.15}>
      <group ref={groupRef}>
        <RoundedBox args={[1.1, 1.45, 0.05]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial
            color={PALETTE.white}
            transparent
            opacity={0.32}
            roughness={0.05}
            metalness={0.1}
            transmission={0.7}
            thickness={0.4}
            clearcoat={1}
            emissive={PALETTE.blue}
            emissiveIntensity={0.12}
          />
        </RoundedBox>
        {[0.4, 0.2, 0, -0.2, -0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0.03]}>
            <boxGeometry args={[0.7, 0.05, 0.005]} />
            <meshStandardMaterial color={PALETTE.white} transparent opacity={0.5} emissive={PALETTE.blue} emissiveIntensity={0.3} />
          </mesh>
        ))}
        {/* Scanner laser line */}
        <mesh position={[0, scanY, 0.05]}>
          <boxGeometry args={[1.15, 0.025, 0.02]} />
          <meshStandardMaterial color={PALETTE.cyan} emissive={PALETTE.cyan} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Floating glass format cards orbiting the AI core ── */
const FORMATS = [
  { label: "PDF", color: "#ef4444" },
  { label: "Word", color: "#3b82f6" },
  { label: "Excel", color: "#10b981" },
  { label: "Invoice", color: "#f59e0b" },
  { label: "Challan", color: "#8b5cf6" },
  { label: "OCR", color: "#06b6d4" },
];

function OrbitingCard({ index, total, radius }: { index: number; total: number; radius: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const fmt = FORMATS[index % FORMATS.length];
  const offset = (index / total) * Math.PI * 2;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.22 + offset;
    groupRef.current.position.x = Math.cos(t) * radius;
    groupRef.current.position.z = Math.sin(t) * radius * 0.55 - 1.5;
    groupRef.current.position.y = Math.sin(t * 1.1) * 0.22;
  });

  // Billboard keeps each card facing the camera at all times, instead of
  // facing the orbit center — that mismatch was the cause of cards looking
  // skewed/jumbled depending on where they sat in the orbit.
  return (
    <group ref={groupRef}>
      <Billboard>
        {/* Soft glow halo behind the card */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[0.95, 1.1]} />
          <meshBasicMaterial color={fmt.color} transparent opacity={0.25} toneMapped={false} />
        </mesh>
        <RoundedBox args={[0.68, 0.85, 0.05]} radius={0.07} smoothness={4}>
          <meshPhysicalMaterial
            color={fmt.color}
            transparent
            opacity={0.4}
            roughness={0.15}
            transmission={0.6}
            thickness={0.5}
            clearcoat={1}
            emissive={fmt.color}
            emissiveIntensity={0.55}
          />
        </RoundedBox>
        <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div style={{
            color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: "sans-serif",
            whiteSpace: "nowrap", textShadow: "0 0 10px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)",
          }}>
            {fmt.label}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ── Pulsing AI core at the center ── */
function AiCore() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
    ref.current.scale.setScalar(s);
  });
  return (
    <Sphere ref={ref} args={[0.32, 64, 64]} position={[0, 0, -1.5]}>
      <MeshDistortMaterial color={PALETTE.blue} distort={0.35} speed={2.5} emissive={PALETTE.blue} emissiveIntensity={1.2} transparent opacity={0.85} />
    </Sphere>
  );
}

/* ── Scene root, cycling through phases on a loop ── */
function Scene() {
  const [t, setT] = useState(0);
  useFrame((_, dt) => setT((prev) => (prev + dt) % 18));

  const scanPhase = t < 6;
  const orbitPhase = t >= 5 && t < 13;
  const logoPhase = t >= 12;

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={2.2} color={PALETTE.blue} />
      <pointLight position={[-4, -3, 3]} intensity={1.4} color={PALETTE.purple} />
      <pointLight position={[0, 0, 2]} intensity={0.8} color={PALETTE.cyan} />

      <Stars radius={14} depth={8} count={500} factor={2} saturation={0} fade speed={0.6} />
      <ParticleField count={700} />

      <ParallaxRig>
        {scanPhase && <GlassDocument scanT={t / 6} />}
        {(orbitPhase || logoPhase) && <AiCore />}
        {orbitPhase &&
          FORMATS.map((_, i) => <OrbitingCard key={i} index={i} total={FORMATS.length} radius={2.4} />)}
        {logoPhase && (
          <Float speed={1.2} floatIntensity={0.4}>
            <Html center distanceFactor={6} style={{ pointerEvents: "none", textAlign: "center" }}>
              <div style={{ fontFamily: "sans-serif" }}>
                <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", textShadow: "0 0 24px rgba(59,130,246,0.9)" }}>
                  Doclify<span style={{ color: PALETTE.cyan }}>AI</span>
                </div>
                <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 6, letterSpacing: 0.3 }}>
                  Convert Anything. Create Everything. Instantly.
                </div>
              </div>
            </Html>
          </Float>
        )}
      </ParallaxRig>
    </>
  );
}

/* ── Export ───────────────────────────────────────────────────────── */
export function CinematicHero() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (reduceMotion) {
    return <div className="w-full h-full" style={{ background: PALETTE.bg }} />;
  }

  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 55 }} style={{ background: "transparent" }} dpr={[1, 1.75]}>
      <Scene />
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
