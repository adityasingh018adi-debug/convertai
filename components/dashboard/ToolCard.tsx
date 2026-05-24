"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient: string;
  delay?: number;
}

export function ToolCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
  delay = 0,
}: ToolCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* mouse position relative to card center (-0.5 … 0.5) */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const cfg = { stiffness: 280, damping: 28 };
  const smx = useSpring(mx, cfg);
  const smy = useSpring(my, cfg);

  /* 3-D rotation — max ±14° */
  const rotX  = useTransform(smy, [-0.5, 0.5], [" 14deg", "-14deg"]);
  const rotY  = useTransform(smx, [-0.5, 0.5], ["-14deg", " 14deg"]);

  /* glare position */
  const glareX = useTransform(smx, [-0.5, 0.5], ["0%",   "100%"]);
  const glareY = useTransform(smy, [-0.5, 0.5], ["0%",   "100%"]);
  const glareO = useTransform(
    [smx, smy],
    ([x, y]: number[]) => Math.sqrt(x * x + y * y) * 0.6
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width  - 0.5);
    my.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
        }}
        className="relative bg-white dark:bg-slate-800 rounded-2xl p-5
                   border border-slate-100 dark:border-slate-700
                   shadow-sm hover:shadow-xl transition-shadow duration-200
                   cursor-pointer overflow-hidden"
      >
        {/* Moving glare */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.18) 0%, transparent 65%)`,
            opacity: glareO,
          }}
        />

        {/* Icon — elevated in Z */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${gradient}
                      shadow-lg`}
          style={{ transform: "translateZ(20px)" }}
        >
          <Icon size={22} className="text-white" />
        </div>

        {/* Text */}
        <h3
          className="text-sm font-bold text-slate-800 dark:text-white mb-1"
          style={{ transform: "translateZ(14px)" }}
        >
          {title}
        </h3>
        <p
          className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4"
          style={{ transform: "translateZ(10px)" }}
        >
          {description}
        </p>

        <Link href={href} style={{ transform: "translateZ(18px)", display: "block" }}>
          <button className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400
                             border border-blue-200 dark:border-blue-700 rounded-lg py-2
                             hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:border-blue-400 transition-all duration-200">
            Open Tool →
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
