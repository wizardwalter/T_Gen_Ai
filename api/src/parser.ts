import type { Graph, GraphEdge, GraphNode } from "./types";

type ResourceDef = {
  type: string;
  name: string;
  body: Record<string, any>;
};

const serviceMap: Record<string, string> = {
  // Compute / containers / serverless
  aws_instance: "ec2",
  aws_launch_template: "ec2",
  aws_autoscaling_group: "ec2",
  aws_ecs_cluster: "ecs",
  aws_ecs_service: "ecs",
  aws_ecs_task_definition: "ecs",
  aws_ecr_repository: "ecr",
  aws_eks_cluster: "eks",
  aws_eks_node_group: "eks",
  aws_lambda_function: "lambda",

  // Networking / edge
  aws_vpc: "vpc",
  aws_subnet: "vpc",
  aws_route_table: "vpc",
  aws_route_table_association: "vpc",
  aws_internet_gateway: "vpc",
  aws_nat_gateway: "vpc",
  aws_security_group: "vpc",
  aws_security_group_rule: "vpc",
  aws_vpc_endpoint: "vpc",
  aws_network_acl: "vpc",
  aws_lb: "elb",
  aws_alb: "elb",
  aws_lb_target_group: "elb",
  aws_alb_target_group: "elb",
  aws_lb_listener: "elb",
  aws_lb_listener_rule: "elb",
  aws_route53_zone: "route53",
  aws_route53_record: "route53",
  aws_cloudfront_distribution: "cloudfront",
  aws_apigatewayv2_api: "apigw",
  aws_apigatewayv2_stage: "apigw",
  aws_apigatewayv2_integration: "apigw",
  aws_api_gateway_rest_api: "apigw",
  aws_api_gateway_stage: "apigw",
  aws_api_gateway_integration: "apigw",
  aws_cloudfront_origin_access_control: "cloudfront",

  // Data / storage
  aws_s3_bucket: "s3",
  aws_s3_bucket_policy: "s3",
  aws_s3_bucket_ownership_controls: "s3",
  aws_s3_bucket_public_access_block: "s3",
  aws_efs_file_system: "efs",
  aws_efs_mount_target: "efs",
  aws_db_instance: "rds",
  aws_rds_cluster: "rds",
  aws_rds_cluster_instance: "rds",
  aws_dynamodb_table: "dynamodb",
  aws_elasticache_cluster: "elasticache",
  aws_elasticache_replication_group: "elasticache",

  // Messaging / events
  aws_sqs_queue: "sqs",
  aws_sns_topic: "sns",
  aws_cloudwatch_event_bus: "eventbridge",
  aws_cloudwatch_event_rule: "eventbridge",
  aws_cloudwatch_event_target: "eventbridge",

  // Identity / security / secrets
  aws_iam_role: "iam",
  aws_iam_policy: "iam",
  aws_iam_instance_profile: "iam",
  aws_kms_key: "kms",
  aws_secretsmanager_secret: "secrets",
  aws_ssm_parameter: "ssm",
  aws_iam_role_policy_attachment: "iam",
  aws_lambda_permission: "lambda",

  // Observability
  aws_cloudwatch_log_group: "observability",
  aws_cloudwatch_metric_alarm: "observability",
  aws_sns_topic: "sns",
  aws_sns_topic_subscription: "sns",
};

type TfInputFile = { name: string; content: string };

