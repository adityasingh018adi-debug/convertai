"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Clock, Users } from "lucide-react";

const pills = [
  { icon: Zap, label: "AI Powered" },
  { icon: Shield, label: "Secure" },
  { icon: Clock, label: "Lightning Fast" },
  { icon: Users, label: "50K+ Users" },
];

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating icons */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-4 top-4 sm:right-10 sm:top-6 w-12 h-14 bg-gradient-to-b from-red-500 to-red-700 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-red-900/40"
      >
        <div className="w-5 h-1.5 bg-white/70 rounded-full mb-1" />
        <div className="w-5 h-1.5 bg-white/70 rounded-full mb-1" />
        <div className="w-5 h-1.5 bg-white/70 rounded-full" />
        <span className="text-white text-xs font-bold mt-1">PDF</span>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-20 sm:right-32 top-4 sm:top-8 w-11 h-13 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-blue-900/40"
      >
        <div className="w-4 h-1 bg-white/70 rounded-full mb-1" />
        <div className="w-4 h-1 bg-white/70 rounded-full mb-1" />
        <div className="w-4 h-1 bg-white/70 rounded-full" />
        <span className="text-white text-xs font-bold mt-1">DOC</span>
      </motion.div>

      <motion.div
        animate={{ y: [-2, 6, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-36 sm:right-52 top-8 sm:top-12 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/40"
      >
        <span className="text-white text-xs font-bold">AI</span>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-lg"
      >
        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-xs text-blue-300 mb-4">
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
              className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <pill.icon size={12} className="text-amber-400" />
              {pill.label}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
