"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LayoutTemplate, FileText, Receipt, Clipboard, Search, Star, Download } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  { id: 1, icon: Receipt, title: "GST Invoice", category: "Invoice", color: "bg-emerald-500", uses: "2.4K uses", starred: true },
  { id: 2, icon: Receipt, title: "Proforma Invoice", category: "Invoice", color: "bg-blue-500", uses: "1.8K uses", starred: false },
  { id: 3, icon: Clipboard, title: "Delivery Challan", category: "Challan", color: "bg-amber-500", uses: "3.1K uses", starred: true },
  { id: 4, icon: Clipboard, title: "Payment Challan", category: "Challan", color: "bg-purple-500", uses: "980 uses", starred: false },
  { id: 5, icon: FileText, title: "Business Letter", category: "Document", color: "bg-rose-500", uses: "1.2K uses", starred: false },
  { id: 6, icon: FileText, title: "Purchase Order", category: "Document", color: "bg-cyan-500", uses: "760 uses", starred: false },
  { id: 7, icon: Receipt, title: "Credit Note", category: "Invoice", color: "bg-orange-500", uses: "540 uses", starred: false },
  { id: 8, icon: FileText, title: "Quotation", category: "Document", color: "bg-indigo-500", uses: "1.5K uses", starred: false },
];

const categories = ["All", "Invoice", "Challan", "Document"];

export default function TemplatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = templates.filter(t =>
    (activeCategory === "All" || t.category === activeCategory) &&
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <LayoutTemplate size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Templates</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ready-to-use document templates</p>
              </div>
            </motion.div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex-1 max-w-sm">
                <Search size={15} className="text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
              </div>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((t, i) => (
                <motion.div key={t.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                  <div className={`h-24 ${t.color} flex items-center justify-center relative`}>
                    <t.icon size={36} className="text-white/80" />
                    {t.starred && (
                      <Star size={14} className="absolute top-2 right-2 text-amber-300 fill-amber-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.uses}</p>
                    <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-600 rounded-lg py-1.5 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all">
                      <Download size={12} /> Use Template
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