export function parseTerraformToGraph(files: TfInputFile[]): { graph: Graph; summary: string } {
  try {
    const allResources: ResourceDef[] = [];
    const errors: string[] = [];

    for (const file of files) {
      let resources: ResourceDef[] = [];

      try {
        resources = collectResourcesFromRegex(file.content);
      } catch (err) {
        errors.push(`${file.name}: ${(err as Error).message}`);
      }

      if (resources.length) {
        allResources.push(...resources);
      }
    }

    if (!allResources.length) {
      const reason =
        errors.length > 0
          ? `No resources parsed. Errors: ${errors.slice(0, 3).join(" | ")}`
          : "No resources found in Terraform files.";
      return fallbackGraph(reason);
    }

    const nodes = allResources.map(toGraphNode);
    const edges = buildEdges(allResources);

    const errorNote =
      errors.length > 0 ? ` (skipped ${errors.length} file(s) due to parse errors)` : "";

    // Debug log for visibility in dev/test
    // eslint-disable-next-line no-console
    console.log(
      `[parser] resources=${allResources.length} edges=${edges.length} parser=regex-only${
        errors.length ? ` errors=${errors.length}` : ""
      }`
    );

    return {
      graph: { nodes, edges },
      summary: `Parsed ${allResources.length} resources; derived ${edges.length} relationships${errorNote}.`,
    };
  } catch (err) {
    return fallbackGraph(`Parser crashed: ${(err as Error).message}`);
  }
}

function collectResourcesFromRegex(content: string): ResourceDef[] {
  const results: ResourceDef[] = [];
  const regex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const [, type, name] = match;
    if (!type || !name) continue;

    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    for (; i < content.length; i++) {
      const ch = content[i];
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          break;
        }
      }
    }
    const block = content.slice(start, i);
    const meta = extractMetadata(block);

    results.push({ type: String(type), name: String(name), body: meta });
  }
  return results;
}

function extractMetadata(block: string): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  const pickString = (key: string) => {
    // quoted
    let m = new RegExp(`${key}\\s*=\\s*"([^"]+)"`).exec(block);
    if (m && m[1]) {
      meta[key] = m[1];
      return;
    }
    // bare ref like aws_lb_target_group.app.arn
    m = new RegExp(`${key}\\s*=\\s*([\\w\\-\\.\\[\\]\\*]+)`).exec(block);
    if (m && m[1]) meta[key] = m[1];
  };

  const pickArray = (key: string) => {
    const regex = new RegExp(`${key}\\s*=\\s*\\[([^\\]]+)\\]`);
    const m = regex.exec(block);
    if (m && m[1]) {
      const values = m[1]
        .split(",")
        .map((v) => v.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
      if (values.length) {
        meta[key] = values;
        return;
      }
    }
    // handle single ref without brackets (e.g., subnets = aws_subnet.public[*].id)
    const m2 = new RegExp(`${key}\\s*=\\s*([\\w\\-\\.\\[\\]\\*]+)`).exec(block);
    if (m2 && m2[1]) meta[key] = [m2[1]];
  };

  pickString("vpc_id");
  pickString("subnet_id");
  pickArray("subnet_ids");
  pickArray("subnets");
  pickArray("security_groups");
  pickArray("vpc_security_group_ids");
  pickString("iam_instance_profile");
  pickString("role");
  pickString("target_group_arn");
  pickString("load_balancer_arn");
  pickString("route_table_id");
  pickString("igw_id");
  pickString("gateway_id");
  pickString("api_id");
  pickString("integration_uri");
  pickString("target");

  return meta;
}

function toGraphNode(res: ResourceDef): GraphNode {
  const service = serviceMap[res.type] ?? "generic";
  return {
    id: `${res.type}.${res.name}`,
    label: `${res.type.replace("aws_", "").replace(/_/g, " ")}: ${res.name}`,
    type: res.type,
    service,
    metadata: pickMetadata(res),
  };
}

function pickMetadata(res: ResourceDef): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  if (res.body.arn) meta.arn = res.body.arn;
  if (res.body.role) meta.role = res.body.role;
  if (res.body.iam_instance_profile) meta.iam_instance_profile = res.body.iam_instance_profile;
  if (res.body.security_groups) meta.security_groups = res.body.security_groups;
  if (res.body.vpc_security_group_ids) meta.security_groups = res.body.vpc_security_group_ids;
  if (res.body.subnet_id) meta.subnet_id = res.body.subnet_id;
  if (res.body.subnet_ids) meta.subnet_ids = res.body.subnet_ids;
  if (res.body.vpc_id) meta.vpc_id = res.body.vpc_id;
  if (res.body.policy_arn) meta.policy_arn = res.body.policy_arn;
  return meta;
}

