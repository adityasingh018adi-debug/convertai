"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DragDropZone } from "@/components/ui/DragDropZone";
import { FileText, CheckCircle, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { step: "1", title: "Upload Word file", desc: "Drag & drop your .docx or .doc file" },
  { step: "2", title: "AI Processing", desc: "Our engine converts with perfect formatting" },
  { step: "3", title: "Download PDF", desc: "Get your PDF instantly, ready to share" },
];

export default function WordToPdfPage() {
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  Word to PDF
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Convert .docx / .doc to PDF with perfect formatting
                </p>
              </div>
            </motion.div>

            {/* Steps */}
            <div className="flex flex-col sm:flex-row gap-3">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 flex-1 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="h-56"
            >
              <DragDropZone />
            </motion.div>

            {/* Convert button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <button
                onClick={() => setConverted(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 shadow-md shadow-blue-200 dark:shadow-blue-900/40"
              >
                Convert to PDF <ArrowRight size={16} />
              </button>
            </motion.div>

            {/* Result */}
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
                      document.pdf — 245 KB
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                  <Download size={14} />
                  Download PDF
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
