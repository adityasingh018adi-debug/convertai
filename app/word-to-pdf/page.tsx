"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { FileText, CheckCircle, ArrowRight, Upload, X, File, Printer, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { step: "1", title: "Upload Word File", desc: "Drop your .docx file below" },
  { step: "2", title: "Convert", desc: "Click convert to process" },
  { step: "3", title: "Save as PDF", desc: "Print dialog → Save as PDF" },
];

export default function WordToPdfPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [error, setError] = useState("");

  const reset = () => { setFile(null); setConverted(false); setError(""); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setConverted(false); setError(""); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setConverted(false); setError(""); }
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammothMod = await import("mammoth");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mammoth = (mammothMod as any).default ?? mammothMod;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (mammoth as any).convertToHtml({ arrayBuffer });
      const html: string = result.value || "<p>No content found.</p>";

      const docTitle = file.name.replace(/\.docx?$/i, "");

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${docTitle}</title>
<style>
  @page {
    size: A4;
    margin: 1.8cm 2cm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #000;
    background: #fff;
  }
  h1 { font-size: 18pt; font-weight: bold; margin: 14px 0 6px; page-break-after: avoid; }
  h2 { font-size: 15pt; font-weight: bold; margin: 12px 0 5px; page-break-after: avoid; }
  h3 { font-size: 13pt; font-weight: bold; margin: 10px 0 4px; page-break-after: avoid; }
  h4 { font-size: 12pt; font-weight: bold; margin: 8px 0 3px; page-break-after: avoid; }
  p  { margin: 0 0 6px; orphans: 3; widows: 3; }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    page-break-inside: auto;
  }
  tr  { page-break-inside: avoid; page-break-after: auto; }
  td, th {
    border: 1px solid #555;
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #f0f0f0; font-weight: bold; }
  ul, ol { margin: 5px 0 5px 20px; }
  li { margin: 2px 0; page-break-inside: avoid; }
  img { max-width: 100%; height: auto; display: block; }
  strong, b { font-weight: bold; }
  em, i    { font-style: italic; }
  u        { text-decoration: underline; }
  hr { border: none; border-top: 1px solid #aaa; margin: 8px 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
${html}
<script>
  window.onload = function() {
    // Small delay so images load
    setTimeout(function() { window.print(); }, 600);
  };
<\/script>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "width=900,height=700");
      if (!win) {
        setError("Popup blocked. Please allow popups for this site and try again.");
        URL.revokeObjectURL(url);
        return;
      }
      // Clean up the blob URL after the window has loaded
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setConverted(true);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please ensure the file is a valid .docx document.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Word to PDF</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Perfect A4 PDF — all tables, images & formatting preserved</p>
              </div>
            </motion.div>

            {/* How it works banner */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                After clicking <strong>Convert</strong>, a print window opens automatically.
                Set <strong>Destination → Save as PDF</strong> and click Save. This gives pixel-perfect A4 pages with no content cut.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3">
              {steps.map((s, i) => (
                <div key={s.step} className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                  i === 0 && file ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700" :
                  i === 1 && converting ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700" :
                  i === 2 && converted ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700" :
                  "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0",
                    i === 2 && converted ? "bg-emerald-500" : i === 1 && converting ? "bg-amber-500" : "bg-blue-500"
                  )}>{s.step}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Drop Zone */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-52",
                  isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]" :
                  file ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-700" :
                  "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-blue-50/30"
                )}>
                <input type="file" accept=".doc,.docx" onChange={handleFileInput}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
                {file ? (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                      <File size={28} className="text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Word Document</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1">
                      <X size={12} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 pointer-events-none">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                      <Upload size={26} className="text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag & drop your Word file here</p>
                      <p className="text-xs text-slate-400 mt-1">or <span className="text-blue-500 font-semibold">browse to upload</span></p>
                      <p className="text-xs text-slate-400 mt-2">Supports .doc, .docx · Max 50MB</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center gap-3">
              <button onClick={handleConvert} disabled={!file || converting}
                className={cn(
                  "flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200",
                  !file ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed" :
                  converting ? "bg-blue-400 text-white cursor-wait" :
                  "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                )}>
                {converting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                ) : (
                  <><Printer size={16} />Convert & Open Print View<ArrowRight size={15} /></>
                )}
              </button>
              {!file && <p className="text-xs text-slate-400">Upload a Word file first</p>}
            </motion.div>

            {converted && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={22} className="text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Print window opened!</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-xl p-3 space-y-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold">To save as PDF:</p>
                  <p>1. In the print dialog → <strong>Destination</strong> → select <strong>"Save as PDF"</strong></p>
                  <p>2. Set <strong>Paper size: A4</strong></p>
                  <p>3. Click <strong>Save</strong> and choose where to save</p>
                </div>
                <button onClick={handleConvert}
                  className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                  Open print window again →
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
