"use client";

import { motion } from "framer-motion";
import { Plus, Receipt, Clipboard, ScanText, UserPlus } from "lucide-react";
import Link from "next/link";

const actions = [
  { icon: Receipt, label: "Create Invoice", href: "/invoice", color: "bg-blue-500" },
  { icon: Clipboard, label: "Create Challan", href: "/challan", color: "bg-purple-500" },
  { icon: ScanText, label: "Scan Document", href: "/ocr", color: "bg-emerald-500" },
  { icon: UserPlus, label: "Add Customer", href: "/ledger", color: "bg-amber-500" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
        >
          <Link href={action.href}>
            <div className="flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div
                className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <action.icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight">
                {action.label}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
