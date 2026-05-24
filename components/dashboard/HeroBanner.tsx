"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Zap, Shield, Clock, Users } from "lucide-react";

// Load Three.js scene client-only (no SSR)
const HeroScene = dynamic(
  () => import("@/components/3d/HeroScene").then((m) => m.HeroScene),
  { ssr: false }
);

const pills = [
  { icon: Zap,    label: "AI Powered" },
  { icon: Shield, label: "Secure" },
  { icon: Clock,  label: "Lightning Fast" },
  { icon: Users,  label: "50K+ Users" },
];

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white"
      style={{ minHeight: 260 }}>

      {/* Ambient glows */}
      <div className="absolute -top-10 -right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 3D Scene — right side */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none">
        <HeroScene />
      </div>

      {/* Content — left side */}
      <div className="relative z-10 p-6 sm:p-8 max-w-[56%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30
                          rounded-full px-3 py-1 text-xs text-blue-300 mb-4">
            <Zap size={11} className="text-amber-400" />
            New: AI-powered document intelligence
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">
            All-in-One Document &{" "}
            <br className="hidden sm:block" />
            Business Solution with{" "}
            <span className="bg-amber-400 text-black px-2 py-0.5 rounded-md inline-block">
              powerful AI.
            </span>
          </h1>

          <p className="text-slate-400 text-sm mb-6 max-w-sm">
            Convert documents, generate invoices, scan receipts, and manage your
            business ledger — all in one place.
          </p>

          <div className="flex flex-wrap gap-2">
            {pills.map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 bg-white/10 border border-white/10
                           rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
              >
                <pill.icon size={12} className="text-amber-400" />
                {pill.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
