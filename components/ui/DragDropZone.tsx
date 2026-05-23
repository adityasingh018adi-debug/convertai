"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DragDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
        Quick Upload
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Drop any file to convert instantly
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 min-h-32 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer relative",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]"
            : file
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
        )}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.jpg,.png"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <CheckCircle size={28} className="text-emerald-500" />
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {file.name.length > 22
                  ? file.name.slice(0, 20) + "..."
                  : file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1"
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : isDragging ? (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <Upload size={28} className="text-blue-500 animate-bounce" />
            <p className="text-sm font-semibold text-blue-600">
              Drop to upload!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <File size={18} className="text-slate-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
              Drag & drop or{" "}
              <span className="text-blue-500 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-400">PDF, DOC, DOCX, JPG, PNG</p>
          </div>
        )}
      </div>
    </div>
  );
}
