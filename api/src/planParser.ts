import type { Graph } from "./types";

type PlanJson = {
  resource_changes?: Array<{
    type: string;
    name: string;
    address: string;
    mode?: string;
    change?: {
      after?: Record<string, any>;
    };
  }>;
};

const serviceMap: Record<string, string> = {
  aws_vpc: "vpc",
  aws_subnet: "vpc",
  aws_route_table: "vpc",
  aws_route_table_association: "vpc",
  aws_internet_gateway: "vpc",
  aws_nat_gateway: "vpc",
  aws_security_group: "vpc",
  aws_security_group_rule: "vpc",
  aws_lb: "elb",
  aws_lb_target_group: "elb",
  aws_lb_listener: "elb",
  aws_lb_listener_rule: "elb",
  aws_ecs_cluster: "ecs",
  aws_ecs_service: "ecs",
  aws_ecs_task_definition: "ecs",
  aws_iam_role: "iam",
  aws_iam_policy: "iam",
  aws_iam_instance_profile: "iam",
  aws_db_instance: "rds",
  aws_rds_cluster: "rds",
  aws_rds_cluster_instance: "rds",
  aws_dynamodb_table: "dynamodb",
  aws_s3_bucket: "s3",
  aws_efs_file_system: "efs",
  aws_efs_mount_target: "efs",
  aws_elasticache_cluster: "elasticache",
  aws_elasticache_replication_group: "elasticache",
  aws_sqs_queue: "sqs",
  aws_sns_topic: "sns",
  aws_lambda_function: "lambda",
  aws_kms_key: "kms",
  aws_apigatewayv2_api: "apigw",
  aws_apigatewayv2_integration: "apigw",
  aws_apigatewayv2_stage: "apigw",
};

type Node = { id: string; label: string; type: string; service: string; metadata?: Record<string, unknown> };
type Edge = { from: string; to: string; relation: string };

export function parsePlanJsonToGraph(plan: PlanJson): { graph: Graph; summary: string } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const afterStates = extractAfterStates(plan);
  const byId = new Map<string, { type: string; name: string; after: Record<string, any> }>();

  for (const rc of afterStates) {
    const id = `${rc.type}.${rc.name}`;
    byId.set(id, rc);
    nodes.push({
      id,
      label: `${rc.type.replace("aws_", "").replace(/_/g, " ")}: ${rc.name}`,
      type: rc.type,
      service: serviceMap[rc.type] ?? "generic",
      metadata: pickMetadata(rc),
    });
  }

  for (const rc of afterStates) {
    const fromId = `${rc.type}.${rc.name}`;
    const after = rc.after;

    // VPC membership
    linkIf(edges, fromId, maybe(byId, "aws_vpc", after.vpc_id), "in_vpc");

    // Subnets
    linkIf(edges, fromId, maybe(byId, "aws_subnet", after.subnet_id), "in_subnet");
    for (const sid of normalize(after.subnet_ids)) {
      linkIf(edges, fromId, maybe(byId, "aws_subnet", sid), "in_subnet");
    }
    for (const sid of normalize(after.subnets)) {
      linkIf(edges, fromId, maybe(byId, "aws_subnet", sid), "in_subnet");
    }

    // SGs
    for (const sg of normalize(after.security_groups).concat(normalize(after.vpc_security_group_ids))) {
      linkIf(edges, fromId, maybe(byId, "aws_security_group", sg), "uses_sg");
    }

    // IAM
    linkIf(edges, fromId, maybe(byId, "aws_iam_instance_profile", after.iam_instance_profile), "uses_instance_profile");
    linkIf(edges, fromId, maybe(byId, "aws_iam_role", after.role), "assumes_role");

    // LB → TG (listener)
    if (rc.type === "aws_lb_listener" && after.default_action?.[0]?.target_group_arn) {
      const tg = resolveByArn("aws_lb_target_group", after.default_action[0].target_group_arn, byId);
      const lb = maybe(byId, "aws_lb", after.load_balancer_arn);
      linkIf(edges, lb, tg, "forwards_to");
    }

    // ECS service → TG + cluster + subnets/sg
    if (rc.type === "aws_ecs_service") {
      if (after.load_balancer && after.load_balancer[0]?.target_group_arn) {
        const tg = resolveByArn("aws_lb_target_group", after.load_balancer[0].target_group_arn, byId);
        linkIf(edges, fromId, tg, "forwards_to");
      }
      linkIf(edges, fromId, maybe(byId, "aws_ecs_cluster", after.cluster), "runs_on");
      for (const sid of normalize(after.network_configuration?.[0]?.subnets)) {
        linkIf(edges, fromId, maybe(byId, "aws_subnet", sid), "in_subnet");
      }
      for (const sg of normalize(after.network_configuration?.[0]?.security_groups)) {
        linkIf(edges, fromId, maybe(byId, "aws_security_group", sg), "uses_sg");
      }
    }

    // Route table association
    if (rc.type === "aws_route_table_association") {
      linkIf(edges, maybe(byId, "aws_route_table", after.route_table_id), maybe(byId, "aws_subnet", after.subnet_id), "associates");
    }

    // KMS links
    linkIf(edges, fromId, maybe(byId, "aws_kms_key", after.kms_key_id), "encrypted_by");
  }

  return {
    graph: { nodes, edges },
    summary: `Parsed ${nodes.length} resources; derived ${edges.length} relationships (plan JSON)`,
  };
}

