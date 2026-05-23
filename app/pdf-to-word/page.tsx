"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DragDropZone } from "@/components/ui/DragDropZone";
import { FileOutput, CheckCircle, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PdfToWordPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [converted, setConverted] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <FileOutput size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  PDF to Word
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Convert PDF to editable .docx with AI-powered text extraction
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-56"
            >
              <DragDropZone />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setConverted(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 shadow-md shadow-purple-200 dark:shadow-purple-900/40"
              >
                Convert to Word <ArrowRight size={16} />
              </button>
            </motion.div>

            {converted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Conversion Complete!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      document.docx — 189 KB
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                  <Download size={14} />
                  Download Word
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
