"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LayoutTemplate, FileText, Receipt, Clipboard, Search, Star, ShoppingCart, Lock } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  { id: 1, icon: Receipt,   title: "GST Invoice",      category: "Invoice",  color: "from-emerald-500 to-emerald-700", uses: "2.4K uses", starred: true,  available: true  },
  { id: 2, icon: Receipt,   title: "Proforma Invoice", category: "Invoice",  color: "from-blue-500 to-blue-700",     uses: "1.8K uses", starred: false, available: false },
  { id: 3, icon: Clipboard, title: "Delivery Challan", category: "Challan", color: "from-amber-500 to-orange-600",  uses: "3.1K uses", starred: true,  available: true  },
  { id: 4, icon: Clipboard, title: "Payment Challan",  category: "Challan", color: "from-purple-500 to-purple-700", uses: "980 uses",  starred: false, available: false },
  { id: 5, icon: FileText,  title: "Business Letter",  category: "Document", color: "from-rose-500 to-rose-700",    uses: "1.2K uses", starred: false, available: false },
  { id: 6, icon: FileText,  title: "Purchase Order",   category: "Document", color: "from-cyan-500 to-cyan-700",    uses: "760 uses",  starred: false, available: false },
  { id: 7, icon: Receipt,   title: "Credit Note",      category: "Invoice",  color: "from-orange-500 to-red-600",   uses: "540 uses",  starred: false, available: false },
  { id: 8, icon: FileText,  title: "Quotation",        category: "Document", color: "from-indigo-500 to-indigo-700",uses: "1.5K uses", starred: false, available: false },
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
              className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <LayoutTemplate size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Templates</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Professional document templates · ₹99 each</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2">
                <ShoppingCart size={14} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Instant download · ₹99</span>
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
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
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

                  {/* Thumbnail */}
                  <div className={`h-28 bg-gradient-to-br ${t.color} flex items-center justify-center relative`}>
                    <t.icon size={38} className="text-white/80" />
                    {t.starred && (
                      <Star size={14} className="absolute top-2 right-2 text-amber-300 fill-amber-300" />
                    )}
                    {!t.available && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-black/60 rounded-lg px-2 py-1 flex items-center gap-1">
                          <Lock size={10} className="text-white" />
                          <span className="text-white text-xs font-semibold">Coming Soon</span>
                        </div>
                      </div>
                    )}
                    {/* Price badge */}
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 rounded-lg px-2 py-0.5">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">₹99</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{t.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-slate-400">{t.uses}</p>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t.category}</span>
                    </div>
                    <button
                      disabled={!t.available}
                      className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-1.5 transition-all ${
                        t.available
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      }`}>
                      <ShoppingCart size={11} />
                      {t.available ? "Buy · ₹99" : "Coming Soon"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info banner */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">More templates coming soon</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Each template is ₹99 — professionally designed, ready to fill and download as PDF instantly.
                </p>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
