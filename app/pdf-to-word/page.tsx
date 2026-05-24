"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { FileOutput, CheckCircle, Download, ArrowRight, Upload, X, File } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { step: "1", title: "Upload PDF", desc: "Drop your PDF file below" },
  { step: "2", title: "Processing", desc: "Extracts text and structure" },
  { step: "3", title: "Download .docx", desc: "Get your Word file instantly" },
];

export default function PdfToWordPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const reset = () => { setFile(null); setConverted(false); setDocxBlob(null); setError(""); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setConverted(false); setDocxBlob(null); setError(""); }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setConverted(false); setDocxBlob(null); setError(""); }
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();

      // pdfjs-dist v5 — use legacy build for broader browser compat
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const numPages: number = pdfDoc.numPages;

      interface Block { text: string; fontSize: number; bold: boolean }
      const blocks: Block[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const content = await page.getTextContent();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: any[] = content.items;
        let lineText = "";
        let lineY: number | null = null;
        let lineSize = 12;

        for (const item of items) {
          if (!("str" in item)) continue;
          const str: string = item.str ?? "";
          const y: number = item.transform?.[5] ?? 0;
          const fontSize: number = item.height ?? 12;

          if (lineY !== null && Math.abs(y - lineY) > 2) {
            if (lineText.trim()) blocks.push({ text: lineText.trim(), fontSize: lineSize, bold: lineSize > 13 });
            lineText = str;
            lineSize = fontSize;
          } else {
            lineText += str;
            lineSize = Math.max(lineSize, fontSize);
          }
          lineY = y;
        }
        if (lineText.trim()) blocks.push({ text: lineText.trim(), fontSize: lineSize, bold: lineSize > 13 });
        if (pageNum < numPages) blocks.push({ text: "", fontSize: 12, bold: false }); // page break gap
      }

      // Build .docx
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

      const children = blocks.map(({ text, fontSize, bold }) => {
        if (!text) return new Paragraph({ children: [] });
        const isH1 = fontSize >= 20;
        const isH2 = fontSize >= 16 && !isH1;
        return new Paragraph({
          heading: isH1 ? HeadingLevel.HEADING_1 : isH2 ? HeadingLevel.HEADING_2 : undefined,
          children: [
            new TextRun({
              text,
              bold: bold && !isH1 && !isH2,
              size: Math.round(fontSize) * 2,
              font: "Calibri",
            }),
          ],
        });
      });

      const doc = new Document({
        styles: { default: { document: { run: { font: "Calibri", size: 24 } } } },
        sections: [{ properties: {}, children }],
      });

      setDocxBlob(await Packer.toBlob(doc));
      setConverted(true);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please ensure the file is a valid PDF.");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!docxBlob || !file) return;
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, ".docx");
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
                <FileOutput size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">PDF to Word</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Convert PDF to editable .docx with text extraction</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3">
              {steps.map((s, i) => (
                <div key={s.step} className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                  i === 0 && file ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700" :
                  i === 1 && converting ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700" :
                  i === 2 && converted ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700" :
                  "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0",
                    i === 2 && converted ? "bg-emerald-500" : i === 1 && converting ? "bg-amber-500" : "bg-purple-500"
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
                  isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-[1.01]" :
                  file ? "border-purple-400 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-700" :
                  "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300 hover:bg-purple-50/30"
                )}>
                <input type="file" accept=".pdf" onChange={handleFileInput}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
                {file ? (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center">
                      <File size={28} className="text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · PDF Document</p>
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
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag & drop your PDF here</p>
                      <p className="text-xs text-slate-400 mt-1">or <span className="text-purple-500 font-semibold">browse to upload</span></p>
                      <p className="text-xs text-slate-400 mt-2">Supports .pdf · Max 50MB</p>
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
                  converting ? "bg-purple-400 text-white cursor-wait" :
                  converted ? "bg-emerald-500 text-white" :
                  "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-200 dark:shadow-purple-900/40"
                )}>
                {converting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Converting...</>
                ) : converted ? (
                  <><CheckCircle size={16} />Converted!</>
                ) : (
                  <>Convert to Word <ArrowRight size={16} /></>
                )}
              </button>
              {!file && <p className="text-xs text-slate-400">Upload a PDF file first</p>}
            </motion.div>

            {converted && docxBlob && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Conversion Complete!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {file?.name.replace(/\.pdf$/i, ".docx")} · Ready to download
                    </p>
                  </div>
                </div>
                <button onClick={handleDownload}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                  <Download size={14} /> Download Word
                </button>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
