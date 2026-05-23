"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  rawValue: number;
  prefix?: string;
  change: number;
  changeLabel: string;
}

function useCountUp(end: number, duration = 1500, start = 0) {
  const [count, setCount] = useState(start);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, start]);

  return count;
}

function formatValue(value: number, prefix: string = ""): string {
  return prefix + new Intl.NumberFormat("en-IN").format(value);
}

export function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  rawValue,
  prefix = "",
  change,
  changeLabel,
}: MetricCardProps) {
  const animatedValue = useCountUp(rawValue, 1800);
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-800 dark:text-white mb-0.5">
        {formatValue(animatedValue, prefix)}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>
    </div>
  );
}
