"use client";

import { useMemo, useRef, useState } from "react";
import { COMPOSER_EXAMPLE_PRESET_BY_ID } from "../examples/presets";

type ResourceType =
  | "route53_record"
  | "cloudfront_distribution"
  | "api_gateway_rest_api"
  | "lambda_function"
  | "ecs_service"
  | "db_instance"
  | "dynamodb_table"
  | "s3_bucket"
  | "security_group"
  | "iam_role"
  | "iam_policy"
  | "cloudwatch_metric_alarm";

type FieldType = "text" | "number" | "textarea" | "select";
type FieldSchema = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

type ResourceTemplate = {
  type: ResourceType;
  label: string;
  detail: string;
  icon: string;
  terraformType: string;
  fields: FieldSchema[];
};

type CanvasResource = {
  id: string;
  type: ResourceType;
  label: string;
  columnId: string;
  terraformType: string;
  fields: FieldSchema[];
  config: Record<string, string>;
  integrations: ResourceIntegration[];
};

type IntegrationMode =
  | "invoke"
  | "read"
  | "read_write"
  | "publish"
  | "consume"
  | "network_ingress"
  | "assume_role"
  | "monitor"
  | "custom";

type ResourceIntegration = {
  targetId: string;
  mode: IntegrationMode;
  manualPolicy: string;
};

type GeneratedFile = {
  name: string;
  content: string;
};

type DirectoryExportWritable = {
  write: (data: string) => Promise<void>;
  close: () => Promise<void>;
};

type DirectoryExportFileHandle = {
  createWritable: () => Promise<DirectoryExportWritable>;
};

type DirectoryExportHandle = {
  getFileHandle: (name: string, options: { create: true }) => Promise<DirectoryExportFileHandle>;
};

const ICON_BASE = (process.env.NEXT_PUBLIC_ICON_BASE ?? "").replace(/\/+$/, "");
const iconPath = (path: string) => (ICON_BASE ? `${ICON_BASE}${path}` : "");
const genericIcon =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.6'><rect x='3' y='3' width='18' height='18' rx='4'/><path d='M7 12h10M12 7v10'/></svg>",
  );

