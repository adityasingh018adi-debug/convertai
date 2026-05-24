"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  FileText, FileOutput, Receipt, Clipboard, ScanText,
  BookOpen, Clock, LayoutTemplate, Archive, ChevronRight,
  Sparkles, Crown, X, Sun, Moon, Shield, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  {
    section: "CONVERT & TOOLS",
    icon: Zap,
    items: [
      { label: "Word to PDF",       href: "/word-to-pdf", gradient: "from-violet-500 to-blue-600",   text: "W"  },
      { label: "PDF to Word",       href: "/pdf-to-word", gradient: "from-red-500 to-rose-600",      icon: FileOutput },
      { label: "AI Invoice Maker",  href: "/invoice",     gradient: "from-emerald-500 to-green-600", icon: Receipt    },
      { label: "AI Challan Maker",  href: "/challan",     gradient: "from-orange-500 to-amber-500",  icon: Clipboard  },
      { label: "OCR Scanner",       href: "/ocr",         gradient: "from-cyan-500 to-teal-600",     icon: ScanText   },
      { label: "Khatabook (Ledger)",href: "/ledger",      gradient: "from-violet-500 to-purple-700", icon: BookOpen   },
    ],
  },
  {
    section: "OTHER TOOLS",
    icon: LayoutTemplate,
    items: [
      { label: "Recent Files",      href: "/recent",    gradient: "from-blue-500 to-cyan-500",      icon: Clock          },
      { label: "Templates",         href: "/templates", gradient: "from-indigo-500 to-purple-600",  icon: LayoutTemplate },
      { label: "Saved Documents",   href: "/saved",     gradient: "from-rose-500 to-pink-600",      icon: Archive        },
    ],
  },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

type LucideIcon = React.FC<{ size?: number; className?: string }>;

function NavIcon({ item }: { item: { gradient: string; text?: string; icon?: LucideIcon } }) {
  const Icon = item.icon;
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
      {item.text
        ? <span className="text-white text-xs font-black">{item.text}</span>
        : Icon ? <Icon size={16} className="text-white" /> : null}
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0d1117] border-r border-white/5 transition-transform duration-300",
        "md:relative md:translate-x-0 md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" onClick={onClose}>
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
                  <span className="text-white text-sm font-black">CA</span>
                </div>
                <Sparkles size={10} className="absolute -top-1 -right-1 text-amber-400" />
              </div>
              <div>
                <span className="text-lg font-black bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ConvertAI
                </span>
                <p className="text-xs text-slate-500 leading-none mt-0.5">Smart Tools, Simple Solutions</p>
              </div>
            </Link>
            <button onClick={onClose} className="md:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <group.icon size={12} className="text-violet-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{group.section}</p>
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onClose}>
                        <motion.div
                          whileHover={{ x: 2 }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                            active
                              ? "bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 text-white"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                          )}>
                          <NavIcon item={item} />
                          <span className="flex-1 truncate">{item.label}</span>
                          <ChevronRight size={14} className={cn(
                            "shrink-0 transition-colors",
                            active ? "text-violet-400" : "text-slate-600 group-hover:text-slate-400"
                          )} />
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Admin */}
          <div>
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <Shield size={12} className="text-violet-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ADMIN</p>
            </div>
            <Link href="/admin" onClick={onClose}>
              <motion.div whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  pathname === "/admin"
                    ? "bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-white" />
                </div>
                <span className="flex-1">Admin Dashboard</span>
                <ChevronRight size={14} className="shrink-0 text-slate-600 group-hover:text-slate-400" />
              </motion.div>
            </Link>
          </div>
        </nav>

        {/* Upgrade to Pro */}
        <div className="px-3 pb-3 shrink-0 space-y-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-blue-700 p-4">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-amber-300" />
              <span className="text-sm font-bold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-blue-200 mb-3">Unlock premium tools &amp; features</p>
            <button className="w-full flex items-center justify-center gap-1.5 bg-white text-violet-700 text-xs font-bold py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              <Sparkles size={12} /> Upgrade ✦
            </button>
          </div>

          {/* Dark mode toggle */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2">
              {mounted && theme === "dark"
                ? <Moon size={14} className="text-blue-400" />
                : <Sun size={14} className="text-amber-400" />}
              <span className="text-xs text-slate-400 font-medium">
                {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div className={cn("w-9 h-5 rounded-full relative transition-colors duration-300",
              mounted && theme === "dark" ? "bg-blue-600" : "bg-slate-600")}>
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                mounted && theme === "dark" ? "translate-x-4" : "translate-x-0.5")} />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
