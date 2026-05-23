"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${gradient}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        {description}
      </p>
      <Link href={href}>
        <button className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all duration-200">
          Open Tool →
        </button>
      </Link>
    </motion.div>
  );
}
