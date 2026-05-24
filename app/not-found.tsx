"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, FileOutput, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">

        {/* Animated 404 */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-8 inline-block">
          <div className="text-[10rem] font-black leading-none select-none"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </div>
          {/* Floating sparkles */}
          {[[-40, -20], [40, -30], [-30, 40], [50, 30]].map(([x, y], i) => (
            <motion.div key={i}
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              className="absolute"
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}>
              <Sparkles size={14 + i * 3} className="text-violet-400" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist.<br />
            Let&apos;s get you back to something useful.
          </p>

          {/* Quick links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-900/30 transition-all">
              <Home size={16} /> Back to Home
            </Link>
            <Link href="/word-to-pdf"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-6 py-3 rounded-xl border border-white/10 transition-all">
              <FileText size={16} /> Word to PDF
            </Link>
            <Link href="/pdf-to-word"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-6 py-3 rounded-xl border border-white/10 transition-all">
              <FileOutput size={16} /> PDF to Word
            </Link>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={12} /> Go back
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
