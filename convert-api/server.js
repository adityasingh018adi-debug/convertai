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

/* ── AI invoice extraction (Cloudflare Workers AI) ──────────────────────── */

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "15254cf3eb313f1126773e380833cc84";
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const CF_VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";

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

function extractJson(text) {
  const jsonMatch = (text || "").match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON.");
  return JSON.parse(jsonMatch[0]);
}

async function runWorkersAI(model, body) {
  if (!CF_API_TOKEN) {
    throw new Error("AI features are not configured on this server yet.");
  }
  const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${CF_API_TOKEN}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`AI request failed (${resp.status}): ${errText.slice(0, 200)}`);
  }
  const data = await resp.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || "AI request failed.");
  }
  return data.result;
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
    const result = await runWorkersAI(CF_TEXT_MODEL, {
      messages: [
        { role: "system", content: INVOICE_EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: `Extract invoice details from this description:\n\n${text}` },
      ],
    });
    const content = result.choices?.[0]?.message?.content ?? result.response;
    res.json(extractJson(typeof content === "string" ? content : JSON.stringify(content)));
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
    const result = await runWorkersAI(CF_VISION_MODEL, {
      image: Array.from(req.file.buffer),
      prompt: `${INVOICE_EXTRACTION_SYSTEM_PROMPT}\n\nExtract invoice/receipt details from this image.`,
      max_tokens: 512,
    });
    res.json(extractJson(result.description || result.response));
  } catch (err) {
    console.error("invoice-from-image error:", err);
    res.status(500).json({ error: err.message });
  }
});

const DOCUMENT_TYPES = [
  "Invoice", "Receipt", "Challan", "Handwritten Notes", "Printed Document",
  "Passport", "Aadhaar Card", "PAN Card", "Business Card", "Certificate",
  "Resume", "Book Page", "Contract", "Purchase Order", "Quotation", "Medical Report",
];

/**
 * POST /ai/classify-document
 * field "file" = image  →  returns { type, confidence, reasoning }
 */
app.post("/ai/classify-document", requireApiKey, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ error: "Only image files are supported." });
  }
  try {
    const prompt = `Look at this document image and classify it as exactly one of: ${DOCUMENT_TYPES.join(", ")}. Respond with ONLY a JSON object: {"type": "<one of the categories above, verbatim>", "confidence": "high"|"medium"|"low"}. No other text.`;
    const result = await runWorkersAI(CF_VISION_MODEL, {
      image: Array.from(req.file.buffer),
      prompt,
      max_tokens: 100,
    });
    const parsed = extractJson(result.description || result.response);
    if (!DOCUMENT_TYPES.includes(parsed.type)) parsed.confidence = "low";
    res.json(parsed);
  } catch (err) {
    console.error("classify-document error:", err);
    res.status(500).json({ error: err.message });
  }
});

const LANGUAGE_CODES = {
  english: "en", hindi: "hi", spanish: "es", french: "fr", german: "de",
  arabic: "ar", chinese: "zh", japanese: "ja", portuguese: "pt", russian: "ru",
  bengali: "bn", tamil: "ta", telugu: "te", marathi: "mr", gujarati: "gu",
};

/**
 * POST /ai/translate
 * body: { text: string, targetLanguage: string }  →  { translatedText }
 */
app.post("/ai/translate", requireApiKey, express.json(), async (req, res) => {
  const { text, targetLanguage } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Provide a non-empty 'text' field." });
  }
  if (!targetLanguage) {
    return res.status(400).json({ error: "Provide a 'targetLanguage' field." });
  }
  try {
    const targetLang = LANGUAGE_CODES[targetLanguage.toLowerCase()] || targetLanguage.toLowerCase();
    const result = await runWorkersAI("@cf/meta/m2m100-1.2b", {
      text,
      source_lang: "en",
      target_lang: targetLang,
    });
    res.json({ translatedText: result.translated_text || result.response });
  } catch (err) {
    console.error("translate error:", err);
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
