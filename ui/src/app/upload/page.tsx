"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";
// Normalize: drop trailing slash and a trailing "/api" if it was included in the secret,
// so we don't end up calling /api/api/...
const apiBaseTrimmed = rawApiBase.replace(/\/+$/, "");
const API_BASE = apiBaseTrimmed.endsWith("/api")
  ? apiBaseTrimmed.slice(0, -4)
  : apiBaseTrimmed;

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

const ICON_BASE =
  (process.env.NEXT_PUBLIC_ICON_BASE ?? "").replace(/\/+$/, "") || "";

const iconPath = (p: string) => `${ICON_BASE}${p.startsWith("/") ? p : `/${p}`}`;

const serviceIcons: Record<string, string> = {
  vpc: iconPath("/aws-icons/Networking-Content-Delivery/VPC-Lattice.svg"),
  route53: iconPath("/aws-icons/Networking-Content-Delivery/Route-53.svg"),
  cloudfront: iconPath("/aws-icons/Networking-Content-Delivery/CloudFront.svg"),
  elb: iconPath("/aws-icons/Networking-Content-Delivery/Elastic-Load-Balancing.svg"),
  ec2: iconPath("/aws-icons/Compute/EC2.svg"),
  ecs: iconPath("/aws-icons/Containers/Elastic-Container-Service.svg"),
  ecr: iconPath("/aws-icons/Containers/Elastic-Container-Registry.svg"),
  eks: iconPath("/aws-icons/Containers/Elastic-Kubernetes-Service.svg"),
  lambda: iconPath("/aws-icons/Compute/Lambda.svg"),
  apigw: iconPath("/aws-icons/App-Integration/API-Gateway.svg"),
  s3: iconPath("/aws-icons/Storage/Simple-Storage-Service.svg"),
  efs: iconPath("/aws-icons/Storage/EFS.svg"),
  rds: iconPath("/aws-icons/Database/RDS.svg"),
  dynamodb: iconPath("/aws-icons/Database/DynamoDB.svg"),
  elasticache: iconPath("/aws-icons/Database/ElastiCache.svg"),
  sqs: iconPath("/aws-icons/App-Integration/Simple-Queue-Service.svg"),
  sns: iconPath("/aws-icons/App-Integration/Simple-Notification-Service.svg"),
  eventbridge: iconPath("/aws-icons/App-Integration/EventBridge.svg"),
  iam: iconPath(
    "/aws-icons/Security-Identity-Compliance/Identity-and-Access-Management.svg"
  ),
  kms: iconPath("/aws-icons/Security-Identity-Compliance/Key-Management-Service.svg"),
  secrets: iconPath("/aws-icons/Security-Identity-Compliance/Secrets-Manager.svg"),
  ssm: iconPath("/aws-icons/Management-Governance/Systems-Manager.svg"),
  observability: iconPath("/aws-icons/Management-Governance/CloudWatch.svg"),
  // Inline gear icon data URI as a neutral fallback for unmapped services.
  generic:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
        <circle cx='12' cy='12' r='3.5' fill='%231e293b'/>
        <path d='M12 2.5l1 2.2a1 1 0 0 0 .9.6l2.4.2a1 1 0 0 1 .8.6l1 2.1a1 1 0 0 0 .7.6l2.2.5a1 1 0 0 1 .7 1l-.2 2.2a1 1 0 0 0 .4.9l1.8 1.5-1.8 1.5a1 1 0 0 0-.4.9l.2 2.2a1 1 0 0 1-.7 1l-2.2.5a1 1 0 0 0-.7.6l-1 2.1a1 1 0 0 1-.8.6l-2.4.2a1 1 0 0 0-.9.6L12 21.5l-1-2.2a1 1 0 0 0-.9-.6l-2.4-.2a1 1 0 0 1-.8-.6l-1-2.1a1 1 0 0 0-.7-.6l-2.2-.5a1 1 0 0 1-.7-1l.2-2.2a1 1 0 0 0-.4-.9L.6 12l1.8-1.5a1 1 0 0 0 .4-.9l-.2-2.2a1 1 0 0 1 .7-1l2.2-.5a1 1 0 0 0 .7-.6l1-2.1a1 1 0 0 1 .8-.6l2.4-.2a1 1 0 0 0 .9-.6L12 2.5Z'/>
      </svg>`
    ),
};

type FlowNodeData = { label: string; service: string };

const AwsNode = ({ data }: { data: FlowNodeData }) => {
  const color = serviceColors[data.service] ?? serviceColors.generic;
  const icon = serviceIcons[data.service] ?? serviceIcons.generic;
  return (
    <div className="relative flex items-center gap-3 rounded-xl border bg-white px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:bg-slate-900" style={{ borderColor: `${color}55` }}>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !bg-transparent !border-none"
        style={{ boxShadow: `0 0 0 2px ${color}44` }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !bg-transparent !border-none"
        style={{ boxShadow: `0 0 0 2px ${color}66` }}
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !bg-transparent !border-none"
        style={{ boxShadow: `0 0 0 2px ${color}33` }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !bg-transparent !border-none"
        style={{ boxShadow: `0 0 0 2px ${color}44` }}
        isConnectable={false}
      />
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border" style={{ backgroundColor: `${color}15`, borderColor: `${color}55` }}>
        <img src={icon} alt={data.label} className="h-7 w-7 opacity-90" />
      </div>
      <div className="min-w-[180px] max-w-[260px] whitespace-normal break-words text-xs text-slate-800 dark:text-slate-100">
        <div className="font-semibold leading-tight">{data.label}</div>
        <div className="text-[11px] uppercase tracking-[0.15em] text-slate-200 dark:text-slate-500 dark:text-slate-300">
          {data.service}
        </div>
      </div>
    </div>
  );
};

const GroupNode = ({ data }: { data: { label: string } }) => (
  <div className="pointer-events-none h-full w-full rounded-2xl border border-dashed border-sky-300 bg-transparent p-2 text-[11px] uppercase tracking-[0.2em] text-slate-600 dark:border-sky-500/50 dark:text-slate-200">
    <div className="flex items-center gap-2 opacity-70">
      <img src={serviceIcons.vpc} alt="VPC" className="h-4 w-4" />
      <span>{data.label}</span>
    </div>
  </div>
);

const FrameNode = ({ data }: { data: { label: string } }) => (
  <div className="pointer-events-none h-full w-full rounded-3xl border border-slate-300/70 bg-transparent p-3 text-[11px] uppercase tracking-[0.2em] text-slate-200 dark:text-slate-500 backdrop-blur-[1px] dark:border-slate-700/60 dark:text-slate-300">
    <div className="flex items-center gap-2 opacity-70">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/70 text-[10px] font-semibold text-white dark:bg-slate-700">
        AWS
      </span>
      <span>{data.label}</span>
    </div>
  </div>
);

const UserNode = ({ data }: { data: { label: string } }) => (
  <div className="relative flex items-center gap-3 rounded-xl border border-sky-300/70 bg-white px-3 py-2 shadow-[0_10px_28px_rgba(14,165,233,0.25)] dark:border-sky-500/60 dark:bg-slate-900">
    <Handle
      type="source"
      position={Position.Right}
      className="!h-2.5 !w-2.5 !bg-transparent !border-none"
      style={{ boxShadow: "0 0 0 2px rgba(248,250,252,0.9)" }}
      isConnectable={false}
    />
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-xs font-bold uppercase text-white dark:bg-sky-400">
      User
    </div>
    <div className="min-w-[120px] text-xs text-slate-800 dark:text-slate-100">
      <div className="font-semibold leading-tight">{data.label}</div>
      <div className="text-[11px] uppercase tracking-[0.15em] text-slate-200 dark:text-slate-500 dark:text-slate-300">
        Public entry
      </div>
    </div>
  </div>
);

const nodeTypes = { aws: AwsNode, group: GroupNode, frame: FrameNode, user: UserNode };

const flowEdgeStyle = { stroke: "#e2e8f0", strokeWidth: 2.2 };
const flowLabelBg = { fill: "#0f172a", fillOpacity: 0.75, color: "#e2e8f0" };
const flowLabelStyle = { fontSize: 10, fontWeight: 600, fill: "#e2e8f0" };
const permissionEdgeStyle = { stroke: "#ef4444", strokeWidth: 2.4 };
const permissionLabelBg = { fill: "#fef2f2", fillOpacity: 0.95, color: "#7f1d1d" };
const permissionLabelStyle = { fontSize: 10, fontWeight: 700, fill: "#7f1d1d" };
const publicEdgeStyle = { stroke: "#f8fafc", strokeWidth: 2.6 };
const publicLabelBg = { fill: "#0f172a", fillOpacity: 0.85, color: "#f8fafc" };
const publicLabelStyle = { fontSize: 10, fontWeight: 700, fill: "#f8fafc" };
const permissionHints = ["permission", "policy", "role", "attach", "access", "pull", "push", "ecr", "iam"];
const styleForRelation = (relation?: string) => {
  const rel = (relation ?? "").toLowerCase();
  if (permissionHints.some((h) => rel.includes(h))) {
    return { ...permissionEdgeStyle, labelBgStyle: permissionLabelBg, labelStyle: permissionLabelStyle };
  }
  return { ...flowEdgeStyle, labelBgStyle: flowLabelBg, labelStyle: flowLabelStyle };
};

export default function UploadPage() {
  const { data: session } = useSession();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfra, setShowInfra] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
      setSelectedNodeId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleNodeClick: NodeMouseHandler = (_event, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const flow = useMemo(() => {
    if (!result) return { nodes: [], edges: [], rawNodes: [], rawEdges: [], legendNodes: [] };

    const laneSpacing = 320;
    const rowSpacing = 150;
    const baseNodeWidth = 280;
    const baseNodeHeight = 96;
    const groupPaddingX = 200;
    const groupPaddingY = 160;

    // Lane ordering roughly matches the desired downstream story: CloudFront -> S3 -> API Gateway -> Lambda.
    const serviceLane: Record<string, number> = {
      route53: 0,
      cloudfront: 0,
      s3: 1,
      apigw: 2,
      elb: 2,
      ecs: 2,
      ec2: 2,
      eks: 2,
      lambda: 3,
      ecr: 3,
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
      generic: 2,
    };

    // Primary services stay on the canvas; everything else goes to the legend list.
    const primaryServices = new Set<string>([
      "route53",
      "cloudfront",
      "apigw",
      "lambda",
      "ecs",
      "ec2",
      "eks",
      "ecr",
      "s3",
      "rds",
      "dynamodb",
      "elasticache",
      "sqs",
      "sns",
      "eventbridge",
      "iam",
      "kms",
      "secrets",
    ]);

    const hiddenTypes = new Set<string>([
      "aws_ecs_task_definition",
      "aws_lb_target_group_attachment",
      "aws_launch_template",
      "aws_iam_policy",
    ]);
    const infraDetailServices = new Set<string>(["route53", "observability"]);

    const rawNodesAll = result.graph.nodes.filter((n) => {
      if (hiddenTypes.has(n.type)) return false;
      if (!showInfra && infraDetailServices.has(n.service)) return false;
      return true;
    });
    const displayNodes = rawNodesAll.filter((n) => primaryServices.has(n.service));
    const legendNodes = rawNodesAll.filter((n) => !primaryServices.has(n.service));

    const endpoints = (e: any) => ({ from: e.from ?? e.source, to: e.to ?? e.target });
    const edgeKey = (e: any) => {
      const { from, to } = endpoints(e);
      return `${from ?? ""}|${to ?? ""}|${e.relation ?? e.label ?? ""}`;
    };
    const seenEdges = new Set<string>();
    const rawEdgesAll = result.graph.edges
      .map((e) => ({ ...e, ...endpoints(e) }))
      .filter((e) => e.from && e.to)
      .filter((e) => {
        const k = edgeKey(e);
        if (seenEdges.has(k)) return false;
        seenEdges.add(k);
        return true;
      });
    const rawEdges = rawEdgesAll.filter((e) => {
      const fromVisible = displayNodes.some((n) => n.id === e.from);
      const toVisible = displayNodes.some((n) => n.id === e.to);
      return fromVisible && toVisible;
    });

    const nodeById = new Map(displayNodes.map((n) => [n.id, n]));
    const vpcMembership = new Map<string, string[]>();
    for (const e of rawEdges) {
      const target = nodeById.get(e.to);
      if (e.relation === "in_vpc" && target?.service === "vpc") {
        const list = vpcMembership.get(e.to) ?? [];
        list.push(e.from);
        vpcMembership.set(e.to, list);
      }
    }

    const layoutEdges = rawEdges;
    const indegree = new Map<string, number>();
    for (const n of displayNodes) indegree.set(n.id, 0);
    for (const e of layoutEdges) {
      if (indegree.has(e.to ?? e.target)) {
        indegree.set(e.to ?? e.target, (indegree.get(e.to ?? e.target) ?? 0) + 1);
      }
    }

    const queue = displayNodes.filter((n) => (indegree.get(n.id) ?? 0) === 0);
    const levels = new Map<string, number>();
    queue.forEach((n) => levels.set(n.id, serviceLane[n.service] ?? 2));

    while (queue.length) {
      const current = queue.shift();
      if (!current) break;
      const level = levels.get(current.id) ?? (serviceLane[current.service] ?? 2);
      for (const e of layoutEdges.filter((edge) => (edge.from ?? edge.source) === current.id)) {
        const targetId = e.to ?? e.target;
        const targetNode = displayNodes.find((n) => n.id === targetId);
        const nextLevel = Math.max(level + 1, serviceLane[targetNode?.service ?? "generic"] ?? 2);
        if (!levels.has(targetId) || nextLevel > (levels.get(targetId) ?? 0)) {
          levels.set(targetId, nextLevel);
        }
        if (indegree.has(targetId)) {
          indegree.set(targetId, (indegree.get(targetId) ?? 1) - 1);
          if ((indegree.get(targetId) ?? 0) <= 0 && targetNode) queue.push(targetNode);
        }
      }
    }

    const laneCounts: Record<number, number> = {};
    const positionedNodes = displayNodes.map((n, idx) => {
      const lane = levels.get(n.id) ?? serviceLane[n.service] ?? 2;
      const order = laneCounts[lane] ?? 0;
      laneCounts[lane] = order + 1;
      return {
        id: n.id ?? `node-${idx}`,
        type: "aws",
        data: { label: n.label ?? n.id ?? `Node ${idx}`, service: n.service ?? "generic" },
        position: { x: lane * laneSpacing, y: order * rowSpacing },
      };
    });

    const idToPosition = new Map(positionedNodes.map((n) => [n.id, n.position]));

    const groupNodes: any[] = [];
    const extraNodes: any[] = [];
    const extraEdges: any[] = [];

    const publicEntrypointServices = new Set<string>(["route53", "cloudfront", "apigw", "elb", "s3"]);
    const publicEntrypointNodes = positionedNodes.filter((n) => publicEntrypointServices.has(n.data.service));
    if (publicEntrypointNodes.length) {
      const anchorLane = Math.min(
        ...publicEntrypointNodes.map((n) => levels.get(n.id) ?? serviceLane[n.data.service] ?? 0)
      );
      const anchorX = anchorLane * laneSpacing;
      const avgY =
        publicEntrypointNodes.reduce((sum, n) => sum + (n.position?.y ?? 0), 0) /
        publicEntrypointNodes.length;
      const userNodeY = avgY - baseNodeHeight * 0.2;

      extraNodes.push({
        id: "public-users",
        type: "user",
        data: { label: "Users" },
        position: { x: anchorX - laneSpacing * 1.1, y: userNodeY },
        selectable: false,
        draggable: false,
      });

      for (const entry of publicEntrypointNodes) {
        extraEdges.push({
          id: `public-users-${entry.id}`,
          source: "public-users",
          target: entry.id,
          label: "public access",
          style: publicEdgeStyle,
          labelBgStyle: publicLabelBg,
          labelStyle: publicLabelStyle,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: publicEdgeStyle.stroke },
        });
      }
    }

    for (const [vpcId, members] of vpcMembership.entries()) {
      const memberPositions = members
        .map((id) => idToPosition.get(id))
        .filter(Boolean) as Array<{ x: number; y: number }>;
      if (!memberPositions.length) continue;
      const minX = Math.min(...memberPositions.map((p) => p.x));
      const maxX = Math.max(...memberPositions.map((p) => p.x));
      const minY = Math.min(...memberPositions.map((p) => p.y));
      const maxY = Math.max(...memberPositions.map((p) => p.y));
      const width = maxX - minX + baseNodeWidth + groupPaddingX;
      const height = maxY - minY + baseNodeHeight + groupPaddingY;
      const vpcNode = nodeById.get(vpcId);
      groupNodes.push({
        id: `${vpcId}-group`,
        type: "group",
        data: { label: vpcNode?.label ?? "VPC" },
        position: { x: minX - groupPaddingX / 2, y: minY - groupPaddingY / 2 },
        style: { width, height },
        selectable: false,
        draggable: false,
        zIndex: 0,
      });
    }

    const infraPositions = positionedNodes.map((n) => n.position);
    if (infraPositions.length) {
      const minX = Math.min(...infraPositions.map((p) => p.x));
      const maxX = Math.max(...infraPositions.map((p) => p.x));
      const minY = Math.min(...infraPositions.map((p) => p.y));
      const maxY = Math.max(...infraPositions.map((p) => p.y));
      const cloudPaddingX = 200;
      const cloudPaddingY = 180;
      groupNodes.unshift({
        id: "aws-cloud-frame",
        type: "frame",
        data: { label: "AWS Cloud" },
        position: { x: minX - cloudPaddingX, y: minY - cloudPaddingY },
        style: {
          width: maxX - minX + baseNodeWidth + cloudPaddingX * 2,
          height: maxY - minY + baseNodeHeight + cloudPaddingY * 2,
        },
        selectable: false,
        draggable: false,
        zIndex: -5,
      });
    }

    const laneSequence = [...new Set(positionedNodes.map((n) => levels.get(n.id) ?? serviceLane[n.data.service]))].sort(
      (a, b) => a - b
    );

    const laneBuckets = new Map<number, typeof positionedNodes>();
    for (const n of positionedNodes) {
      const lane = levels.get(n.id) ?? serviceLane[n.data.service] ?? 0;
      const bucket = laneBuckets.get(lane) ?? [];
      bucket.push(n);
      laneBuckets.set(lane, bucket);
    }

    const fallbackEdges: any[] = [];
    if (!layoutEdges.length && laneSequence.length > 1) {
      for (let i = 0; i < laneSequence.length - 1; i++) {
        const currentLane = laneSequence[i];
        const nextLane = laneSequence[i + 1];
        const fromNodes = laneBuckets.get(currentLane) ?? [];
        const toNodes = laneBuckets.get(nextLane) ?? [];
        for (const from of fromNodes) {
          for (const to of toNodes) {
            fallbackEdges.push({
              id: `fallback-${from.id}-${to.id}`,
              source: from.id,
              target: to.id,
              label: "flows_to",
              style: flowEdgeStyle,
              labelBgStyle: flowLabelBg,
              labelStyle: flowLabelStyle,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: flowEdgeStyle.stroke },
            });
          }
        }
      }
    }

    const edges = [...layoutEdges, ...fallbackEdges].map((e: any, idx: number) => {
      const relationStyle = styleForRelation(e.relation ?? e.label);
      return {
        id: e.id ?? `edge-${idx}-${e.from ?? e.source}-${e.to ?? e.target}`,
        source: e.from ?? e.source,
        target: e.to ?? e.target,
        label: e.relation ?? e.label,
        type: e.type ?? "smoothstep",
        style: e.style ?? { stroke: relationStyle.stroke, strokeWidth: relationStyle.strokeWidth },
        labelBgStyle: e.labelBgStyle ?? relationStyle.labelBgStyle,
        labelStyle: e.labelStyle ?? relationStyle.labelStyle,
        animated: true,
        markerEnd: e.markerEnd ?? { type: MarkerType.ArrowClosed, color: relationStyle.stroke },
      };
    });

    const fullEdges = [...edges, ...extraEdges];
    const allNodes = [...groupNodes, ...positionedNodes, ...extraNodes];

    return { nodes: allNodes, edges: fullEdges, rawNodes: displayNodes, rawEdges, legendNodes };
  }, [result, showInfra]);

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
            Back
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          {session ? (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Signed in as{" "}
                  <span className="font-semibold">
                    {session.user?.email || session.user?.name}
                  </span>
                </p>
                <label
                  htmlFor="folder-input"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950/70"
                >
                  <div className="rounded-full bg-sky-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                    Upload folder
                  </div>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-50">
                    Drop a Terraform folder or click to browse
                  </p>
                  <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
                    We'll read HCL, detect resources, and send a parsed graph to the backend.
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
                    <div className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
                      Selected: {folderName}
                    </div>
                  )}
                </label>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    What we parse
                  </p>
                  <p className="mt-1">Modules, providers, resources, outputs.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Destination
                  </p>
                  <p className="mt-1">Backend API for diagram synthesis.</p>
                </div>
              </div>
              {uploading && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
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
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Parse summary
                    </p>
                    <p>{result.summary}</p>
                    <p>
                      Nodes: {result.graph.nodes.length} / Edges: {result.graph.edges.length}
                    </p>
                    <div className="text-xs text-slate-400">
                      Files: {result.files.map((f) => f.name).join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Diagram view
                      </p>
                      <p className="text-slate-600">Toggle infra overlays like Route53/CloudFront/observability.</p>
                    </div>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showInfra}
                        onChange={(e) => setShowInfra(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 bg-white text-sky-500 focus:ring-sky-500"
                      />
                      <span>Show infra details</span>
                    </label>
                  </div>
                <div className="h-[520px] rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                  {flow.nodes.length ? (
                    <ReactFlow
                      nodes={flow.nodes}
                      edges={flow.edges}
                      nodeTypes={nodeTypes}
                      style={{ background: "transparent" }}
                      fitView
                      fitViewOptions={{ padding: 0.2 }}
                      defaultEdgeOptions={{
                        animated: true,
                        type: "smoothstep",
                        style: flowEdgeStyle,
                        labelBgStyle: flowLabelBg,
                        labelStyle: flowLabelStyle,
                        markerEnd: { type: MarkerType.ArrowClosed, color: flowEdgeStyle.stroke },
                      }}
                      onNodeClick={handleNodeClick}
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background gap={18} size={1} color="#e2e8f0" />
                      <Controls className="bg-white/90 text-slate-700 shadow-sm dark:bg-slate-900/90 dark:text-slate-100" />
                      </ReactFlow>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                        No diagram to show yet.
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        Shown in diagram (primary services)
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {flow.rawNodes.map((n: any) => (
                          <button
                            key={n.id}
                            onClick={() => setSelectedNodeId(n.id)}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedNodeId === n.id
                                ? "border-sky-500/70 bg-sky-500/10"
                                : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
                            }`}
                          >
                            <span
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/70"
                              style={{ border: `1px solid ${(serviceColors[n.service] ?? "#475569")}55` }}
                            >
                              <img
                                src={serviceIcons[n.service] ?? serviceIcons.generic}
                                alt={n.label}
                                className="h-6 w-6"
                              />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col text-slate-100">
                              <span className="block whitespace-normal break-words font-semibold leading-snug">
                                {n.label}
                              </span>
                              <span className="block whitespace-normal break-words text-xs uppercase tracking-[0.15em] text-slate-400">
                                {n.service}
                              </span>
                            </span>
                          </button>
                        ))}
                        {flow.rawNodes.length === 0 && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">No resources to list yet.</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        Legend (hidden detail resources)
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {flow.legendNodes.map((n: any) => (
                          <div
                            key={n.id}
                            className="flex min-w-[220px] max-w-full flex-1 basis-[220px] items-center gap-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-sm"
                          >
                            <span
                              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-800/70"
                              style={{ border: `1px solid ${(serviceColors[n.service] ?? "#475569")}40` }}
                            >
                              <img
                                src={serviceIcons[n.service] ?? serviceIcons.generic}
                                alt={n.label}
                                className="h-5 w-5 opacity-80"
                              />
                            </span>
                              <span className="flex min-w-0 flex-1 flex-col text-slate-200">
                              <span className="block whitespace-normal break-words font-semibold leading-snug">
                                {n.label}
                              </span>
                              <span className="block whitespace-normal break-words text-[11px] uppercase tracking-[0.12em] text-slate-200 dark:text-slate-500">
                                {n.service}
                              </span>
                            </span>
                          </div>
                        ))}
                        {flow.legendNodes.length === 0 && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">No hidden resources detected.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Sign in to start uploading Terraform.
              </p>
              <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
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
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-400 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  Back home
                </Link>
              </div>
            </div>
          )}
        </div>
        {selectedNodeId && result && (
          <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Selection</p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  {flow.rawNodes.find((n: any) => n.id === selectedNodeId)?.label ?? selectedNodeId}
                </p>
              </div>
              <button
                className="text-xs text-slate-200 dark:text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => setSelectedNodeId(null)}
              >
                Clear
              </button>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Metadata</p>
                <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
{JSON.stringify(
  result.graph.nodes.find((n) => n.id === selectedNodeId)?.metadata ?? {},
  null,
  2
)}
                </pre>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Relations</p>
                <div className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                  {flow.rawEdges
                    .filter((e: any) => e.from === selectedNodeId || e.to === selectedNodeId)
                    .slice(0, 10)
                    .map((e: any, idx: number) => (
                      <div key={`${e.id}-${idx}`} className="rounded-md bg-slate-950/70 px-3 py-2">
                        <span className="text-sky-300">{e.from}</span>
                        <span className="text-slate-500"> &rarr; {e.relation} &rarr; </span>
                        <span className="text-emerald-300">{e.to}</span>
                      </div>
                    ))}
                  {flow.rawEdges.filter((e: any) => e.from === selectedNodeId || e.to === selectedNodeId).length === 0 && (
                    <div className="text-slate-200 dark:text-slate-500">No relations recorded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}










