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

// Allow requests from any Netlify / localhost origin
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, service: "convertai-api" }));

/**
 * POST /convert/word-to-pdf
 * Body: multipart/form-data  field "file" = .doc or .docx
 * Returns: application/pdf binary
 */
app.post("/convert/word-to-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Send multipart field 'file'." });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (![".doc", ".docx"].includes(ext)) {
    return res.status(400).json({ error: "Only .doc and .docx files are supported." });
  }

  // Create a temp directory for this request
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "conv-"));
  const inputPath = path.join(tmpDir, req.file.originalname);

  try {
    // Write uploaded bytes to disk
    fs.writeFileSync(inputPath, req.file.buffer);

    // Run LibreOffice headless conversion
    await new Promise((resolve, reject) => {
      execFile(
        "soffice",
        [
          "--headless",
          "--norestore",
          "--convert-to", "pdf",
          "--outdir",     tmpDir,
          inputPath,
        ],
        { timeout: 60_000 }, // 60 s max
        (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message));
          resolve(stdout);
        }
      );
    });

    // Locate the output PDF
    const baseName = path.basename(inputPath, ext);
    const pdfPath  = path.join(tmpDir, `${baseName}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: "LibreOffice produced no output. Check the document." });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${baseName}.pdf"`
    );
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: err.message || "Conversion failed." });
  } finally {
    // Always clean up temp files
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`ConvertAI API running on port ${PORT}`)
);
