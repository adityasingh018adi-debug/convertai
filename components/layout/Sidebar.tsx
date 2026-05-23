"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  FileText,
  FileOutput,
  Receipt,
  Clipboard,
  ScanText,
  BookOpen,
  Clock,
  LayoutTemplate,
  Archive,
  Trash2,
  Sun,
  Moon,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "CONVERT & TOOLS",
    items: [
      { icon: FileText, label: "Word to PDF", href: "/word-to-pdf" },
      { icon: FileOutput, label: "PDF to Word", href: "/pdf-to-word" },
      { icon: Receipt, label: "AI Invoice Maker", href: "/invoice" },
      { icon: Clipboard, label: "AI Challan Maker", href: "/challan" },
      { icon: ScanText, label: "OCR Scanner", href: "/ocr" },
      { icon: BookOpen, label: "Khatabook (Ledger)", href: "/ledger" },
    ],
  },
  {
    section: "OTHER TOOLS",
    items: [
      { icon: Clock, label: "Recent Files", href: "/recent" },
      { icon: LayoutTemplate, label: "Templates", href: "/templates" },
      { icon: Archive, label: "Saved Documents", href: "/saved" },
      { icon: Trash2, label: "Trash", href: "/trash" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0f172a] transition-transform duration-300",
          "md:relative md:translate-x-0 md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span
              className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient"
              style={{ backgroundSize: "200% 200%" }}
            >
              ConvertAI
            </span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group) => (
            <div key={group.section}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                {group.section}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <item.icon size={17} className="shrink-0" />
                        <span>{item.label}</span>
                        {active && (
                          <ChevronRight size={14} className="ml-auto opacity-70" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User + dark mode */}
        <div className="px-3 pb-4 border-t border-slate-700 pt-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                Aditya Singh
              </p>
              <p className="text-xs text-slate-500 truncate">
                adityasingh018adi@gmail.com
              </p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <span className="text-xs text-slate-400">
              {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className={cn(
                "w-9 h-5 rounded-full relative transition-colors duration-300",
                mounted && theme === "dark" ? "bg-blue-600" : "bg-slate-600"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center",
                  mounted && theme === "dark"
                    ? "translate-x-4"
                    : "translate-x-0.5"
                )}
              >
                {mounted && theme === "dark" ? (
                  <Moon size={8} className="text-blue-600" />
                ) : (
                  <Sun size={8} className="text-amber-500" />
                )}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