const templates: ResourceTemplate[] = [
  {
    type: "route53_record",
    label: "Route53 Record",
    detail: "DNS record for external routing",
    icon: iconPath("/aws-icons/Networking-Content-Delivery/Route-53.svg"),
    terraformType: "aws_route53_record",
    fields: [
      { key: "name", label: "Record Name", type: "text", required: true, placeholder: "api.example.com" },
      { key: "zone_id", label: "Zone ID", type: "text", required: true, placeholder: "Z123ABC..." },
      { key: "type", label: "Record Type", type: "select", required: true, options: ["A", "AAAA", "CNAME", "TXT"] },
      { key: "ttl", label: "TTL", type: "number", placeholder: "300" },
      { key: "records", label: "Records (comma-separated)", type: "text", placeholder: "1.2.3.4" },
      { key: "set_identifier", label: "Set Identifier", type: "text", placeholder: "blue" },
      { key: "health_check_id", label: "Health Check ID", type: "text", placeholder: "abc-123" },
      { key: "weighted_routing_weight", label: "Weighted Routing Weight", type: "number", placeholder: "100" },
    ],
  },
  {
    type: "cloudfront_distribution",
    label: "CloudFront",
    detail: "CDN distribution",
    icon: iconPath("/aws-icons/Networking-Content-Delivery/CloudFront.svg"),
    terraformType: "aws_cloudfront_distribution",
    fields: [
      { key: "comment", label: "Comment", type: "text", placeholder: "Main web distribution" },
      { key: "origin_domain_name", label: "Origin Domain Name", type: "text", required: true, placeholder: "example.s3.amazonaws.com" },
      { key: "origin_id", label: "Origin ID", type: "text", required: true, placeholder: "s3-origin" },
      { key: "viewer_protocol_policy", label: "Viewer Protocol Policy", type: "select", required: true, options: ["allow-all", "redirect-to-https", "https-only"] },
      { key: "enabled", label: "Enabled", type: "select", required: true, options: ["true", "false"] },
      { key: "default_root_object", label: "Default Root Object", type: "text", placeholder: "index.html" },
      { key: "aliases_csv", label: "Aliases (comma-separated)", type: "text", placeholder: "app.example.com,www.example.com" },
      { key: "price_class", label: "Price Class", type: "select", options: ["PriceClass_All", "PriceClass_200", "PriceClass_100"] },
    ],
  },
  {
    type: "api_gateway_rest_api",
    label: "API Gateway",
    detail: "Public API front door",
    icon: iconPath("/aws-icons/App-Integration/API-Gateway.svg"),
    terraformType: "aws_api_gateway_rest_api",
    fields: [
      { key: "name", label: "API Name", type: "text", required: true, placeholder: "orders-api" },
      { key: "description", label: "Description", type: "text", placeholder: "Public REST API" },
      { key: "endpoint_type", label: "Endpoint Type", type: "select", options: ["EDGE", "REGIONAL", "PRIVATE"] },
      { key: "api_key_source", label: "API Key Source", type: "select", options: ["HEADER", "AUTHORIZER"] },
      { key: "minimum_compression_size", label: "Minimum Compression Size", type: "number", placeholder: "0" },
      { key: "binary_media_types_csv", label: "Binary Media Types (comma-separated)", type: "text", placeholder: "application/octet-stream" },
      { key: "methods_json", label: "Methods JSON", type: "textarea", placeholder: "[{\"resource_path\":\"/orders\",\"http_method\":\"GET\",\"authorization\":\"NONE\",\"api_key_required\":false}]" },
      { key: "integrations_json", label: "Integrations JSON", type: "textarea", placeholder: "[{\"resource_path\":\"/orders\",\"http_method\":\"GET\",\"type\":\"AWS_PROXY\",\"integration_http_method\":\"POST\",\"uri\":\"arn:aws:apigateway:...:lambda:path/...\"}]" },
    ],
  },
  {
    type: "lambda_function",
    label: "Lambda",
    detail: "Event-driven compute",
    icon: iconPath("/aws-icons/Compute/Lambda.svg"),
    terraformType: "aws_lambda_function",
    fields: [
      { key: "function_name", label: "Function Name", type: "text", required: true, placeholder: "orders-handler" },
      { key: "role", label: "IAM Role ARN", type: "text", required: true, placeholder: "arn:aws:iam::123:role/lambda-role" },
      { key: "runtime", label: "Runtime", type: "select", required: true, options: ["nodejs20.x", "python3.12", "java21", "provided.al2023"] },
      { key: "handler", label: "Handler", type: "text", required: true, placeholder: "index.handler" },
      { key: "code_source", label: "Code Source (filename/s3/image_uri)", type: "text", required: true, placeholder: "build/lambda.zip" },
      { key: "memory_size", label: "Memory MB", type: "number", placeholder: "512" },
      { key: "timeout", label: "Timeout Seconds", type: "number", placeholder: "30" },
      { key: "architectures", label: "Architectures", type: "select", options: ["x86_64", "arm64"] },
      { key: "publish", label: "Publish Version", type: "select", options: ["false", "true"] },
      { key: "reserved_concurrent_executions", label: "Reserved Concurrent Executions", type: "number", placeholder: "-1" },
      { key: "environment_variables_json", label: "Environment Variables JSON", type: "textarea", placeholder: "{\"STAGE\":\"prod\"}" },
      { key: "vpc_subnet_ids_csv", label: "VPC Subnet IDs (comma-separated)", type: "text", placeholder: "subnet-1,subnet-2" },
      { key: "vpc_security_group_ids_csv", label: "VPC Security Group IDs (comma-separated)", type: "text", placeholder: "sg-123,sg-456" },
      { key: "layers_csv", label: "Layers (comma-separated)", type: "text", placeholder: "arn:aws:lambda:...:layer:shared:1" },
    ],
  },
  {
    type: "ecs_service",
    label: "ECS Service",
    detail: "Container application service",
    icon: iconPath("/aws-icons/Containers/Elastic-Container-Service.svg"),
    terraformType: "aws_ecs_service",
    fields: [
      { key: "name", label: "Service Name", type: "text", required: true, placeholder: "api-service" },
      { key: "cluster", label: "Cluster ARN/Name", type: "text", required: true, placeholder: "arn:aws:ecs:..." },
      { key: "task_definition", label: "Task Definition ARN", type: "text", required: true, placeholder: "arn:aws:ecs:task-definition/..." },
      { key: "desired_count", label: "Desired Count", type: "number", placeholder: "2" },
      { key: "launch_type", label: "Launch Type", type: "select", options: ["FARGATE", "EC2"] },
      { key: "platform_version", label: "Platform Version", type: "text", placeholder: "LATEST" },
      { key: "deployment_minimum_healthy_percent", label: "Deployment Minimum Healthy Percent", type: "number", placeholder: "50" },
      { key: "deployment_maximum_percent", label: "Deployment Maximum Percent", type: "number", placeholder: "200" },
      { key: "enable_execute_command", label: "Enable Execute Command", type: "select", options: ["false", "true"] },
      { key: "network_subnets_csv", label: "Network Subnets (comma-separated)", type: "text", placeholder: "subnet-1,subnet-2" },
      { key: "network_security_groups_csv", label: "Network Security Groups (comma-separated)", type: "text", placeholder: "sg-123,sg-456" },
    ],
  },
  {
    type: "db_instance",
    label: "RDS Instance",
    detail: "Managed relational database",
    icon: iconPath("/aws-icons/Database/RDS.svg"),
    terraformType: "aws_db_instance",
    fields: [
      { key: "identifier", label: "DB Identifier", type: "text", required: true, placeholder: "orders-db" },
      { key: "allocated_storage", label: "Allocated Storage (GB)", type: "number", required: true, placeholder: "20" },
      { key: "engine", label: "Engine", type: "select", required: true, options: ["postgres", "mysql", "mariadb"] },
      { key: "instance_class", label: "Instance Class", type: "text", required: true, placeholder: "db.t3.micro" },
      { key: "username", label: "Master Username", type: "text", required: true, placeholder: "admin" },
      { key: "password", label: "Master Password", type: "text", required: true, placeholder: "use secret manager" },
      { key: "skip_final_snapshot", label: "Skip Final Snapshot", type: "select", options: ["true", "false"] },
      { key: "db_name", label: "DB Name", type: "text", placeholder: "orders" },
      { key: "engine_version", label: "Engine Version", type: "text", placeholder: "16.2" },
      { key: "storage_encrypted", label: "Storage Encrypted", type: "select", options: ["true", "false"] },
      { key: "multi_az", label: "Multi-AZ", type: "select", options: ["false", "true"] },
      { key: "backup_retention_period", label: "Backup Retention Period", type: "number", placeholder: "7" },
      { key: "deletion_protection", label: "Deletion Protection", type: "select", options: ["false", "true"] },
    ],
  },
  {
    type: "dynamodb_table",
    label: "DynamoDB Table",
    detail: "NoSQL datastore",
    icon: iconPath("/aws-icons/Database/DynamoDB.svg"),
    terraformType: "aws_dynamodb_table",
    fields: [
      { key: "name", label: "Table Name", type: "text", required: true, placeholder: "orders" },
      { key: "hash_key", label: "Hash Key", type: "text", required: true, placeholder: "id" },
      { key: "attribute_name", label: "Attribute Name", type: "text", required: true, placeholder: "id" },
      { key: "attribute_type", label: "Attribute Type", type: "select", required: true, options: ["S", "N", "B"] },
      { key: "billing_mode", label: "Billing Mode", type: "select", options: ["PAY_PER_REQUEST", "PROVISIONED"] },
      { key: "range_key", label: "Range Key", type: "text", placeholder: "sk" },
      { key: "ttl_attribute_name", label: "TTL Attribute Name", type: "text", placeholder: "expiresAt" },
      { key: "ttl_enabled", label: "TTL Enabled", type: "select", options: ["false", "true"] },
      { key: "stream_enabled", label: "Stream Enabled", type: "select", options: ["false", "true"] },
      { key: "stream_view_type", label: "Stream View Type", type: "select", options: ["NEW_IMAGE", "OLD_IMAGE", "NEW_AND_OLD_IMAGES", "KEYS_ONLY"] },
    ],
  },
  {
    type: "s3_bucket",
    label: "S3 Bucket",
    detail: "Object storage bucket",
    icon: iconPath("/aws-icons/Storage/Simple-Storage-Service.svg"),
    terraformType: "aws_s3_bucket",
    fields: [
      { key: "bucket", label: "Bucket Name", type: "text", required: true, placeholder: "my-app-assets-prod" },
      { key: "force_destroy", label: "Force Destroy", type: "select", options: ["true", "false"] },
      { key: "acl", label: "ACL", type: "select", options: ["private", "public-read"] },
      { key: "versioning_enabled", label: "Versioning Enabled", type: "select", options: ["false", "true"] },
      { key: "object_lock_enabled", label: "Object Lock Enabled", type: "select", options: ["false", "true"] },
      { key: "block_public_acls", label: "Block Public ACLs", type: "select", options: ["true", "false"] },
      { key: "block_public_policy", label: "Block Public Policy", type: "select", options: ["true", "false"] },
      { key: "ignore_public_acls", label: "Ignore Public ACLs", type: "select", options: ["true", "false"] },
      { key: "restrict_public_buckets", label: "Restrict Public Buckets", type: "select", options: ["true", "false"] },
    ],
  },
  {
    type: "security_group",
    label: "Security Group",
    detail: "Network access control",
    icon: iconPath("/aws-icons/Security-Identity-Compliance/Identity-and-Access-Management.svg"),
    terraformType: "aws_security_group",
    fields: [
      { key: "name", label: "Group Name", type: "text", required: true, placeholder: "web-sg" },
      { key: "description", label: "Description", type: "text", required: true, placeholder: "Web tier access" },
      { key: "vpc_id", label: "VPC ID", type: "text", required: true, placeholder: "vpc-123456" },
      { key: "ingress_ports", label: "Ingress Ports", type: "text", placeholder: "443,80" },
      { key: "ingress_cidrs", label: "Ingress CIDRs", type: "text", placeholder: "0.0.0.0/0" },
      { key: "egress_ports", label: "Egress Ports", type: "text", placeholder: "0-65535" },
      { key: "egress_cidrs", label: "Egress CIDRs", type: "text", placeholder: "0.0.0.0/0" },
      { key: "revoke_rules_on_delete", label: "Revoke Rules On Delete", type: "select", options: ["false", "true"] },
    ],
  },
  {
    type: "iam_role",
    label: "IAM Role",
    detail: "Service execution role",
    icon: iconPath("/aws-icons/Security-Identity-Compliance/Identity-and-Access-Management.svg"),
    terraformType: "aws_iam_role",
    fields: [
      { key: "name", label: "Role Name", type: "text", required: true, placeholder: "lambda-execution-role" },
      { key: "assume_role_policy", label: "Assume Role Policy JSON", type: "textarea", required: true, placeholder: "{\"Version\":\"2012-10-17\",...}" },
      { key: "path", label: "Path", type: "text", placeholder: "/" },
      { key: "max_session_duration", label: "Max Session Duration", type: "number", placeholder: "3600" },
      { key: "permissions_boundary", label: "Permissions Boundary ARN", type: "text", placeholder: "arn:aws:iam::...:policy/Boundary" },
      { key: "managed_policy_arns_csv", label: "Managed Policy ARNs (comma-separated)", type: "text", placeholder: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" },
    ],
  },
  {
    type: "iam_policy",
    label: "IAM Policy",
    detail: "Permission policy",
    icon: iconPath("/aws-icons/Security-Identity-Compliance/Identity-and-Access-Management.svg"),
    terraformType: "aws_iam_policy",
    fields: [
      { key: "name", label: "Policy Name", type: "text", required: true, placeholder: "allow-logs" },
      { key: "policy", label: "Policy JSON", type: "textarea", required: true, placeholder: "{\"Version\":\"2012-10-17\",...}" },
      { key: "path", label: "Path", type: "text", placeholder: "/" },
      { key: "description", label: "Description", type: "text", placeholder: "Permissions for app role" },
    ],
  },
  {
    type: "cloudwatch_metric_alarm",
    label: "CloudWatch Alarm",
    detail: "Metric threshold alert",
    icon: iconPath("/aws-icons/Management-Governance/CloudWatch.svg"),
    terraformType: "aws_cloudwatch_metric_alarm",
    fields: [
      { key: "alarm_name", label: "Alarm Name", type: "text", required: true, placeholder: "high-5xx" },
      { key: "comparison_operator", label: "Comparison Operator", type: "select", required: true, options: ["GreaterThanThreshold", "GreaterThanOrEqualToThreshold", "LessThanThreshold", "LessThanOrEqualToThreshold"] },
      { key: "evaluation_periods", label: "Evaluation Periods", type: "number", required: true, placeholder: "1" },
      { key: "metric_name", label: "Metric Name", type: "text", required: true, placeholder: "5XXError" },
      { key: "namespace", label: "Namespace", type: "text", required: true, placeholder: "AWS/ApiGateway" },
      { key: "period", label: "Period Seconds", type: "number", required: true, placeholder: "300" },
      { key: "statistic", label: "Statistic", type: "select", required: true, options: ["Average", "Sum", "Maximum", "Minimum"] },
      { key: "threshold", label: "Threshold", type: "number", required: true, placeholder: "5" },
      { key: "treat_missing_data", label: "Treat Missing Data", type: "select", options: ["missing", "notBreaching", "breaching", "ignore"] },
      { key: "datapoints_to_alarm", label: "Datapoints To Alarm", type: "number", placeholder: "1" },
      { key: "alarm_actions_csv", label: "Alarm Actions ARNs (comma-separated)", type: "text", placeholder: "arn:aws:sns:..." },
      { key: "ok_actions_csv", label: "OK Actions ARNs (comma-separated)", type: "text", placeholder: "arn:aws:sns:..." },
      { key: "dimensions_json", label: "Dimensions JSON", type: "textarea", placeholder: "{\"ApiName\":\"orders-api\"}" },
    ],
  },
];

const templateByType = new Map(templates.map((template) => [template.type, template] as const));
const integrationModes: Array<{ value: IntegrationMode; label: string }> = [
  { value: "invoke", label: "Invoke" },
  { value: "read", label: "Read" },
  { value: "read_write", label: "Read + Write" },
  { value: "publish", label: "Publish" },
  { value: "consume", label: "Consume" },
  { value: "network_ingress", label: "Network Access" },
  { value: "assume_role", label: "Assume Role" },
  { value: "monitor", label: "Monitor/Alarm Action" },
  { value: "custom", label: "Custom" },
];

function defaultConfig(fields: FieldSchema[]) {
  const initial: Record<string, string> = {};
  for (const field of fields) {
    initial[field.key] = field.options?.[0] ?? "";
  }
  initial.advanced_tf_json = "";
  return initial;
}

function handleIconError(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied) return;
  target.dataset.fallbackApplied = "1";
  target.src = genericIcon;
}

