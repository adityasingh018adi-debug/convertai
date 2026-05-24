"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LayoutTemplate, Receipt, Clipboard, User, Search, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const templates = [
  {
    id: 1,
    icon: Receipt,
    title: "GST Invoice",
    desc: "Professional GST-compliant invoice with auto tax calculation.",
    category: "Invoice",
    color: "from-emerald-500 to-emerald-700",
    uses: "2.4K uses",
    starred: true,
    href: "/invoice",
  },
  {
    id: 2,
    icon: Clipboard,
    title: "Delivery Challan",
    desc: "Generate delivery challans with vehicle & item details.",
    category: "Challan",
    color: "from-amber-500 to-orange-600",
    uses: "3.1K uses",
    starred: true,
    href: "/challan",
  },
  {
    id: 3,
    icon: User,
    title: "Resume",
    desc: "Beautiful professional resume — fill, preview & download as PDF.",
    category: "Resume",
    color: "from-blue-500 to-indigo-700",
    uses: "5.2K uses",
    starred: true,
    href: "/resume",
  },
];

const categories = ["All", "Invoice", "Challan", "Resume"];

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

            {/* Header */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((t, i) => (
                <motion.div key={t.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">

                  {/* Thumbnail */}
                  <div className={`h-36 bg-gradient-to-br ${t.color} flex flex-col items-center justify-center relative gap-2`}>
                    <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <t.icon size={32} className="text-white" />
                    </div>
                    <Star size={14} className="absolute top-3 right-3 text-amber-300 fill-amber-300" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 rounded-lg px-2 py-0.5">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">₹99</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                    <div className="flex items-center justify-between mt-2 mb-3">
                      <p className="text-xs text-slate-400">{t.uses}</p>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t.category}</span>
                    </div>
                    <Link href={t.href}>
                      <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl py-2 bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all">
                        <ShoppingCart size={11} /> Use Template
                      </button>
                    </Link>
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
