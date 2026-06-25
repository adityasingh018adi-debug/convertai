"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Receipt,
  Clipboard,
  ScanText,
  UserPlus,
  FileType,
} from "lucide-react";
import { getHistory, timeAgo, type HistoryItem, type HistoryType } from "@/lib/history";

const quickActions = [
  { icon: Receipt, label: "Create Invoice", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/30", href: "/invoice" },
  { icon: Clipboard, label: "Create Challan", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30", href: "/challan" },
  { icon: ScanText, label: "Scan Document", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30", href: "/ocr" },
  { icon: UserPlus, label: "Add Customer", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30", href: "/ledger" },
];

const TYPE_ICON: Record<HistoryType, typeof Receipt> = {
  "word-to-pdf": FileType,
  "pdf-to-word": FileType,
  invoice: Receipt,
  challan: Clipboard,
  ocr: ScanText,
};
const TYPE_BG: Record<HistoryType, string> = {
  "word-to-pdf": "bg-blue-100 dark:bg-blue-900/40 text-blue-600",
  "pdf-to-word": "bg-rose-100 dark:bg-rose-900/40 text-rose-600",
  invoice: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600",
  challan: "bg-purple-100 dark:bg-purple-900/40 text-purple-600",
  ocr: "bg-amber-100 dark:bg-amber-900/40 text-amber-600",
};

const proFeatures = [
  "Unlimited Conversions",
  "AI Invoice & Challan",
  "Advanced OCR",
  "Bulk Processing",
  "No Watermark",
  "Priority Support",
];

export function RightPanel() {
  const [recentActivity, setRecentActivity] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setRecentActivity(getHistory().slice(0, 5));
  }, []);

  return (
    <aside className="hidden xl:flex w-72 flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 hover:shadow-sm cursor-pointer ${action.bg}`}
                >
                  <div className={`p-1.5 rounded-lg ${action.bg}`}>
                    <action.icon size={16} className={action.color} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400">Nothing yet — use a tool to see your activity here.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_BG[item.type]}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {item.meta}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upgrade to Pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#0f172a] rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h4 className="text-sm font-bold">Upgrade to Pro</h4>
              <p className="text-xs text-slate-400">Unlock all features</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-4">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                <Plus size={12} className="text-amber-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/upgrade" className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-2.5 rounded-xl transition-colors duration-200">
            Upgrade Now →
          </Link>
        </motion.div>
      </div>
    </aside>
  );
}
