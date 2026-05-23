"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DragDropZone } from "@/components/ui/DragDropZone";
import { ScanText, Copy, Download, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const mockExtracted = `Invoice No: INV-2847
Date: 24 May 2025
Bill To: Sharma Electronics, 123 MG Road, New Delhi

Items:
1. Web Development Services - ₹45,000
2. UI/UX Design - ₹20,000

Subtotal: ₹65,000
GST (18%): ₹11,700
Total: ₹76,700

Thank you for your business!`;

export default function OcrPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult(mockExtracted);
    }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <ScanText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  OCR Scanner
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Extract text from images and scanned documents with AI
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="h-52">
                  <DragDropZone />
                </div>
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  {scanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scanning with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Extract Text with OCR
                    </>
                  )}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Extracted Text
                  </h3>
                  {result && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium"
                      >
                        {copied ? (
                          <CheckCircle size={13} className="text-emerald-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium">
                        <Download size={13} />
                        Export
                      </button>
                    </div>
                  )}
                </div>
                {result ? (
                  <textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="flex-1 min-h-52 text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-600 outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="flex-1 min-h-52 flex items-center justify-center bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-400 text-center">
                      Upload an image or PDF and click
                      <br />
                      &quot;Extract Text&quot; to see results here
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