function extractAfterStates(plan: PlanJson) {
  const arr: Array<{ type: string; name: string; after: Record<string, any> }> = [];
  for (const rc of plan.resource_changes ?? []) {
    if (!rc.change?.after) continue;
    if (rc.mode && rc.mode !== "managed") continue;
    arr.push({ type: rc.type, name: rc.name, after: rc.change.after });
  }
  return arr;
}

function pickMetadata(rc: { type: string; after: Record<string, any> }): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  const after = rc.after;
  if (after.arn) meta.arn = after.arn;
  if (after.role) meta.role = after.role;
  if (after.iam_instance_profile) meta.iam_instance_profile = after.iam_instance_profile;
  if (after.security_groups) meta.security_groups = after.security_groups;
  if (after.vpc_security_group_ids) meta.security_groups = after.vpc_security_group_ids;
  if (after.subnet_id) meta.subnet_id = after.subnet_id;
  if (after.subnet_ids) meta.subnet_ids = after.subnet_ids;
  if (after.vpc_id) meta.vpc_id = after.vpc_id;
  if (after.kms_key_id) meta.kms_key_id = after.kms_key_id;
  return meta;
}

function linkIf(edges: Edge[], from?: string | null, to?: string | null, relation?: string) {
  if (!from || !to || !relation) return;
  edges.push({ from, to, relation });
}

function normalize(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  return [value as string];
}

function maybe(byId: Map<string, any>, type: string, value: string | undefined): string | null {
  if (!value) return null;
  const candidate = `${type}.${strip(value)}`;
  if (byId.has(candidate)) return candidate;
  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length >= 2) {
      const refType = parts[0];
      const refNameRaw = parts[1];
      if (refType && refNameRaw) {
        const refName = strip(refNameRaw);
        const candidate2 = `${refType}.${refName}`;
        if (byId.has(candidate2)) return candidate2;
      }
    }
  }
  return null;
}

function resolveByArn(type: string, arn: string, byId: Map<string, any>): string | null {
  if (!arn) return null;
  for (const id of byId.keys()) {
    if (type && !id.startsWith(`${type}.`)) continue;
    const name = id.split(".")[1];
    if (name && arn.includes(name)) return id;
  }
  return null;
}

function strip(name: string): string {
  return name.replace(/\[\*\]/g, "").replace(/\[.*?\]/g, "");
}