function defaultIntegrationMode(sourceType: ResourceType, targetType: ResourceType): IntegrationMode {
  if (sourceType === "api_gateway_rest_api" && targetType === "lambda_function") return "invoke";
  if (sourceType === "lambda_function" && targetType === "dynamodb_table") return "read_write";
  if (sourceType === "lambda_function" && targetType === "s3_bucket") return "read_write";
  if (sourceType === "lambda_function" && targetType === "db_instance") return "network_ingress";
  if (sourceType === "ecs_service" && targetType === "db_instance") return "network_ingress";
  if (sourceType === "ecs_service" && targetType === "s3_bucket") return "read_write";
  if (sourceType === "cloudwatch_metric_alarm") return "monitor";
  if (targetType === "iam_role") return "assume_role";
  return "read";
}

function autoGeneratedAccessSummary(source: CanvasResource, target: CanvasResource, mode: IntegrationMode): string[] {
  if (mode === "invoke") {
    if (source.type === "api_gateway_rest_api" && target.type === "lambda_function") {
      return [
        "Create aws_lambda_permission scoped to API Gateway execute-api ARN.",
        "Generate API method/integration wiring to invoke only this Lambda target.",
      ];
    }
    return [
      "Create least-privilege IAM policy with lambda:InvokeFunction scoped to target ARN.",
      "Attach generated policy to the source execution role.",
    ];
  }

  if (mode === "read") {
    return [
      `Generate IAM policy with read-only actions for ${target.terraformType}.`,
      "Scope resources to the specific target ARN instead of wildcard.",
    ];
  }

  if (mode === "read_write") {
    return [
      `Generate IAM policy with read/write actions for ${target.terraformType}.`,
      "Scope resources to the specific target ARN and required sub-resources only.",
    ];
  }

  if (mode === "publish") {
    return [
      `Generate IAM policy with publish/send actions scoped to ${target.terraformType} ARN.`,
      "Attach policy to source role only (no broad account-level grants).",
    ];
  }

  if (mode === "consume") {
    return [
      `Generate IAM policy with consume/receive actions scoped to ${target.terraformType} ARN.`,
      "Restrict delete/acknowledge permissions to the selected source principal.",
    ];
  }

  if (mode === "network_ingress") {
    return [
      "Generate security-group rule allowing only required port/protocol from source to target.",
      "Keep egress/ingress CIDRs restricted; no open 0.0.0.0/0 rules by default.",
    ];
  }

  if (mode === "assume_role") {
    return [
      "Generate scoped sts:AssumeRole permission for target role ARN only.",
      "Add trust-policy statement limited to the selected source principal.",
    ];
  }

  if (mode === "monitor") {
    return [
      "Generate alarm action permission/resource policy only for selected target action ARN.",
      "Restrict CloudWatch action integration to this alarm and target pair.",
    ];
  }

  return [
    "No automatic policy for custom mode.",
    "Use Manual permission override to provide explicit IAM/resource-policy JSON.",
  ];
}

