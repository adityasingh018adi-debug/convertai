"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { Clock, FileText, FileOutput, Receipt, Clipboard, ScanText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { getHistory, removeHistoryItem, timeAgo, type HistoryItem, type HistoryType } from "@/lib/history";
import { showToast } from "@/lib/toast";

const ICONS: Record<HistoryType, typeof FileText> = {
  "word-to-pdf": FileText,
  "pdf-to-word": FileOutput,
  invoice: Receipt,
  challan: Clipboard,
  ocr: ScanText,
};
const COLORS: Record<HistoryType, string> = {
  "word-to-pdf": "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  "pdf-to-word": "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  invoice: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  challan: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  ocr: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
};
const LABELS: Record<HistoryType, string> = {
  "word-to-pdf": "Conversion",
  "pdf-to-word": "Conversion",
  invoice: "Invoice",
  challan: "Challan",
  ocr: "OCR",
};

export default function RecentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getHistory());
    setHydrated(true);
  }, []);

  const handleRemove = (id: string) => {
    removeHistoryItem(id);
    setItems(getHistory());
    showToast("Removed from recent files.", "success");
  };

  if (!hydrated) return <PageSkeleton sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />;

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
                <p className="text-sm text-slate-500 dark:text-slate-400">Your recently used tools on this device</p>
              </div>
            </motion.div>

            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <Clock size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="font-bold text-slate-700 dark:text-slate-200">No recent activity yet</p>
                <p className="text-sm text-slate-400 mt-1">Use any tool — Word to PDF, OCR, Invoice Maker — and it&apos;ll show up here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {items.map((item, i) => {
                  const Icon = ICONS[item.type];
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${COLORS[item.type]}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{LABELS[item.type]} · {item.meta} · {timeAgo(item.createdAt)}</p>
                      </div>
                      <button onClick={() => handleRemove(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove ${item.name} from recent files`}>
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
