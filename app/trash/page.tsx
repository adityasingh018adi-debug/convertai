"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Trash2, FileText, Receipt, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const trashItems = [
  { id: 1, icon: Receipt, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", name: "Invoice INV-2801 — Old Client", type: "Invoice", deleted: "3 days ago" },
  { id: 2, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "Draft Proposal v1.pdf", type: "PDF", deleted: "5 days ago" },
  { id: 3, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "Old Contract 2024.docx", type: "Word", deleted: "7 days ago" },
];

export default function TrashPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState(trashItems);

  const restore = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Trash2 size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Trash</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Items are deleted permanently after 30 days</p>
                </div>
              </div>
              {items.length > 0 && (
                <button onClick={() => setItems([])}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Empty Trash
                </button>
              )}
            </motion.div>

            {items.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Trash2 size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Trash is empty</p>
                <p className="text-slate-400 text-sm mt-1">Deleted files will appear here</p>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {items.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} opacity-60`}>
                      <item.icon size={18} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate line-through">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.type} · Deleted {item.deleted}</p>
                    </div>
                    <button onClick={() => restore(item.id)}
                      className="flex items-center gap-1.5 p-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all">
                      <RotateCcw size={13} /> Restore
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
