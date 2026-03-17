export type ExampleCategory = "cost-savings" | "highly-available" | "security-first";

export type ComposerSeedResource = {
  id: string;
  type:
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
  label: string;
  column: number;
  config: Record<string, string>;
  integrations?: Array<{
    targetId: string;
    mode: "invoke" | "read" | "read_write" | "publish" | "consume" | "network_ingress" | "assume_role" | "monitor" | "custom";
    manualPolicy?: string;
  }>;
};

export type ComposerExamplePreset = {
  id: string;
  title: string;
  category: ExampleCategory;
  description: string;
  columns: number;
  diagram: string[];
  resources: ComposerSeedResource[];
};

export const EXAMPLE_CATEGORY_META: Array<{ slug: ExampleCategory; label: string; description: string }> = [
  {
    slug: "cost-savings",
    label: "Cost Savings",
    description: "Lean architectures with lower baseline spend and simple operations.",
  },
  {
    slug: "highly-available",
    label: "Highly Available",
    description: "Resilient patterns for uptime-focused workloads.",
  },
  {
    slug: "security-first",
    label: "Security First",
    description: "Least-privilege and controlled access examples for sensitive systems.",
  },
];

export const COMPOSER_EXAMPLE_PRESETS: ComposerExamplePreset[] = [
  {
    id: "cost-serverless-api",
    title: "Serverless API Starter",
    category: "cost-savings",
    description: "API Gateway + Lambda + DynamoDB + S3 with minimal always-on cost.",
    columns: 3,
    diagram: ["Route53 -> API Gateway", "API Gateway -> Lambda", "Lambda -> DynamoDB + S3"],
    resources: [
      {
        id: "r53",
        type: "route53_record",
        label: "api.example.com",
        column: 1,
        config: { name: "api.example.com", zone_id: "Z123ABCEXAMPLE", type: "A", ttl: "300" },
      },
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Public API",
        column: 1,
        config: { name: "public-api", endpoint_type: "REGIONAL" },
        integrations: [{ targetId: "lambda", mode: "invoke" }],
      },
      {
        id: "lambda",
        type: "lambda_function",
        label: "Orders Handler",
        column: 2,
        config: {
          function_name: "orders-handler",
          role: "arn:aws:iam::123456789012:role/lambda-runtime",
          runtime: "nodejs20.x",
          handler: "index.handler",
          code_source: "build/orders.zip",
        },
        integrations: [
          { targetId: "ddb", mode: "read_write" },
          { targetId: "bucket", mode: "read_write" },
          { targetId: "lambdaRole", mode: "assume_role" },
        ],
      },
      {
        id: "ddb",
        type: "dynamodb_table",
        label: "Orders Table",
        column: 3,
        config: { name: "orders", hash_key: "id", attribute_name: "id", attribute_type: "S" },
      },
      {
        id: "bucket",
        type: "s3_bucket",
        label: "Orders Assets",
        column: 3,
        config: { bucket: "orders-assets-prod", force_destroy: "false" },
      },
      {
        id: "lambdaRole",
        type: "iam_role",
        label: "Lambda Runtime Role",
        column: 2,
        config: {
          name: "lambda-runtime-role",
          assume_role_policy: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}",
        },
      },
    ],
  },
  {
    id: "cost-batch-analytics",
    title: "Batch Analytics Pipeline",
    category: "cost-savings",
    description: "Event-driven ingest with S3 and DynamoDB, avoiding always-on containers.",
    columns: 3,
    diagram: ["API Gateway -> Lambda Ingest", "Lambda Ingest -> S3", "Lambda Ingest -> DynamoDB"],
    resources: [
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Ingest API",
        column: 1,
        config: { name: "ingest-api", endpoint_type: "REGIONAL" },
        integrations: [{ targetId: "ingest", mode: "invoke" }],
      },
      {
        id: "ingest",
        type: "lambda_function",
        label: "Ingest Lambda",
        column: 2,
        config: {
          function_name: "ingest-lambda",
          role: "arn:aws:iam::123456789012:role/ingest-runtime",
          runtime: "python3.12",
          handler: "app.handler",
          code_source: "build/ingest.zip",
        },
        integrations: [
          { targetId: "lake", mode: "read_write" },
          { targetId: "events", mode: "read_write" },
        ],
      },
      {
        id: "lake",
        type: "s3_bucket",
        label: "Data Lake",
        column: 3,
        config: { bucket: "batch-analytics-lake", force_destroy: "false", versioning_enabled: "true" },
      },
      {
        id: "events",
        type: "dynamodb_table",
        label: "Events Table",
        column: 3,
        config: { name: "events", hash_key: "id", attribute_name: "id", attribute_type: "S" },
      },
      {
        id: "alarm",
        type: "cloudwatch_metric_alarm",
        label: "Ingest Errors",
        column: 2,
        config: {
          alarm_name: "ingest-errors",
          comparison_operator: "GreaterThanThreshold",
          evaluation_periods: "1",
          metric_name: "Errors",
          namespace: "AWS/Lambda",
          period: "300",
          statistic: "Sum",
          threshold: "1",
        },
        integrations: [{ targetId: "ingest", mode: "monitor" }],
      },
    ],
  },
  {
    id: "ha-global-api",
    title: "Global API with Edge Caching",
    category: "highly-available",
    description: "Route53 + CloudFront + API Gateway with resilient stateless compute.",
    columns: 4,
    diagram: ["Route53 -> CloudFront", "CloudFront -> API Gateway", "API Gateway -> Lambda"],
    resources: [
      {
        id: "dns",
        type: "route53_record",
        label: "app.example.com",
        column: 1,
        config: { name: "app.example.com", zone_id: "Z123ABCEXAMPLE", type: "A", ttl: "300" },
        integrations: [{ targetId: "cf", mode: "read" }],
      },
      {
        id: "cf",
        type: "cloudfront_distribution",
        label: "Global Edge",
        column: 2,
        config: {
          origin_domain_name: "api.example.com",
          origin_id: "api-origin",
          viewer_protocol_policy: "redirect-to-https",
          enabled: "true",
        },
        integrations: [{ targetId: "agw", mode: "read" }],
      },
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Regional API",
        column: 3,
        config: { name: "regional-api", endpoint_type: "REGIONAL" },
        integrations: [{ targetId: "handler", mode: "invoke" }],
      },
      {
        id: "handler",
        type: "lambda_function",
        label: "API Handler",
        column: 4,
        config: {
          function_name: "api-handler",
          role: "arn:aws:iam::123456789012:role/api-runtime",
          runtime: "nodejs20.x",
          handler: "index.handler",
          code_source: "build/api.zip",
        },
      },
      {
        id: "alarm",
        type: "cloudwatch_metric_alarm",
        label: "API 5xx Alarm",
        column: 4,
        config: {
          alarm_name: "api-5xx",
          comparison_operator: "GreaterThanThreshold",
          evaluation_periods: "1",
          metric_name: "5XXError",
          namespace: "AWS/ApiGateway",
          period: "300",
          statistic: "Sum",
          threshold: "5",
        },
        integrations: [{ targetId: "handler", mode: "monitor" }],
      },
    ],
  },
  {
    id: "ha-ecs-rds",
    title: "ECS Service with RDS Backend",
    category: "highly-available",
    description: "Containerized API path with dedicated security groups and DB backend.",
    columns: 4,
    diagram: ["Route53 -> API Gateway", "API Gateway -> ECS", "ECS -> RDS + SG"],
    resources: [
      {
        id: "dns",
        type: "route53_record",
        label: "payments.example.com",
        column: 1,
        config: { name: "payments.example.com", zone_id: "Z123ABCEXAMPLE", type: "A", ttl: "300" },
      },
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Payments API",
        column: 2,
        config: { name: "payments-api", endpoint_type: "REGIONAL" },
        integrations: [{ targetId: "ecs", mode: "invoke" }],
      },
      {
        id: "ecs",
        type: "ecs_service",
        label: "Payments Service",
        column: 3,
        config: {
          name: "payments-service",
          cluster: "arn:aws:ecs:us-east-1:123456789012:cluster/prod",
          task_definition: "arn:aws:ecs:us-east-1:123456789012:task-definition/payments:1",
        },
        integrations: [
          { targetId: "db", mode: "network_ingress" },
          { targetId: "appSg", mode: "network_ingress" },
        ],
      },
      {
        id: "db",
        type: "db_instance",
        label: "Payments RDS",
        column: 4,
        config: {
          identifier: "payments-db",
          allocated_storage: "50",
          engine: "postgres",
          instance_class: "db.t3.medium",
          username: "admin",
          password: "use-secret-manager",
        },
      },
      {
        id: "appSg",
        type: "security_group",
        label: "App SG",
        column: 3,
        config: { name: "app-sg", description: "App ingress", vpc_id: "vpc-123456" },
      },
    ],
  },
  {
    id: "sec-private-data-api",
    title: "Private Data API",
    category: "security-first",
    description: "Strict IAM and network boundaries for sensitive API workloads.",
    columns: 4,
    diagram: ["API Gateway -> Lambda", "Lambda -> DynamoDB", "IAM + SG controls around data path"],
    resources: [
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Private Data API",
        column: 1,
        config: { name: "private-data-api", endpoint_type: "PRIVATE" },
        integrations: [{ targetId: "lambda", mode: "invoke" }],
      },
      {
        id: "lambda",
        type: "lambda_function",
        label: "Data Handler",
        column: 2,
        config: {
          function_name: "data-handler",
          role: "arn:aws:iam::123456789012:role/data-handler-runtime",
          runtime: "python3.12",
          handler: "app.handler",
          code_source: "build/data-handler.zip",
        },
        integrations: [
          { targetId: "ddb", mode: "read_write" },
          { targetId: "role", mode: "assume_role" },
          {
            targetId: "policy",
            mode: "custom",
            manualPolicy: "{\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:GetItem\",\"dynamodb:PutItem\"],\"Resource\":\"<table-arn>\"}]}",
          },
        ],
      },
      {
        id: "ddb",
        type: "dynamodb_table",
        label: "Sensitive Records",
        column: 3,
        config: { name: "sensitive-records", hash_key: "id", attribute_name: "id", attribute_type: "S" },
      },
      {
        id: "role",
        type: "iam_role",
        label: "Data Runtime Role",
        column: 2,
        config: {
          name: "data-runtime-role",
          assume_role_policy: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}",
        },
      },
      {
        id: "policy",
        type: "iam_policy",
        label: "Data Access Policy",
        column: 3,
        config: {
          name: "data-access-policy",
          policy: "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:GetItem\",\"dynamodb:PutItem\"],\"Resource\":\"*\"}]}",
        },
      },
    ],
  },
  {
    id: "sec-audit-ready-platform",
    title: "Audit-Ready Platform",
    category: "security-first",
    description: "Observability-first controls with alarm and least-privilege integrations.",
    columns: 4,
    diagram: ["CloudFront -> API Gateway", "API Gateway -> Lambda", "CloudWatch alarm path for response"],
    resources: [
      {
        id: "cf",
        type: "cloudfront_distribution",
        label: "Edge Front",
        column: 1,
        config: {
          origin_domain_name: "api.internal.example.com",
          origin_id: "private-api",
          viewer_protocol_policy: "https-only",
          enabled: "true",
        },
        integrations: [{ targetId: "agw", mode: "read" }],
      },
      {
        id: "agw",
        type: "api_gateway_rest_api",
        label: "Audit API",
        column: 2,
        config: { name: "audit-api", endpoint_type: "REGIONAL" },
        integrations: [{ targetId: "lambda", mode: "invoke" }],
      },
      {
        id: "lambda",
        type: "lambda_function",
        label: "Audit Processor",
        column: 3,
        config: {
          function_name: "audit-processor",
          role: "arn:aws:iam::123456789012:role/audit-runtime",
          runtime: "nodejs20.x",
          handler: "index.handler",
          code_source: "build/audit.zip",
        },
        integrations: [{ targetId: "bucket", mode: "read_write" }],
      },
      {
        id: "bucket",
        type: "s3_bucket",
        label: "Audit Artifacts",
        column: 4,
        config: { bucket: "audit-artifacts-prod", versioning_enabled: "true", block_public_policy: "true" },
      },
      {
        id: "alarm",
        type: "cloudwatch_metric_alarm",
        label: "Audit Error Alarm",
        column: 3,
        config: {
          alarm_name: "audit-errors",
          comparison_operator: "GreaterThanThreshold",
          evaluation_periods: "1",
          metric_name: "Errors",
          namespace: "AWS/Lambda",
          period: "300",
          statistic: "Sum",
          threshold: "1",
        },
        integrations: [{ targetId: "lambda", mode: "monitor" }],
      },
    ],
  },
];

export const COMPOSER_EXAMPLE_PRESET_BY_ID = new Map(
  COMPOSER_EXAMPLE_PRESETS.map((preset) => [preset.id, preset] as const),
);

export function pathForCategory(category: ExampleCategory) {
  return `/examples/${category}`;
}
