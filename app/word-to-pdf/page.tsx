"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { FileText, CheckCircle, Download, ArrowRight, Upload, X, File } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { step: "1", title: "Upload Word File", desc: "Drop your .docx file below" },
  { step: "2", title: "Processing", desc: "Converts with full formatting preserved" },
  { step: "3", title: "Download PDF", desc: "Get your PDF instantly" },
];

export default function WordToPdfPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setConverted(false); setPdfBlob(null); setError(""); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setConverted(false); setPdfBlob(null); setError(""); }
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

      // Build a styled A4 container off-screen
      const container = document.createElement("div");
      container.style.cssText = [
        "position:fixed",
        "top:-99999px",
        "left:-99999px",
        "width:794px",
        "min-height:1123px",
        "background:#fff",
        "padding:80px 90px",
        "font-family:'Times New Roman',serif",
        "font-size:12pt",
        "line-height:1.65",
        "color:#000",
      ].join(";");

      container.innerHTML = `
        <style>
          *{box-sizing:border-box;}
          h1{font-size:20pt;font-weight:bold;margin:16px 0 8px;}
          h2{font-size:16pt;font-weight:bold;margin:14px 0 6px;}
          h3{font-size:13pt;font-weight:bold;margin:12px 0 5px;}
          p{margin:0 0 8px;}
          table{border-collapse:collapse;width:100%;margin:12px 0;}
          td,th{border:1px solid #333;padding:6px 10px;text-align:left;}
          th{background:#f0f0f0;font-weight:bold;}
          ul,ol{margin:8px 0 8px 28px;}
          li{margin:3px 0;}
          strong,b{font-weight:bold;}
          em,i{font-style:italic;}
          u{text-decoration:underline;}
          hr{border:none;border-top:1px solid #ccc;margin:12px 0;}
        </style>
        ${html}
      `;
      document.body.appendChild(container);

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      document.body.removeChild(container);

      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const pageW = 210;
      const pageH = 297;
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.97);

      let remaining = imgH;
      let srcY = 0;

      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH * canvas.width) / imgW;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY * (canvas.width / imgW), canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
        pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.97), "JPEG", 0, 0, imgW, sliceH);
        remaining -= sliceH;
        srcY += sliceH;
        if (remaining > 0) pdf.addPage();
      }

      setPdfBlob(pdf.output("blob"));
      setConverted(true);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please ensure the file is a valid .docx document.");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !file) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.docx?$/i, ".pdf");
    a.click();
    URL.revokeObjectURL(url);
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Converts .docx to PDF preserving tables, bold, headings & layout</p>
              </div>
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
                )}
              >
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
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); setConverted(false); setPdfBlob(null); setError(""); }}
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
              <button onClick={handleConvert} disabled={!file || converting || converted}
                className={cn(
                  "flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200",
                  !file ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed" :
                  converting ? "bg-blue-400 text-white cursor-wait" :
                  converted ? "bg-emerald-500 text-white" :
                  "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                )}>
                {converting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Converting...</>
                ) : converted ? (
                  <><CheckCircle size={16} />Converted!</>
                ) : (
                  <>Convert to PDF <ArrowRight size={16} /></>
                )}
              </button>
              {!file && <p className="text-xs text-slate-400">Upload a Word file first</p>}
            </motion.div>

            {converted && pdfBlob && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Conversion Complete!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {file?.name.replace(/\.docx?$/i, ".pdf")} · Ready to download
                    </p>
                  </div>
                </div>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                  <Download size={14} /> Download PDF
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
