import cors from "cors";
import express from "express";
import multer from "multer";

type DiagramNode = {
  id: string;
  label: string;
  tier: "presentation" | "application" | "data";
};

type DiagramEdge = {
  from: string;
  to: string;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/terraform/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Terraform file is required" });
  }

  // Placeholder diagram data until the Terraform parser is wired in.
  const nodes: DiagramNode[] = [
    { id: "ui", label: "Next.js UI", tier: "presentation" },
    { id: "cdn", label: "Edge CDN", tier: "presentation" },
    { id: "api", label: "API Gateway", tier: "application" },
    { id: "parser", label: "Terraform Parser", tier: "application" },
    { id: "state", label: "State Storage", tier: "data" },
    { id: "graph", label: "Diagram Cache", tier: "data" },
  ];

  const edges: DiagramEdge[] = [
    { from: "ui", to: "cdn" },
    { from: "cdn", to: "api" },
    { from: "api", to: "parser" },
    { from: "parser", to: "state" },
    { from: "parser", to: "graph" },
  ];

  return res.json({
    file: {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    summary:
      "Terraform file accepted. Parsing and diagram generation are stubbed until the parser pipeline is connected.",
    diagram: { nodes, edges },
    nextSteps: [
      "Plug in the Terraform HCL parser and module resolver.",
      "Map modules/resources into typed graph nodes.",
      "Return graph data consumable by the UI canvas.",
    ],
  });
});

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  // Console log is acceptable here to confirm the server is live.
  // eslint-disable-next-line no-console
  console.log(`API listening at http://localhost:${port}`);
});
