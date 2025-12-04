"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type UploadResult = {
  files: { name: string; size: number; mimetype: string }[];
  summary: string;
  graph: { nodes: any[]; edges: any[] };
};

const serviceColors: Record<string, string> = {
  vpc: "#22d3ee",
  route53: "#38bdf8",
  cloudfront: "#7dd3fc",
  elb: "#a855f7",
  ecs: "#f97316",
  ecr: "#fb923c",
  ec2: "#fbbf24",
  eks: "#60a5fa",
  lambda: "#f97316",
  apigw: "#c084fc",
  rds: "#38bdf8",
  dynamodb: "#22c55e",
  elasticache: "#f472b6",
  s3: "#22d3ee",
  efs: "#a3e635",
  sqs: "#f59e0b",
  sns: "#fb7185",
  eventbridge: "#f472b6",
  iam: "#8b5cf6",
  kms: "#10b981",
  secrets: "#14b8a6",
  ssm: "#0ea5e9",
  observability: "#cbd5e1",
  generic: "#94a3b8",
};

const serviceIcons: Record<string, string> = {
  vpc: "/aws-icons/Networking-Content-Delivery/VPC-Lattice.svg",
  route53: "/aws-icons/Networking-Content-Delivery/Route-53.svg",
  cloudfront: "/aws-icons/Networking-Content-Delivery/CloudFront.svg",
  elb: "/aws-icons/Networking-Content-Delivery/Elastic-Load-Balancing.svg",
  ec2: "/aws-icons/Compute/EC2.svg",
  ecs: "/aws-icons/Containers/Elastic-Container-Service.svg",
  ecr: "/aws-icons/Containers/Elastic-Container-Registry.svg",
  eks: "/aws-icons/Containers/Elastic-Kubernetes-Service.svg",
  lambda: "/aws-icons/Compute/Lambda.svg",
  apigw: "/aws-icons/App-Integration/API-Gateway.svg",
  s3: "/aws-icons/Storage/Simple-Storage-Service.svg",
  efs: "/aws-icons/Storage/EFS.svg",
  rds: "/aws-icons/Database/RDS.svg",
  dynamodb: "/aws-icons/Database/DynamoDB.svg",
  elasticache: "/aws-icons/Database/ElastiCache.svg",
  sqs: "/aws-icons/App-Integration/Simple-Queue-Service.svg",
  sns: "/aws-icons/App-Integration/Simple-Notification-Service.svg",
  eventbridge: "/aws-icons/App-Integration/EventBridge.svg",
  iam: "/aws-icons/Security-Identity-Compliance/Identity-and-Access-Management.svg",
  kms: "/aws-icons/Security-Identity-Compliance/Key-Management-Service.svg",
  secrets: "/aws-icons/Security-Identity-Compliance/Secrets-Manager.svg",
  ssm: "/aws-icons/Management-Governance/Systems-Manager.svg",
  observability: "/aws-icons/Management-Governance/CloudWatch.svg",
  generic: "/aws-icons/Compute/EC2.svg",
};

type FlowNodeData = { label: string; service: string };