function toResourceName(label: string, fallbackId: string): string {
  const normalized = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallbackId.replace(/[^a-z0-9_]/g, "_");
}

function toTerraformValue(key: string, value: string): string {
  if (value === "true" || value === "false") return value;
  if (/^-?\d+(\.\d+)?$/.test(value)) return value;

  if (key.endsWith("_csv")) {
    const values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => `"${item.replace(/"/g, '\\"')}"`);
    return `[${values.join(", ")}]`;
  }

  if (key.endsWith("_json")) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function toFileName(resourceType: ResourceType): string {
  if (resourceType === "lambda_function") return "lambda.tf";
  if (resourceType === "api_gateway_rest_api") return "agw.tf";
  if (resourceType === "ecs_service") return "ecs.tf";
  if (resourceType === "route53_record") return "route53.tf";
  if (resourceType === "cloudfront_distribution") return "cloudfront.tf";
  if (resourceType === "db_instance") return "rds.tf";
  if (resourceType === "dynamodb_table") return "dynamodb.tf";
  if (resourceType === "s3_bucket") return "s3.tf";
  if (resourceType === "security_group") return "sg.tf";
  if (resourceType === "iam_role" || resourceType === "iam_policy") return "iam.tf";
  if (resourceType === "cloudwatch_metric_alarm") return "cloudwatch.tf";
  return "main.tf";
}

