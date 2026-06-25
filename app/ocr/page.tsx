"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import {
  ScanText, Upload, X, Copy, Download, CheckCircle,
  Loader2, FileText, AlertCircle, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { addHistoryItem } from "@/lib/history";

// "helloworld" is OCR.space's shared public demo key — heavily rate-limited
// across every site that uses it. Get a free key at https://ocr.space/ocrapi
// and set NEXT_PUBLIC_OCR_API_KEY to avoid random throttling under real traffic.
const OCR_API_KEY = process.env.NEXT_PUBLIC_OCR_API_KEY || "helloworld";

const FEATURES = [
  { icon: ScanText,  color: "text-cyan-500",    label: "Smart OCR",      desc: "AI-powered extraction"  },
  { icon: FileText,  color: "text-blue-500",    label: "PDF & Images",   desc: "JPG, PNG, PDF"          },
  { icon: Copy,      color: "text-violet-500",  label: "Copy Instantly", desc: "One-click clipboard"    },
  { icon: Download,  color: "text-emerald-500", label: "Download .txt",  desc: "Save extracted text"    },
];

export default function OcrPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file,        setFile]        = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string>("");
  const [isDragging,  setIsDragging]  = useState(false);
  const [scanning,    setScanning]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [result,      setResult]      = useState("");
  const [copied,      setCopied]      = useState(false);
  const [error,       setError]       = useState("");

  const reset = () => { setFile(null); setPreview(""); setResult(""); setError(""); setProgress(0); };

  const loadFile = (f: File) => {
    setFile(f); setResult(""); setError(""); setProgress(0);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else { setPreview(""); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, []);

  const handleScan = async () => {
    if (!file) return;
    setScanning(true); setError(""); setProgress(15);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("apikey", OCR_API_KEY);
      form.append("language", "eng");
      form.append("isOverlayRequired", "false");
      form.append("detectOrientation", "true");
      form.append("scale", "true");
      form.append("OCREngine", "2");

      setProgress(45);
      const resp = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: form });
      setProgress(85);
      const data = await resp.json();

      if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] ?? "OCR processing failed");

      const text = data.ParsedResults
        ?.map((r: { ParsedText: string }) => r.ParsedText)
        .join("\n").trim();

      if (!text) throw new Error("No text found. Try a higher quality image.");
      setResult(text); setProgress(100);
      addHistoryItem("ocr", file.name, `${text.split(/\s+/).filter(Boolean).length} words extracted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed. Try a clearer image.");
    } finally { setScanning(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = (file?.name ?? "extracted").replace(/\.[^/.]+$/, "") + ".txt";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-200 dark:shadow-cyan-900/40 shrink-0">
                  <ScanText size={26} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 dark:text-white">
                    OCR <span className="text-cyan-500">Scanner</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-500" />
                    Extract text from images &amp; PDFs instantly
                  </p>
                </div>
              </motion.div>

              {/* Drop zone */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "relative rounded-3xl border-2 transition-all duration-200 overflow-hidden",
                    isDragging ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 scale-[1.01]" :
                    file       ? "border-cyan-300 bg-cyan-50/50 dark:bg-cyan-900/10 dark:border-cyan-700" :
                    "border-dashed border-cyan-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-cyan-300"
                  )}>
                  <input type="file" accept="image/*,.pdf"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                  {file ? (
                    <div className="flex gap-5 p-6 items-center">
                      {preview ? (
                        <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-cyan-200 dark:border-cyan-800 shrink-0" />
                      ) : (
                        <div className="w-24 h-24 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={32} className="text-cyan-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                        <button onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="relative z-20 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium mt-3">
                          <X size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-10 px-6 pointer-events-none">
                      <div className="relative">
                        <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Upload size={22} className="text-white" />
                        </motion.div>
                        <motion.div animate={{ y: [-5, 2, -5], rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}
                          className="absolute -top-2 -left-9 bg-white dark:bg-slate-700 rounded-lg px-2 py-0.5 shadow-lg border border-slate-100 dark:border-slate-600 text-xs font-black text-cyan-600">IMG</motion.div>
                        <motion.div animate={{ y: [2, -5, 2], rotate: [5, -5, 5] }} transition={{ duration: 3.2, repeat: Infinity }}
                          className="absolute -top-1 -right-9 bg-white dark:bg-slate-700 rounded-lg px-1.5 py-0.5 shadow-lg border border-slate-100 dark:border-slate-600 text-xs font-black text-teal-600">PDF</motion.div>
                      </div>
                      <div className="text-center space-y-1.5">
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">Drop your image or PDF here</p>
                        <p className="text-xs text-slate-400">or</p>
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-lg">
                          <ScanText size={13} /> Browse Files
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">JPG, PNG, PDF · Max 5 MB</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                {!result ? (
                  <>
                    <button onClick={handleScan} disabled={!file || scanning}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
                        !file    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none" :
                        scanning ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white opacity-80 cursor-wait" :
                        "bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white shadow-cyan-200 dark:shadow-cyan-900/40"
                      )}>
                      {scanning ? <><Loader2 size={16} className="animate-spin" /> Extracting…</> : <><ScanText size={16} /> Extract Text</>}
                    </button>
                    {scanning && (
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                          initial={{ width: "15%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    )}
                    {!scanning && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <ScanText size={11} className="text-cyan-500" />
                        Powered by OCR.space · Supports 25+ languages
                      </p>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={17} className="text-emerald-500" />
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Extracted!</p>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          {result.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCopy}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          {copied ? <><CheckCircle size={11} className="text-emerald-500" />Copied!</> : <><Copy size={11} />Copy</>}
                        </button>
                        <button onClick={handleDownload}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors">
                          <Download size={11} />.txt
                        </button>
                        <button onClick={reset}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors">
                          <X size={11} />New Scan
                        </button>
                      </div>
                    </div>
                    <textarea readOnly value={result} rows={12}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 p-4 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed" />
                  </motion.div>
                )}
              </motion.div>

              {/* Feature badges */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FEATURES.map((f) => (
                  <div key={f.label} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                    <f.icon size={16} className={cn("mx-auto mb-1.5", f.color)} />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{f.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </motion.div>

              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
