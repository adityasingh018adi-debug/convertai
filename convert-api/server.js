const express = require("express");
const multer  = require("multer");
const cors    = require("cors");
const { execFile } = require("child_process");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const app    = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));

/* ── helpers ─────────────────────────────────────────────────────────────── */

function libreOffice(args) {
  return new Promise((resolve, reject) => {
    execFile("soffice", args, { timeout: 120_000 }, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve();
    });
  });
}

async function convertFile(inputBuf, originalName, targetExt, extraArgs = []) {
  const tmpDir    = fs.mkdtempSync(path.join(os.tmpdir(), "conv-"));
  const inputPath = path.join(tmpDir, originalName);
  try {
    fs.writeFileSync(inputPath, inputBuf);

    await libreOffice([
      "--headless",
      "--norestore",
      ...extraArgs,
      "--convert-to", targetExt,
      "--outdir",     tmpDir,
      inputPath,
    ]);

    const base    = path.basename(originalName, path.extname(originalName));
    const outPath = path.join(tmpDir, `${base}.${targetExt.split(":")[0]}`);

    if (!fs.existsSync(outPath)) {
      throw new Error("LibreOffice produced no output. The document may be corrupt or unsupported.");
    }
    return fs.readFileSync(outPath);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

/* ── routes ──────────────────────────────────────────────────────────────── */

app.get("/health", (_req, res) => res.json({ ok: true, service: "convertai-api" }));

/**
 * POST /convert/word-to-pdf
 * field "file" = .doc or .docx  →  returns application/pdf
 */
app.post("/convert/word-to-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (![".doc", ".docx"].includes(ext))
    return res.status(400).json({ error: "Only .doc and .docx are supported." });

  try {
    const pdfBuf = await convertFile(req.file.buffer, req.file.originalname, "pdf");
    const name   = path.basename(req.file.originalname, ext) + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.send(pdfBuf);
  } catch (err) {
    console.error("word-to-pdf error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /convert/pdf-to-word
 * field "file" = .pdf  →  returns application/vnd.openxmlformats-officedocument.wordprocessingml.document
 */
app.post("/convert/pdf-to-word", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== ".pdf")
    return res.status(400).json({ error: "Only .pdf files are supported." });

  try {
    // LibreOffice imports PDFs via the Writer PDF import filter for best text fidelity
    const docxBuf = await convertFile(
      req.file.buffer,
      req.file.originalname,
      "docx:MS Word 2007 XML",
      ["--infilter=writer_pdf_import"]
    );
    const name = path.basename(req.file.originalname, ".pdf") + ".docx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.send(docxBuf);
  } catch (err) {
    console.error("pdf-to-word error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── start ───────────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ConvertAI API ready on :${PORT}`));