const AwsNode = ({ data }: { data: FlowNodeData }) => {
  const color = serviceColors[data.service] ?? serviceColors.generic;
  const icon = serviceIcons[data.service] ?? serviceIcons.generic;
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-slate-900/90 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      style={{ borderColor: color }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/70">
        <img src={icon} alt={data.label} className="h-7 w-7" />
      </div>
      <div className="text-xs text-slate-100">
        <div className="font-semibold leading-tight">{data.label}</div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-slate-400">
          {data.service}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { aws: AwsNode };

export default function UploadPage() {
  const { data: session } = useSession();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    setError(null);
    setResult(null);
    if (!files.length) {
      setError("No files selected.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      const resp = await fetch(`${API_BASE}/api/terraform/upload`, {
        method: "POST",
        body: form,
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || `Upload failed with status ${resp.status}`);
      }
      const json = (await resp.json()) as UploadResult;
      setResult(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const flow = useMemo(() => {
    if (!result) return { nodes: [], edges: [] };

    const lanes: Record<string, number> = {
      route53: 0,
      cloudfront: 0,
      apigw: 1,
      elb: 1,
      lambda: 2,
      ecs: 2,
      ec2: 2,
      eks: 2,
      ecr: 2,
      s3: 3,
      rds: 3,
      dynamodb: 3,
      elasticache: 3,
      efs: 3,
      sqs: 4,
      sns: 4,
      eventbridge: 4,
      iam: 5,
      kms: 5,
      secrets: 5,
      ssm: 5,
      observability: 6,
    };

    const laneCounts: Record<number, number> = {};

    const nodes = result.graph.nodes.map((n, idx) => {
      const service = n.service ?? "generic";
      const lane = lanes[service] ?? 6;
      const order = laneCounts[lane] ?? 0;
      laneCounts[lane] = order + 1;
      return {
        id: n.id ?? `node-${idx}`,
        type: "aws",
        data: { label: n.label ?? n.id ?? `Node ${idx}`, service },
        position: { x: lane * 230, y: order * 120 },
      };
    });

    const edges = result.graph.edges.map((e: any, idx: number) => ({
      id: e.id ?? `edge-${idx}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      label: e.relation,
      style: { stroke: "#64748b" },
      labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8, color: "#cbd5e1" },
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
    }));
    return { nodes, edges };
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Upload Terraform
            </p>
            <h1 className="text-3xl font-semibold text-slate-50">
              Drop your modules to render a diagram
            </h1>
            <p className="text-sm text-slate-400">
              We read your HCL and generate a clean architecture view.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            ← Back
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur">
          {session ? (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-200">
                  Signed in as{" "}
                  <span className="font-semibold">
                    {session.user?.email || session.user?.name}
                  </span>
                </p>
                <label
                  htmlFor="folder-input"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-6 py-10 text-center transition hover:border-slate-500"
                >
                  <div className="rounded-full bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-200">
                    Upload folder
                  </div>
                  <p className="text-lg font-semibold text-slate-50">
                    Drop a Terraform folder or click to browse
                  </p>
                  <p className="max-w-md text-sm text-slate-400">
                    We’ll read HCL, detect resources, and send a parsed graph to the backend.
                  </p>
                  <input
                    id="folder-input"
                    type="file"
                    multiple
                    // webkitdirectory enables folder selection in Chromium-based browsers
                    //@ts-expect-error webkitdirectory is not in the TS defs
                    webkitdirectory="true"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const first = files[0] as any;
                      if (first && first.webkitRelativePath) {
                        const name = first.webkitRelativePath.split("/")[0];
                        setFolderName(name);
                      } else {
                        setFolderName(files[0]?.name ?? null);
                      }
                      if (files.length) {
                        void handleUpload(files);
                      }
                    }}
                  />
                  {folderName && (
                    <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">
                      Selected: {folderName}
                    </div>
                  )}
                </label>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    What we parse
                  </p>
                  <p className="mt-1">Modules, providers, resources, outputs.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Destination
                  </p>
                  <p className="mt-1">Backend API for diagram synthesis.</p>
                </div>
              </div>
              {uploading && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
                  Uploading and parsing… (this may take a few seconds)
                </div>
              )}
              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              )}
              {result && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Parse summary
                    </p>
                    <p>{result.summary}</p>
                    <p>
                      Nodes: {result.graph.nodes.length} · Edges: {result.graph.edges.length}
                    </p>
                    <div className="text-xs text-slate-400">
                      Files: {result.files.map((f) => f.name).join(", ")}
                    </div>
                  </div>
                  <div className="h-[520px] rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
                    {flow.nodes.length ? (
                      <ReactFlow
                        nodes={flow.nodes}
                        edges={flow.edges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        defaultEdgeOptions={{ animated: true }}
                      >
                        <Background gap={18} size={1} color="#1e293b" />
                        <Controls />
                      </ReactFlow>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No diagram to show yet.
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Legend (most-used AWS services)
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {[
                        { service: "route53", label: "Route 53" },
                        { service: "cloudfront", label: "CloudFront" },
                        { service: "apigw", label: "API Gateway" },
                        { service: "elb", label: "ALB/NLB" },
                        { service: "ecs", label: "ECS" },
                        { service: "ec2", label: "EC2" },
                        { service: "lambda", label: "Lambda" },
                        { service: "rds", label: "RDS" },
                        { service: "dynamodb", label: "DynamoDB" },
                        { service: "elasticache", label: "ElastiCache" },
                        { service: "s3", label: "S3" },
                        { service: "efs", label: "EFS" },
                        { service: "sqs", label: "SQS" },
                        { service: "sns", label: "SNS" },
                        { service: "eventbridge", label: "EventBridge" },
                        { service: "iam", label: "IAM" },
                        { service: "kms", label: "KMS" },
                        { service: "secrets", label: "Secrets Manager" },
                        { service: "observability", label: "CloudWatch" },
                      ].map((item) => (
                        <div
                          key={item.service}
                          className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100"
                        >
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded"
                            style={{ background: `${(serviceColors[item.service] ?? "#475569")}22` }}
                          >
                            <img
                              src={serviceIcons[item.service] ?? serviceIcons.generic}
                              alt={item.label}
                              className="h-4 w-4"
                            />
                          </span>
                          <span className="text-slate-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-lg font-semibold text-slate-50">
                Sign in to start uploading Terraform.
              </p>
              <p className="max-w-md text-sm text-slate-400">
                Use Google SSO to keep things simple—no passwords, no extra steps.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/auth/sign-in"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-50 shadow-[0_15px_40px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
                >
                  Back home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
