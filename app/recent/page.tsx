"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Clock, FileText, Receipt, Clipboard, Download, ScanText } from "lucide-react";
import { motion } from "framer-motion";

const recentFiles = [
  { id: 1, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "Word to PDF — Project Proposal", type: "Conversion", time: "2 mins ago" },
  { id: 2, icon: Receipt, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", name: "Invoice INV-2847 — Sharma Electronics", type: "Invoice", time: "15 mins ago" },
  { id: 3, icon: Clipboard, iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600", name: "Challan CH-0192 — Delhi Supplies Co.", type: "Challan", time: "1 hr ago" },
  { id: 4, icon: ScanText, iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600", name: "OCR Scan — Receipt Singh & Co.", type: "OCR", time: "3 hrs ago" },
  { id: 5, icon: Receipt, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", name: "Invoice INV-2846 — Kumar Wholesale", type: "Invoice", time: "5 hrs ago" },
  { id: 6, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "PDF to Word — Contract Agreement", type: "Conversion", time: "Yesterday" },
];

export default function RecentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Recent Files</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your recently accessed documents</p>
              </div>
            </motion.div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {recentFiles.map((file, i) => (
                <motion.div key={file.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${file.iconBg}`}>
                    <file.icon size={18} className={file.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{file.type} · {file.time}</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Download size={15} />
                  </button>
                </motion.div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
