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
import { parseTerraformToGraph } from "./parser";
import { parsePlanJsonToGraph } from "./planParser";

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

app.post("/api/terraform/upload", upload.array("files", 50), (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];

  if (!files.length) {
    return res.status(400).json({ error: "Terraform files are required" });
  }

  const tfFiles = files
    .filter((f) => f.originalname.endsWith(".tf") || f.originalname.endsWith(".tfvars"))
    .map((f) => ({
      name: f.originalname,
      content: f.buffer.toString("utf8"),
    }));

  if (!tfFiles.length) {
    return res.status(400).json({ error: "No .tf or .tfvars files found in upload" });
  }

  try {
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
    // Catch-all to avoid crashing the server if the parser throws unexpectedly.
    return res.status(500).json({
      error: "Parser failed unexpectedly",
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
