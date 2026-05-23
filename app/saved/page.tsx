"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Archive, FileText, Receipt, Clipboard, Download, Trash2, Search, ScanText } from "lucide-react";
import { motion } from "framer-motion";

const savedDocs = [
  { id: 1, icon: Receipt, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", name: "Invoice INV-2847 - Sharma Electronics", type: "Invoice", size: "245 KB", date: "24 May 2025" },
  { id: 2, icon: Clipboard, iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600", name: "Challan CH-0192 - Delhi Supplies Co.", type: "Challan", size: "189 KB", date: "23 May 2025" },
  { id: 3, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "Project Proposal - ConvertAI.pdf", type: "PDF", size: "1.2 MB", date: "20 May 2025" },
  { id: 4, icon: Receipt, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600", name: "Invoice INV-2846 - Kumar Wholesale", type: "Invoice", size: "198 KB", date: "18 May 2025" },
  { id: 5, icon: ScanText, iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600", name: "Scanned Receipt - Singh & Co.", type: "OCR", size: "87 KB", date: "15 May 2025" },
  { id: 6, icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600", name: "Business Quotation - Q2 2025.docx", type: "Word", size: "345 KB", date: "10 May 2025" },
];

export default function SavedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = savedDocs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <Archive size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Saved Documents</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{savedDocs.length} documents saved</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 max-w-sm">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {filtered.map((doc, i) => (
                <motion.div key={doc.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.iconBg}`}>
                    <doc.icon size={18} className={doc.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.type} · {doc.size} · {doc.date}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                      <Download size={15} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
