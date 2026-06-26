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

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://doclifyai.com,https://www.doclifyai.com,https://doclifyai.in,https://www.doclifyai.in")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);

const API_KEY = process.env.CONVERT_API_KEY;
function requireApiKey(req, res, next) {
  if (!API_KEY) return next(); // no key configured -> auth disabled (dev mode)
  if (req.get("x-api-key") !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function sanitizeFilename(name) {
  const base = path.basename(name).replace(/[^A-Za-z0-9._-]/g, "_");
  return base || "file";
}

function libreOffice(args) {
  return new Promise((resolve, reject) => {
    execFile("soffice", args, { timeout: 120_000 }, (err, _stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve();
    });
  });
}

async function convertFile(inputBuf, originalName, targetExt, extraArgs = []) {
  const tmpDir      = fs.mkdtempSync(path.join(os.tmpdir(), "conv-"));
  const safeName    = sanitizeFilename(originalName);
  const inputPath   = path.join(tmpDir, safeName);
  if (path.dirname(inputPath) !== tmpDir) {
    throw new Error("Invalid filename.");
  }
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

    const base    = path.basename(safeName, path.extname(safeName));
    const outPath = path.join(tmpDir, `${base}.${targetExt.split(":")[0]}`);

    if (!fs.existsSync(outPath)) {
      throw new Error("LibreOffice produced no output. The document may be corrupt or unsupported.");
    }
    return fs.readFileSync(outPath);
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

/* ── AI invoice extraction (Anthropic Claude) ───────────────────────────── */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AI_MODEL = "claude-haiku-4-5-20251001";

const INVOICE_EXTRACTION_SYSTEM_PROMPT = `You extract structured invoice data. Respond with ONLY a single JSON object (no markdown, no commentary) matching exactly this shape:
{
  "billTo": string,        // customer name and address, newline-separated if multiple lines
  "gstin": string,         // GST number if mentioned, else ""
  "notes": string,         // any extra context worth keeping, else ""
  "items": [
    { "desc": string, "qty": number, "rate": number, "gstPercent": number, "hsn": string }
  ]
}
Rules:
- qty and rate must be numbers, never strings.
- If GST% isn't mentioned for an item, default to 18.
- If HSN isn't mentioned, use "".
- If you cannot find any line items, return an empty items array.
- Never include any text outside the JSON object.`;

async function callClaude(messages) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("AI features are not configured on this server yet.");
  }
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1024,
      system: INVOICE_EXTRACTION_SYSTEM_PROMPT,
      messages,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`AI request failed (${resp.status}): ${errText.slice(0, 200)}`);
  }
  const data = await resp.json();
  const text = data.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON.");
  return JSON.parse(jsonMatch[0]);
}

/**
 * POST /ai/invoice-from-text
 * body: { text: string }  →  returns structured invoice JSON
 */
app.post("/ai/invoice-from-text", requireApiKey, express.json(), async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Provide a non-empty 'text' field." });
  }
  try {
    const result = await callClaude([
      { role: "user", content: `Extract invoice details from this description:\n\n${text}` },
    ]);
    res.json(result);
  } catch (err) {
    console.error("invoice-from-text error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /ai/invoice-from-image
 * field "file" = image (photo of a handwritten note, receipt, or existing invoice)
 * → returns structured invoice JSON
 */
app.post("/ai/invoice-from-image", requireApiKey, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ error: "Only image files are supported." });
  }
  try {
    const base64 = req.file.buffer.toString("base64");
    const result = await callClaude([
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: req.file.mimetype, data: base64 } },
          { type: "text", text: "Extract invoice/receipt details from this image." },
        ],
      },
    ]);
    res.json(result);
  } catch (err) {
    console.error("invoice-from-image error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── routes ──────────────────────────────────────────────────────────────── */

app.get("/health", (_req, res) => res.json({ ok: true, service: "doclifyai-api" }));

/**
 * POST /convert/word-to-pdf
 * field "file" = .doc or .docx  →  returns application/pdf
 */
app.post("/convert/word-to-pdf", requireApiKey, upload.single("file"), async (req, res) => {
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
app.post("/convert/pdf-to-word", requireApiKey, upload.single("file"), async (req, res) => {
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
app.listen(PORT, () => console.log(`DoclifyAI API ready on :${PORT}`));
