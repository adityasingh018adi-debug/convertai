"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import {
  FileText, CheckCircle, Download, ArrowRight,
  Upload, X, File, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { step: "1", title: "Upload Word File", desc: "Drop your .docx file below" },
  { step: "2", title: "Converting", desc: "Renders every page with exact colors" },
  { step: "3", title: "Download PDF", desc: "Direct save — no print dialog" },
];

export default function WordToPdfPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress]     = useState("");
  const [converted, setConverted]   = useState(false);
  const [pdfBlob, setPdfBlob]       = useState<Blob | null>(null);
  const [error, setError]           = useState("");

  const reset = () => {
    setFile(null); setConverted(false); setPdfBlob(null);
    setError(""); setProgress("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setConverted(false); setPdfBlob(null); setError(""); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setConverted(false); setPdfBlob(null); setError(""); }
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true); setError(""); setProgress("Reading document…");
    let wrapper: HTMLDivElement | null = null;

    try {
      const arrayBuffer = await file.arrayBuffer();

      /* ── 1. Render DOCX with docx-preview (preserves all colors/fonts/images) ── */
      setProgress("Rendering pages…");
      const { renderAsync } = await import("docx-preview");

      wrapper = document.createElement("div");
      // Position off-screen but still "painted" by the browser
      wrapper.style.cssText =
        "position:fixed;left:-9999px;top:0;" +
        "width:794px;background:#fff;" +
        "z-index:-1;pointer-events:none;";
      document.body.appendChild(wrapper);

      await renderAsync(new Uint8Array(arrayBuffer), wrapper, undefined, {
        className:        "docx",
        inWrapper:        true,
        ignoreWidth:      false,
        ignoreHeight:     false,
        ignoreFonts:      false,
        breakPages:       true,
        useBase64URL:     true,
        renderHeaders:    true,
        renderFooters:    true,
        renderFootnotes:  true,
      });

      /* ── 2. Find rendered page sections ── */
      // docx-preview wraps every Word page in a <section> inside .docx-wrapper
      const pageSections = Array.from(
        wrapper.querySelectorAll<HTMLElement>(".docx-wrapper section")
      );

      if (pageSections.length === 0) {
        throw new Error("No pages rendered — the document may be empty or unsupported.");
      }

      /* ── 3. Capture each page with html2canvas → add to jsPDF ── */
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      for (let i = 0; i < pageSections.length; i++) {
        setProgress(`Capturing page ${i + 1} of ${pageSections.length}…`);
        const section = pageSections[i];

        // Make the section render at consistent A4 width
        const sectionW = section.offsetWidth  || 794;
        const sectionH = section.offsetHeight || 1123;

        const canvas = await html2canvas(section, {
          scale:           2,
          useCORS:         true,
          allowTaint:      true,
          backgroundColor: "#ffffff",
          logging:         false,
          width:           sectionW,
          height:          sectionH,
          windowWidth:     sectionW,
          windowHeight:    sectionH,
        });

        // Fit the captured image into an A4 page (210mm × 297mm)
        const imgData   = canvas.toDataURL("image/jpeg", 0.97);
        const A4_W      = 210;
        const A4_H      = 297;
        const ratio     = Math.min(A4_W / (sectionW), A4_H / (sectionH));
        const imgW      = sectionW  * ratio;
        const imgH      = sectionH  * ratio;
        const offsetX   = (A4_W - imgW) / 2;
        const offsetY   = (A4_H - imgH) / 2;

        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
      }

      document.body.removeChild(wrapper); wrapper = null;
      setProgress("Finalising PDF…");
      setPdfBlob(pdf.output("blob"));
      setConverted(true);
      setProgress("");
    } catch (err) {
      console.error(err);
      if (wrapper && document.body.contains(wrapper)) document.body.removeChild(wrapper);
      setError(err instanceof Error ? err.message : "Conversion failed. Please use a valid .docx file.");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const url = URL.createObjectURL(pdfBlob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = file.name.replace(/\.docx?$/i, ".pdf");
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700
                              flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Word to PDF</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Exact colors, fonts &amp; tables — direct download, no print dialog
                </p>
              </div>
            </motion.div>

            {/* Steps */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
              {steps.map((s, i) => (
                <div key={s.step} className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                  i === 0 && file      ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700" :
                  i === 1 && converting? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700" :
                  i === 2 && converted ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700" :
                  "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0",
                    i === 2 && converted ? "bg-emerald-500" :
                    i === 1 && converting? "bg-amber-500" : "bg-blue-500"
                  )}>{s.step}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Drop zone */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed",
                  "transition-all duration-200 cursor-pointer min-h-52",
                  isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]" :
                  file        ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-700" :
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
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · Word Document
                      </p>
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
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Drag &amp; drop your Word file here
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        or <span className="text-blue-500 font-semibold">browse to upload</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Supports .doc, .docx · Max 50 MB</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                           rounded-xl px-4 py-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </motion.div>
            )}

            {/* Convert button + progress */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }} className="flex items-center gap-3">
              <button onClick={handleConvert} disabled={!file || converting || converted}
                className={cn(
                  "flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all",
                  !file     ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed" :
                  converting? "bg-blue-400 text-white cursor-wait" :
                  converted ? "bg-emerald-500 text-white" :
                  "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                )}>
                {converting ? (
                  <><Loader2 size={15} className="animate-spin" />Converting…</>
                ) : converted ? (
                  <><CheckCircle size={16} />Converted!</>
                ) : (
                  <>Convert to PDF <ArrowRight size={16} /></>
                )}
              </button>
              {converting && progress && (
                <p className="text-xs text-slate-400 animate-pulse">{progress}</p>
              )}
              {!file && !converting && (
                <p className="text-xs text-slate-400">Upload a Word file first</p>
              )}
            </motion.div>

            {/* Download card */}
            {converted && pdfBlob && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200
                           dark:border-emerald-700 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Conversion Complete!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {file?.name.replace(/\.docx?$/i, ".pdf")} · ready
                    </p>
                  </div>
                </div>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500
                             text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors
                             shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                  <Download size={15} /> Save PDF
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