function buildGeneratedFiles(projectName: string, resources: CanvasResource[]): GeneratedFile[] {
  const resourceById = new Map(resources.map((resource) => [resource.id, resource] as const));
  const fileLines = new Map<string, string[]>();

  for (const resource of resources) {
    const fileName = toFileName(resource.type);
    const lines = fileLines.get(fileName) ?? [];
    const resourceName = toResourceName(resource.label, resource.id);
    lines.push(`resource "${resource.terraformType}" "${resourceName}" {`);

    for (const [key, rawValue] of Object.entries(resource.config)) {
      const value = rawValue.trim();
      if (!value) continue;
      if (key === "advanced_tf_json") continue;
      lines.push(`  ${key} = ${toTerraformValue(key, value)}`);
    }

    if (resource.integrations.length > 0) {
      lines.push("");
      lines.push("  # Integration access generated by StackGenerate");
      for (const integration of resource.integrations) {
        const target = resourceById.get(integration.targetId);
        if (!target) continue;
        lines.push(`  # - ${resource.label} -> ${target.label} (${integration.mode})`);
        for (const summaryLine of autoGeneratedAccessSummary(resource, target, integration.mode)) {
          lines.push(`  #   ${summaryLine}`);
        }
        if (integration.manualPolicy.trim()) {
          lines.push("  #   Manual override:");
          for (const policyLine of integration.manualPolicy.trim().split("\n")) {
            lines.push(`  #   ${policyLine}`);
          }
        }
      }
    }

    const advanced = resource.config.advanced_tf_json?.trim();
    if (advanced) {
      lines.push("");
      lines.push("  # Advanced HCL snippet");
      for (const advancedLine of advanced.split("\n")) {
        lines.push(`  ${advancedLine}`);
      }
    }

    lines.push("}");
    lines.push("");
    fileLines.set(fileName, lines);
  }

  const header = [
    `# Project: ${projectName}`,
    "# Generated by StackGenerate Terraform Composer",
    "",
  ];
  const generated = [...fileLines.entries()].map(([name, lines]) => ({
    name,
    content: [...header, ...lines].join("\n").trimEnd() + "\n",
  }));
  generated.sort((a, b) => a.name.localeCompare(b.name));
  return generated;
}

function hydrateResourcesFromPreset(initialPresetId?: string) {
  const preset = initialPresetId ? COMPOSER_EXAMPLE_PRESET_BY_ID.get(initialPresetId) : undefined;
  if (!preset) {
    return {
      columns: ["col-1", "col-2"],
      resources: [] as CanvasResource[],
      nextResourceId: 1,
      nextColumnId: 3,
      loadedTitle: null as string | null,
    };
  }

  const totalColumns = Math.max(2, preset.columns);
  const columns = Array.from({ length: totalColumns }, (_, index) => `col-${index + 1}`);
  const idMap = new Map<string, string>();
  const seedByResourceId = new Map<string, (typeof preset.resources)[number]>();
  const resources: CanvasResource[] = [];

  for (let index = 0; index < preset.resources.length; index += 1) {
    const seed = preset.resources[index];
    const template = templateByType.get(seed.type);
    if (!template) continue;
    const id = `res-${index + 1}`;
    idMap.set(seed.id, id);
    seedByResourceId.set(id, seed);
    resources.push({
      id,
      type: seed.type,
      label: seed.label,
      columnId: `col-${Math.min(Math.max(seed.column, 1), totalColumns)}`,
      terraformType: template.terraformType,
      fields: template.fields,
      config: { ...defaultConfig(template.fields), ...seed.config },
      integrations: [],
    });
  }

  const hydratedResources = resources.map((resource) => {
    const seed = seedByResourceId.get(resource.id);
    const integrations: ResourceIntegration[] = [];
    for (const integration of seed?.integrations ?? []) {
      const targetId = idMap.get(integration.targetId);
      if (!targetId) continue;
      integrations.push({
        targetId,
        mode: integration.mode,
        manualPolicy: integration.manualPolicy ?? "",
      });
    }
    return { ...resource, integrations };
  });

  return {
    columns,
    resources: hydratedResources,
    nextResourceId: hydratedResources.length + 1,
    nextColumnId: totalColumns + 1,
    loadedTitle: preset.title,
  };
}

