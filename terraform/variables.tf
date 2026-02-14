variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix for resources"
  type        = string
  default     = "aidevops"
}

variable "api_image" {
  description = "Container image URI (ECR) for the API container"
  type        = string
  default     = "979067963238.dkr.ecr.us-east-1.amazonaws.com/aidevops-api:latest"
}

variable "ui_image" {
  description = "Container image URI (ECR) for the UI container"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "cloudfront_domain_names" {
  description = "Optional list of custom domain names (aliases) for CloudFront (e.g., stackgenerate.com, www.stackgenerate.com)"
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN (in us-east-1) for the CloudFront distribution"
  type        = string
  default     = ""
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN (in-region) for the ALB HTTPS listener"
  type        = string
  default     = ""
}

variable "ui_container_port" {
  description = "Port the UI container listens on"
  type        = number
  default     = 3000
}

variable "api_container_port" {
  description = "Port the API container listens on"
  type        = number
  default     = 4000
}

variable "api_domain_name" {
  description = "Domain name for the API (e.g., api.stackgenerate.com)"
  type        = string
  default     = ""
}

variable "ui_domain_names" {
  description = "Domain names for the UI on the ALB (e.g., www.stackgenerate.com)"
  type        = list(string)
  default     = []
}

variable "nextauth_url" {
  description = "NEXTAUTH_URL for the UI container"
  type        = string
  default     = ""
}

variable "next_public_api_base" {
  description = "Public API base URL for the UI container"
  type        = string
  default     = ""
}

variable "api_base" {
  description = "Server-side API base URL for the UI proxy (e.g., https://api.stackgenerate.com)"
  type        = string
  default     = ""
}

variable "api_shared_secret" {
  description = "Shared secret header value required by the API"
  type        = string
  sensitive   = true
}

variable "next_public_icon_base" {
  description = "Public icon base URL for the UI container"
  type        = string
  default     = ""
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  default     = ""
}

variable "oauth_github_client_id" {
  description = "GitHub OAuth client ID"
  type        = string
  default     = ""
}

variable "oauth_github_client_secret" {
  description = "GitHub OAuth client secret"
  type        = string
  default     = ""
}

variable "nextauth_secret" {
  description = "NEXTAUTH_SECRET for the UI container"
  type        = string
  default     = ""
}

variable "ui_task_cpu" {
  description = "CPU units for the UI task"
  type        = number
  default     = 256
}

variable "ui_task_memory" {
  description = "Memory (MiB) for the UI task"
  type        = number
  default     = 512
}

variable "api_task_cpu" {
  description = "CPU units for the API task"
  type        = number
  default     = 256
}

variable "api_task_memory" {
  description = "Memory (MiB) for the API task"
  type        = number
  default     = 512
}

variable "ui_desired_count" {
  description = "Desired count for the UI service"
  type        = number
  default     = 1
}

variable "ui_min_count" {
  description = "Minimum count for the UI service autoscaling"
  type        = number
  default     = 1
}

variable "ui_max_count" {
  description = "Maximum count for the UI service autoscaling"
  type        = number
  default     = 3
}

variable "api_desired_count" {
  description = "Desired count for the API service"
  type        = number
  default     = 1
}

variable "api_min_count" {
  description = "Minimum count for the API service autoscaling"
  type        = number
  default     = 1
}

variable "api_max_count" {
  description = "Maximum count for the API service autoscaling"
  type        = number
  default     = 3
}

variable "db_name" {
  description = "Database name for Postgres"
  type        = string
  default     = "appdb"
}

variable "db_master_username" {
  description = "Master username for Postgres"
  type        = string
  default     = "appuser"
}

variable "db_master_password" {
  description = "Master password for Postgres"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}
