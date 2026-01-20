// Load env ASAP so downstream imports see it
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: ".env" });
} catch (err) {
  // ignore if dotenv not present
}

import cors from "cors";
import express from "express";
import multer from "multer";
import { prisma } from "./db";
import { parseTerraformToGraph } from "./parser";
import { parsePlanJsonToGraph } from "./planParser";

const allowedExtensions = [".tf", ".tfvars"];
const suspiciousPatterns: RegExp[] = [
  /bash\s+-i/gi,
  /nc\s+-e/gi,
  /meterpreter/gi,
  /powershell\s+-enc/gi,
  /Invoke-Expression/gi,
  /\/bin\/sh/gi,
];

function ensureAllowedExtension(files: Express.Multer.File[]) {
  const bad = files.find(
    (f) =>
      !allowedExtensions.some((ext) =>
        f.originalname.toLowerCase().endsWith(ext)
      )
  );
  if (bad) {
    throw new Error(`Only .tf or .tfvars files are allowed. Blocked: ${bad.originalname}`);
  }
}

function isLikelyText(buf: Buffer): boolean {
  // Reject if more than 5% are control chars (excluding tab/newline/carriage return).
  const len = buf.length || 1;
  let control = 0;
  for (const b of buf) {
    if (b < 0x09 || (b > 0x0d && b < 0x20)) control++;
  }
  return control / len <= 0.05;
}

function ensureNotSuspicious(content: string, name: string) {
  const hit = suspiciousPatterns.find((re) => re.test(content));
  if (hit) {
    throw new Error(`Rejected suspicious content in ${name}`);
  }
}

// Allow the max upload size to be tuned via env (defaults to 25 MB).
const maxUploadMb = Math.max(1, Number(process.env.UPLOAD_MAX_MB ?? "25"));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024, files: 50 },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: "ok" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[health/db] failed", err);
    return res.status(500).json({ status: "error", message: "DB not reachable" });
  }
});

app.post("/api/terraform/upload", upload.array("files", 50), (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];

  if (!files.length) {
    return res.status(400).json({ error: "Terraform files are required" });
  }

  try {
    ensureAllowedExtension(files);

    const tfFiles = files.map((f) => {
      if (!isLikelyText(f.buffer)) {
        throw new Error(`File appears to be binary or contains too many control characters: ${f.originalname}`);
      }
      const content = f.buffer.toString("utf8");
      ensureNotSuspicious(content, f.originalname);
      return { name: f.originalname, content };
    });

    const { graph, summary } = parseTerraformToGraph(tfFiles);
    // Debug log for visibility
    // eslint-disable-next-line no-console
    console.log(
      `[upload] files=${tfFiles.length} resources=${graph.nodes.length} edges=${graph.edges.length} summary="${summary}"`
    );
    return res.json({
      files: files.map((f) => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      })),
      summary,
      graph,
      nextSteps: [
        "Enhance mapping for more AWS services and relationships.",
        "Persist graph data (e.g., DynamoDB) and return an ID for retrieval.",
        "Add layout hints for the UI canvas.",
      ],
    });
  } catch (err) {
    // Catch validation/parser errors and return a clear response.
    // eslint-disable-next-line no-console
    console.error("[upload] failed", err);
    return res.status(400).json({
      error: "Upload failed",
      details: (err as Error).message,
    });
  }
});

app.post("/api/terraform/plan", upload.single("plan"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Terraform plan JSON file is required" });
  }

  try {
    const json = JSON.parse(file.buffer.toString("utf8"));
    const { graph, summary } = parsePlanJsonToGraph(json);
    // eslint-disable-next-line no-console
    console.log(
      `[plan] resources=${graph.nodes.length} edges=${graph.edges.length} summary="${summary}"`
    );
    return res.json({
      file: { name: file.originalname, size: file.size, mimetype: file.mimetype },
      summary,
      graph,
      nextSteps: [
        "Persist graph data (e.g., DynamoDB) and return an ID for retrieval.",
        "Add layout hints for the UI canvas.",
      ],
    });
  } catch (err) {
    return res.status(400).json({
      error: "Failed to parse plan JSON",
      details: (err as Error).message,
    });
  }
});

// Return a clear message for Multer-specific failures (e.g., file too large).
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({
      error: err.code === "LIMIT_FILE_SIZE" ? "File too large" : "Upload failed",
      details: err.message,
      maxUploadMb,
    });
  }
  return res.status(500).json({ error: "Unexpected server error" });
});

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  // Console log is acceptable here to confirm the server is live.
  // eslint-disable-next-line no-console
  console.log(`API listening at http://localhost:${port}`);
});
