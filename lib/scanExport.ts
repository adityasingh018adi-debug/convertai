import jsPDF from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import * as XLSX from "xlsx";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** High-quality image-embedded PDF — full resolution, no recompression. */
export async function exportHighQualityPdf(imageDataUrl: string, filename: string) {
  const img = await loadImage(imageDataUrl);
  const doc = new jsPDF({ orientation: img.width > img.height ? "landscape" : "portrait", unit: "pt", format: [img.width * 0.75, img.height * 0.75] });
  doc.addImage(imageDataUrl, "JPEG", 0, 0, img.width * 0.75, img.height * 0.75);
  doc.save(filename);
}

/** Compressed PDF — image re-encoded at lower quality/resolution to shrink file size. */
export async function exportCompressedPdf(imageDataUrl: string, filename: string) {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.55);
  const doc = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "pt", format: [canvas.width * 0.75, canvas.height * 0.75] });
  doc.addImage(compressedDataUrl, "JPEG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
  doc.save(filename);
}

/**
 * Searchable PDF — image layer plus an invisible OCR text layer positioned
 * using OCR.space's word-level bounding boxes, so the PDF text is selectable
 * and searchable while still looking like the original scan.
 */
export async function exportSearchablePdf(
  imageDataUrl: string,
  filename: string,
  words: { text: string; left: number; top: number; width: number; height: number }[]
) {
  const img = await loadImage(imageDataUrl);
  const ptScale = 0.75;
  const pageW = img.width * ptScale;
  const pageH = img.height * ptScale;
  const doc = new jsPDF({ orientation: pageW > pageH ? "landscape" : "portrait", unit: "pt", format: [pageW, pageH] });
  doc.addImage(imageDataUrl, "JPEG", 0, 0, pageW, pageH);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  for (const w of words) {
    if (!w.text.trim()) continue;
    const fontSize = Math.max(4, (w.height * ptScale) * 0.8);
    doc.setFontSize(fontSize);
    try {
      doc.text(w.text, w.left * ptScale, (w.top + w.height) * ptScale, { renderingMode: "invisible" });
    } catch {
      /* ignore individual word placement errors */
    }
  }
  doc.save(filename);
}

/** Best-effort editable Word document — extracted text as paragraphs, not pixel-perfect layout/fonts/tables. */
export async function exportToWord(text: string, filename: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const paragraphs = lines.map((line) => {
    const isHeading = line.length < 60 && /^[A-Z0-9 ,.\-:]+$/.test(line) && line === line.toUpperCase();
    return new Paragraph({
      text: line,
      heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
    });
  });
  const doc = new Document({ sections: [{ children: paragraphs.length ? paragraphs : [new Paragraph("")] }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

/** Best-effort Excel export — reconstructs table-like text (2+ spaces or tabs as column separators) into rows/columns. */
export function exportToExcel(text: string, filename: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.map((line) => line.split(/\t|\s{2,}/).map((cell) => cell.trim()).filter(Boolean));
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Scanned Data");
  XLSX.writeFile(wb, filename);
}

export function exportToText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "text/plain" }), filename);
}

/** Canvas-based enhancement: brightness, contrast, sharpen, and rotation — all real, client-side, no fake "AI auto" claims. */
export async function enhanceImage(
  imageDataUrl: string,
  opts: { brightness: number; contrast: number; sharpen: boolean; rotate: number }
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const rad = (opts.rotate * Math.PI) / 180;
  const swap = opts.rotate % 180 !== 0;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? img.height : img.width;
  canvas.height = swap ? img.width : img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.filter = `brightness(${opts.brightness}%) contrast(${opts.contrast}%)`;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.filter = "none";

  if (opts.sharpen) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpened = applyUnsharpMask(imgData);
    ctx.putImageData(sharpened, 0, 0);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

function applyUnsharpMask(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[k++];
          }
        }
        output[(y * width + x) * 4 + c] = sum;
      }
    }
  }
  return new ImageData(output, width, height);
}