type ComposerClientProps = {
  initialPresetId?: string;
};

export function ComposerClient({ initialPresetId }: ComposerClientProps) {
  const hydratedPreset = useMemo(() => hydrateResourcesFromPreset(initialPresetId), [initialPresetId]);
  const idCounter = useRef(hydratedPreset.nextResourceId);
  const columnCounter = useRef(hydratedPreset.nextColumnId);
  const [projectName, setProjectName] = useState("Untitled Architecture");
  const [columns, setColumns] = useState<string[]>(hydratedPreset.columns);
  const [resources, setResources] = useState<CanvasResource[]>(hydratedPreset.resources);
  const [selectedId, setSelectedId] = useState<string | null>(hydratedPreset.resources[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [banner, setBanner] = useState<string | null>(
    hydratedPreset.loadedTitle ? `Loaded example: ${hydratedPreset.loadedTitle}` : null,
  );
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const selected = resources.find((resource) => resource.id === selectedId) ?? null;

  const columnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const columnId of columns) counts[columnId] = 0;
    for (const resource of resources) counts[resource.columnId] = (counts[resource.columnId] ?? 0) + 1;
    return counts;
  }, [columns, resources]);
  const activeFile = useMemo(
    () => generatedFiles.find((file) => file.name === activeFileName) ?? generatedFiles[0] ?? null,
    [activeFileName, generatedFiles],
  );

  const addResource = (template: ResourceTemplate, columnIdOverride?: string) => {
    const id = `res-${idCounter.current}`;
    idCounter.current += 1;
    const columnId = columnIdOverride ?? columns[0] ?? "col-1";
    const count = resources.filter((resource) => resource.columnId === columnId).length + 1;
    const next: CanvasResource = {
      id,
      type: template.type,
      label: `${template.label} ${count}`,
      columnId,
      terraformType: template.terraformType,
      fields: template.fields,
      config: defaultConfig(template.fields),
      integrations: [],
    };
    setResources((prev) => [...prev, next]);
    setSelectedId(id);
    setEditorOpen(true);
    setBanner(null);
  };

  const onTemplateDragStart = (event: React.DragEvent<HTMLButtonElement>, template: ResourceTemplate) => {
    event.dataTransfer.setData("application/x-sg-template", template.type);
  };

  const onResourceDragStart = (event: React.DragEvent<HTMLButtonElement>, resourceId: string) => {
    event.dataTransfer.setData("application/x-sg-resource", resourceId);
  };

  const moveResourceToColumn = (resourceId: string, columnId: string) => {
    setResources((prev) => prev.map((resource) => (resource.id === resourceId ? { ...resource, columnId } : resource)));
  };

  const onColumnDrop = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
    event.preventDefault();
    const existingResourceId = event.dataTransfer.getData("application/x-sg-resource");
    if (existingResourceId) {
      moveResourceToColumn(existingResourceId, columnId);
      return;
    }

    const templateType = event.dataTransfer.getData("application/x-sg-template") as ResourceType;
    const template = templateByType.get(templateType);
    if (!template) return;
    addResource(template, columnId);
  };

  const addColumn = () => {
    const nextId = `col-${columnCounter.current}`;
    columnCounter.current += 1;
    setColumns((prev) => [...prev, nextId]);
  };

  const updateSelected = (key: string, value: string) => {
    if (!selected) return;
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === selected.id ? { ...resource, config: { ...resource.config, [key]: value } } : resource,
      ),
    );
  };

  const updateSelectedMeta = (changes: Partial<Pick<CanvasResource, "label" | "columnId">>) => {
    if (!selected) return;
    setResources((prev) => prev.map((resource) => (resource.id === selected.id ? { ...resource, ...changes } : resource)));
  };

  const toggleIntegration = (targetId: string, enabled: boolean) => {
    if (!selectedId) return;
    setResources((prev) => {
      const source = prev.find((resource) => resource.id === selectedId);
      const target = prev.find((resource) => resource.id === targetId);
      if (!source || !target || source.id === target.id) return prev;
      return prev.map((resource) => {
        if (resource.id !== selectedId) return resource;
        const alreadyExists = resource.integrations.some((integration) => integration.targetId === targetId);
        if (enabled && !alreadyExists) {
          return {
            ...resource,
            integrations: [
              ...resource.integrations,
              {
                targetId,
                mode: defaultIntegrationMode(source.type, target.type),
                manualPolicy: "",
              },
            ],
          };
        }
        if (!enabled && alreadyExists) {
          return {
            ...resource,
            integrations: resource.integrations.filter((integration) => integration.targetId !== targetId),
          };
        }
        return resource;
      });
    });
  };

  const updateIntegrationMode = (targetId: string, mode: IntegrationMode) => {
    if (!selectedId) return;
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === selectedId
          ? {
              ...resource,
              integrations: resource.integrations.map((integration) =>
                integration.targetId === targetId ? { ...integration, mode } : integration,
              ),
            }
          : resource,
      ),
    );
  };

  const updateIntegrationManualPolicy = (targetId: string, manualPolicy: string) => {
    if (!selectedId) return;
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === selectedId
          ? {
              ...resource,
              integrations: resource.integrations.map((integration) =>
                integration.targetId === targetId ? { ...integration, manualPolicy } : integration,
              ),
            }
          : resource,
      ),
    );
  };

  const removeSelected = () => {
    if (!selected) return;
    const removedId = selected.id;
    setResources((prev) =>
      prev
        .filter((resource) => resource.id !== removedId)
        .map((resource) => ({
          ...resource,
          integrations: resource.integrations.filter((integration) => integration.targetId !== removedId),
        })),
    );
    setSelectedId(null);
    setEditorOpen(false);
  };

  const generateTerraform = async () => {
    if (!resources.length) {
      setBanner("Add resources to the canvas first.");
      return;
    }
    setBanner(null);
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const files = buildGeneratedFiles(projectName, resources);
    setGeneratedFiles(files);
    setActiveFileName(files[0]?.name ?? null);
    setViewerOpen(true);
    setIsGenerating(false);
    setBanner(`Generated ${files.length} Terraform file${files.length === 1 ? "" : "s"}.`);
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    if (!generatedFiles.length) return;
    const merged = generatedFiles
      .map((file) => `# ---- ${file.name} ----\n${file.content.trimEnd()}\n`)
      .join("\n");
    downloadFile({ name: "stackgenerate-terraform.tf", content: merged });
  };

  const copyAll = async () => {
    if (!generatedFiles.length) return;
    const merged = generatedFiles
      .map((file) => `# ---- ${file.name} ----\n${file.content.trimEnd()}\n`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(merged);
      setBanner("Terraform copied to clipboard.");
    } catch {
      setBanner("Clipboard copy failed. Use file download instead.");
    }
  };

  const copyActive = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setBanner(`${activeFile.name} copied to clipboard.`);
    } catch {
      setBanner("Clipboard copy failed. Use file download instead.");
    }
  };

  const exportToDirectory = async () => {
    if (!generatedFiles.length) return;
    const pickerFn = (
      window as Window & { showDirectoryPicker?: () => Promise<DirectoryExportHandle> }
    ).showDirectoryPicker;
    if (!pickerFn) {
      setBanner("Directory export is not supported in this browser. Use Download buttons instead.");
      return;
    }

    try {
      const dirHandle = await pickerFn();
      for (const file of generatedFiles) {
        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
      }
      setBanner("Terraform files exported to selected folder.");
    } catch {
      setBanner("Directory export cancelled.");
    }
  };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">Robot Scientist</p>
            <p className="mt-2 text-base font-semibold text-slate-100">Reviewing architecture...</p>
            <p className="mt-2 text-sm text-slate-300">Preparing Terraform output structure.</p>
          </div>
        </div>
      )}

      {editorOpen && selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="max-h-[84vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{selected.terraformType}</p>
                <h3 className="text-xl font-semibold text-slate-100">{selected.label}</h3>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-slate-500"
              >
                X
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Resource Label</span>
                <input
                  value={selected.label}
                  onChange={(e) => updateSelectedMeta({ label: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Integrates With</p>
                <div className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-2">
                  {resources.filter((resource) => resource.id !== selected.id).length === 0 && (
                    <p className="text-xs text-slate-500">Add another resource to define integrations.</p>
                  )}
                  {resources
                    .filter((resource) => resource.id !== selected.id)
                    .map((resource) => {
                      const isChecked = selected.integrations.some(
                        (integration) => integration.targetId === resource.id,
                      );
                      return (
                        <label
                          key={resource.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-xs text-slate-200"
                        >
                          <span className="truncate">{resource.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(event) => toggleIntegration(resource.id, event.target.checked)}
                            className="h-4 w-4 accent-sky-500"
                          />
                        </label>
                      );
                    })}
                </div>

                {selected.integrations.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {selected.integrations.map((integration) => {
                      const target = resources.find((resource) => resource.id === integration.targetId);
                      if (!target) return null;
                      const autoSummary = autoGeneratedAccessSummary(selected, target, integration.mode);
                      return (
                        <div key={integration.targetId} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold text-slate-100">
                              {`${selected.label} -> ${target.label}`}
                            </p>
                            <button
                              onClick={() => toggleIntegration(integration.targetId, false)}
                              className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-400"
                            >
                              Remove
                            </button>
                          </div>
                          <label className="mt-2 block">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Integration Mode</span>
                            <select
                              value={integration.mode}
                              onChange={(event) =>
                                updateIntegrationMode(integration.targetId, event.target.value as IntegrationMode)
                              }
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                            >
                              {integrationModes.map((modeOption) => (
                                <option key={modeOption.value} value={modeOption.value}>
                                  {modeOption.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200">Auto-generated access</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-emerald-100/90">
                              {autoSummary.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <label className="mt-2 block">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                              Manual Permission Override (Optional)
                            </span>
                            <textarea
                              value={integration.manualPolicy}
                              onChange={(event) =>
                                updateIntegrationManualPolicy(integration.targetId, event.target.value)
                              }
                              placeholder="Optional - JSON policy/resource policy overrides"
                              rows={3}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selected.fields.map((field) => (
                <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {field.label} {field.required ? "*" : ""}
                  </span>
                  {field.type === "select" ? (
                    <select
                      value={selected.config[field.key] ?? ""}
                      onChange={(e) => updateSelected(field.key, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={selected.config[field.key] ?? ""}
                      onChange={(e) => updateSelected(field.key, e.target.value)}
                      placeholder={`${field.required ? "Required" : "Optional"}${field.placeholder ? ` - ${field.placeholder}` : ""}`}
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={selected.config[field.key] ?? ""}
                      onChange={(e) => updateSelected(field.key, e.target.value)}
                      placeholder={`${field.required ? "Required" : "Optional"}${field.placeholder ? ` - ${field.placeholder}` : ""}`}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={removeSelected}
                className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-400"
              >
                Remove Resource
              </button>
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_36px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Composer Mode</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Generate Terraform From Scratch</h1>
        <p className="mx-auto max-w-3xl text-base text-slate-300">
          Drag resources into columns, configure Terraform fields in the popup editor, and generate files.
        </p>
        {!ICON_BASE && (
          <p className="text-sm text-amber-200/90">
            `NEXT_PUBLIC_ICON_BASE` is not set, so generic fallback icons are shown.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Project</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-[320px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              placeholder="Project name"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setResources([]);
                setSelectedId(null);
                setEditorOpen(false);
                setGeneratedFiles([]);
                setViewerOpen(false);
                setActiveFileName(null);
                setBanner("Canvas cleared.");
              }}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-slate-500"
            >
              Clear Canvas
            </button>
            <button
              onClick={addColumn}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-slate-500"
            >
              Add Column
            </button>
            <button
              onClick={() => void generateTerraform()}
              className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_36px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
            >
              Generate Terraform
            </button>
          </div>
        </div>
        {banner && (
          <div className="mt-3 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
            {banner}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">AWS Resources</h2>
          <p className="mt-1 text-xs text-slate-400">Drag to canvas or click add.</p>
          <div className="mt-3 space-y-2">
            {templates.map((template) => (
              <div key={template.type} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <button draggable onDragStart={(event) => onTemplateDragStart(event, template)} className="flex w-full items-start gap-3 text-left">
                  <img
                    src={template.icon || genericIcon}
                    alt={template.label}
                    className="mt-0.5 h-6 w-6"
                    onError={handleIconError}
                    crossOrigin="anonymous"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-100">{template.label}</span>
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-slate-400">{template.terraformType}</span>
                    <span className="mt-1 block text-xs text-slate-300">{template.detail}</span>
                  </span>
                </button>
                <button
                  onClick={() => addResource(template)}
                  className="mt-2 rounded-full border border-slate-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-sky-500/60"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Canvas</h2>
          <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(180px, 1fr))` }}>
            {columns.map((columnId) => {
              const columnResources = resources.filter((resource) => resource.columnId === columnId);
              return (
                <div
                  key={columnId}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => onColumnDrop(event, columnId)}
                  className="min-h-[240px] rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                >
                  <div className="flex items-center justify-end">
                    <span className="text-[10px] text-slate-500">{columnCounts[columnId] ?? 0}</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {columnResources.map((resource) => {
                      const template = templateByType.get(resource.type);
                      return (
                        <button
                          key={resource.id}
                          draggable
                          onDragStart={(event) => onResourceDragStart(event, resource.id)}
                          onClick={() => {
                            setSelectedId(resource.id);
                            setEditorOpen(true);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition ${
                            selectedId === resource.id
                              ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                              : "border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-600"
                          }`}
                        >
                          <img
                            src={template?.icon || genericIcon}
                            alt={resource.label}
                            className="h-5 w-5"
                            onError={handleIconError}
                            crossOrigin="anonymous"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{resource.label}</span>
                            <span className="block truncate text-[10px] uppercase tracking-[0.13em] text-slate-400">
                              {resource.terraformType}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {!columnResources.length && (
                      <div className="rounded-lg border border-dashed border-slate-800 px-2 py-8 text-center text-[11px] text-slate-500">
                        Drop resources here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {viewerOpen && generatedFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="flex max-h-[86vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <aside className="w-72 border-r border-slate-800 bg-slate-950/70 p-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">Files</h2>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-100 transition hover:border-slate-500"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {generatedFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFileName(file.name)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                      activeFile?.name === file.name
                        ? "border-sky-500/60 bg-sky-500/10 text-sky-100"
                        : "border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{activeFile?.name ?? "Generated file"}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => void copyActive()}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-slate-500"
                  >
                    Copy File
                  </button>
                  <button
                    onClick={() => void copyAll()}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-slate-500"
                  >
                    Copy All
                  </button>
                  {activeFile && (
                    <button
                      onClick={() => downloadFile(activeFile)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-slate-500"
                    >
                      Download File
                    </button>
                  )}
                  <button
                    onClick={downloadAll}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-slate-500"
                  >
                    Download All
                  </button>
                  <button
                    onClick={() => void exportToDirectory()}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_36px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
                  >
                    Export Folder
                  </button>
                </div>
              </div>
              <pre className="mt-3 min-h-0 flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
                {activeFile?.content ?? "No file selected."}
              </pre>
            </div>
          </div>
        </div>
      )}

      {generatedFiles.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Generated Terraform</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewerOpen(true)}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-slate-500"
              >
                Open File Viewer
              </button>
              <button
                onClick={() => void copyAll()}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-slate-500"
              >
                Copy All
              </button>
              <button
                onClick={downloadAll}
                className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_12px_36px_rgba(56,189,248,0.25)] transition hover:from-sky-400 hover:to-violet-400"
              >
                Download All
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {generatedFiles.length} file{generatedFiles.length === 1 ? "" : "s"} ready. Open the file viewer to inspect each file before export.
          </p>
        </section>
      )}
    </>
  );
}