function buildEdges(resources: ResourceDef[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const byId = new Map(resources.map((r) => [`${r.type}.${r.name}`, r]));

  for (const res of resources) {
    const fromId = `${res.type}.${res.name}`;

    // VPC membership for SG/Subnets/Route tables/IGW/NAT
    if (res.type === "aws_security_group" && res.body.vpc_id) {
      const targetId = maybeResourceId("aws_vpc", res.body.vpc_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_vpc" });
    }
    if (res.type === "aws_subnet" && res.body.vpc_id) {
      const targetId = maybeResourceId("aws_vpc", res.body.vpc_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_vpc" });
    }
    if (res.type === "aws_route_table" && res.body.vpc_id) {
      const targetId = maybeResourceId("aws_vpc", res.body.vpc_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_vpc" });
    }
    if (res.type === "aws_internet_gateway" && res.body.vpc_id) {
      const targetId = maybeResourceId("aws_vpc", res.body.vpc_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "attached_to" });
    }
    if (res.type === "aws_nat_gateway" && res.body.subnet_id) {
      const targetId = maybeResourceId("aws_subnet", res.body.subnet_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_subnet" });
    }

    // Security groups attached to compute or ELB/ALB/TargetGroups
    const sgFields = ["security_groups", "vpc_security_group_ids"];
    for (const field of sgFields) {
      const sgs = normalizeArray(res.body[field]);
      for (const sg of sgs) {
        const targetId = maybeResourceId("aws_security_group", sg, byId);
        if (targetId) edges.push({ from: fromId, to: targetId, relation: "uses_sg" });
      }
    }

    // Subnets / VPC
    const subnetId = res.body.subnet_id as string | undefined;
    if (subnetId) {
      const targetId = maybeResourceId("aws_subnet", subnetId, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_subnet" });
    }
    const subnetIds = normalizeArray(res.body.subnet_ids);
    for (const sid of subnetIds) {
      const targetId = maybeResourceId("aws_subnet", sid, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_subnet" });
    }
    const subnets = normalizeArray(res.body.subnets);
    for (const sid of subnets) {
      const targetId = maybeResourceId("aws_subnet", sid, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_subnet" });
    }
    if (res.body.vpc_id) {
      const targetId = maybeResourceId("aws_vpc", res.body.vpc_id, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_vpc" });
    }

    // IAM roles / instance profiles
    if (res.body.iam_instance_profile) {
      const targetId = maybeResourceId("aws_iam_instance_profile", res.body.iam_instance_profile, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "uses_instance_profile" });
    }
    if (res.body.role) {
      const targetId = maybeResourceId("aws_iam_role", res.body.role, byId);
      if (targetId) edges.push({ from: fromId, to: targetId, relation: "assumes_role" });
    }

    // Target group attachments
    if (res.type === "aws_lb_target_group_attachment" && res.body.target_group_arn) {
      const tgId = resolveByArn("aws_lb_target_group", res.body.target_group_arn, byId);
      if (tgId && res.body.target_id) {
        const targetResId = resolveByArnOrRef(res.body.target_id, byId);
        if (targetResId) edges.push({ from: tgId, to: targetResId, relation: "routes_to" });
      }
    }

    // ALB -> TargetGroup linkage via listener rule (simplified)
    if (res.type === "aws_lb_listener" && res.body.default_action?.target_group_arn) {
      const tgId = resolveByArn("aws_lb_target_group", res.body.default_action.target_group_arn, byId);
      const lbId = maybeResourceId("aws_lb", res.body.load_balancer_arn, byId);
      if (lbId && tgId) edges.push({ from: lbId, to: tgId, relation: "forwards_to" });
    }

    // ECS service -> TG and cluster
    if (res.type === "aws_ecs_service") {
      if (res.body.target_group_arn) {
        const tgId = resolveByArn("aws_lb_target_group", res.body.target_group_arn, byId);
        if (tgId) edges.push({ from: fromId, to: tgId, relation: "forwards_to" });
      }
      if (res.body.cluster) {
        const clusterId = maybeResourceId("aws_ecs_cluster", res.body.cluster, byId);
        if (clusterId) edges.push({ from: fromId, to: clusterId, relation: "runs_on" });
      }
    }

    // Route table association
  if (res.type === "aws_route_table_association") {
    if (res.body.route_table_id) {
      const rtId = maybeResourceId("aws_route_table", res.body.route_table_id, byId);
      if (rtId && res.body.subnet_id) {
        const subId = maybeResourceId("aws_subnet", res.body.subnet_id, byId);
        if (subId) edges.push({ from: rtId, to: subId, relation: "associates" });
      }
    }
  }

    // API Gateway v2 integration -> Lambda or ALB/NLB
    if (res.type === "aws_apigatewayv2_integration" && res.body.integration_uri) {
      const lambdaId = resolveByArn("aws_lambda_function", res.body.integration_uri, byId);
      if (lambdaId) edges.push({ from: fromId, to: lambdaId, relation: "invokes" });
      const lbId = resolveByArn("aws_lb", res.body.integration_uri, byId);
      if (lbId) edges.push({ from: fromId, to: lbId, relation: "forwards_to" });
    }
    if (res.type === "aws_apigatewayv2_integration" && res.body.api_id) {
      const apiId = maybeResourceId("aws_apigatewayv2_api", res.body.api_id, byId);
      if (apiId) edges.push({ from: apiId, to: fromId, relation: "has_integration" });
    }

    // API Gateway v2 routes/stages -> API/integration
    if (res.type === "aws_apigatewayv2_route") {
      if (res.body.api_id) {
        const apiId = maybeResourceId("aws_apigatewayv2_api", res.body.api_id, byId);
        if (apiId) edges.push({ from: apiId, to: fromId, relation: "has_route" });
      }
      if (res.body.target) {
        const match = /integrations\/([\w\-.]+)/.exec(res.body.target as string);
        const integrationIdRaw = match?.[1];
        if (integrationIdRaw) {
          const integrationId = maybeResourceId("aws_apigatewayv2_integration", integrationIdRaw, byId);
          if (integrationId) edges.push({ from: fromId, to: integrationId, relation: "routes_to" });
        }
      }
    }

    if (res.type === "aws_apigatewayv2_stage" && res.body.api_id) {
      const apiId = maybeResourceId("aws_apigatewayv2_api", res.body.api_id, byId);
      if (apiId) edges.push({ from: apiId, to: fromId, relation: "has_stage" });
    }

    // Lambda -> VPC subnets/SG/KMS
    if (res.type === "aws_lambda_function") {
      for (const sid of normalizeArray(res.body.subnet_ids)) {
        const targetId = maybeResourceId("aws_subnet", sid, byId);
        if (targetId) edges.push({ from: fromId, to: targetId, relation: "in_subnet" });
      }
      for (const sg of normalizeArray(res.body.vpc_config?.security_group_ids || res.body.security_groups)) {
        const targetId = maybeResourceId("aws_security_group", sg, byId);
        if (targetId) edges.push({ from: fromId, to: targetId, relation: "uses_sg" });
      }
      if (res.body.kms_key_arn) {
        const targetId = resolveByArn("aws_kms_key", res.body.kms_key_arn, byId);
        if (targetId) edges.push({ from: fromId, to: targetId, relation: "encrypted_by" });
      }
      if (res.body.role) {
        const roleId = resolveByArn("aws_iam_role", res.body.role, byId) ?? maybeResourceId("aws_iam_role", res.body.role, byId);
        if (roleId) edges.push({ from: fromId, to: roleId, relation: "assumes_role" });
      }
    }

    // CloudFront -> origin (S3 or ALB) heuristic
    if (res.type === "aws_cloudfront_distribution" && res.body.origin) {
      const origins = normalizeArray(res.body.origin);
      for (const origin of origins) {
        const originObj = origin as any;
        const domain =
          originObj && typeof originObj === "object"
            ? (originObj.domain_name as string | undefined)
            : undefined;
        const s3 = resolveByArn("aws_s3_bucket", origin as string, byId);
        if (s3) edges.push({ from: fromId, to: s3, relation: "serves_from" });
        const lb = resolveByArn("aws_lb", origin as string, byId);
        if (lb) edges.push({ from: fromId, to: lb, relation: "forwards_to" });

        if (domain) {
          for (const res of resources) {
            if (res.type !== "aws_s3_bucket") continue;
            const bucketName = res.body.bucket as string | undefined;
            if (bucketName && domain.includes(bucketName)) {
              edges.push({ from: fromId, to: `aws_s3_bucket.${res.name}`, relation: "serves_from" });
            }
          }
        }
      }
    }

    // Route53 record -> CloudFront / ALB / API GW heuristic via target string
    if (res.type === "aws_route53_record") {
      const targets = normalizeArray(res.body.records || res.body.alias?.name);
      for (const t of targets) {
        const cf = resolveByArn("aws_cloudfront_distribution", t, byId);
        if (cf) edges.push({ from: fromId, to: cf, relation: "routes_to" });
        const lb = resolveByArn("aws_lb", t, byId);
        if (lb) edges.push({ from: fromId, to: lb, relation: "routes_to" });
        const api = resolveByArn("aws_apigatewayv2_api", t, byId);
        if (api) edges.push({ from: fromId, to: api, relation: "routes_to" });
      }
    }

    // EKS: cluster -> node group
    if (res.type === "aws_eks_node_group" && res.body.cluster_name) {
      const clusterId = maybeResourceId("aws_eks_cluster", res.body.cluster_name, byId);
      if (clusterId) edges.push({ from: fromId, to: clusterId, relation: "member_of" });
    }
  }

  return edges;
}

function normalizeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  return [value as string];
}

function maybeResourceId(type: string, value: string, byId: Map<string, ResourceDef>): string | null {
  if (!value) return null;

  const stripName = (name: string) => name.replace(/\[\*\]/g, "").replace(/\[.*?\]/g, "");

  // If value looks like aws_type.name.suffix, parse it
  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length >= 2) {
      const refType = parts[0] && parts[0].startsWith("aws_") ? parts[0] : type;
      const refNameRaw = parts[1];
      if (refType && refNameRaw) {
        const refName = stripName(refNameRaw);
        const candidate = `${refType}.${refName}`;
        if (byId.has(candidate)) return candidate;
      }
    }
  }

  // Try exact fallback with provided type
  const candidate = `${type}.${stripName(value)}`;
  if (byId.has(candidate)) return candidate;

  return null;
}

function resolveByArn(type: string, arn: string, byId: Map<string, ResourceDef>): string | null {
  // Simple heuristic: match by name suffix in ARN
  if (!arn) return null;
  for (const id of byId.keys()) {
    if (!id.startsWith(`${type}.`)) continue;
    const name = id.split(".")[1];
    if (name && arn.includes(name)) return id;
  }
  return null;
}

function resolveByArnOrRef(value: string, byId: Map<string, ResourceDef>): string | null {
  if (!value) return null;
  const arnHit = resolveByArn("", value, byId);
  if (arnHit) return arnHit;
  for (const id of byId.keys()) {
    const name = id.split(".")[1];
    if (name && value.includes(name)) return id;
  }
  return null;
}

function fallbackGraph(reason: string): { graph: Graph; summary: string } {
  const nodes: GraphNode[] = [
    { id: "placeholder.ui", label: "UI", type: "placeholder", service: "ui" },
    { id: "placeholder.api", label: "API", type: "placeholder", service: "api" },
    { id: "placeholder.db", label: "DynamoDB", type: "placeholder", service: "dynamodb" },
  ];
  const edges: GraphEdge[] = [
    { from: "placeholder.ui", to: "placeholder.api", relation: "calls" },
    { from: "placeholder.api", to: "placeholder.db", relation: "stores_in" },
  ];
  return { graph: { nodes, edges }, summary: reason };
}
