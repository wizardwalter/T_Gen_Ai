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

variable "host_instance_type" {
  description = "EC2 instance type for the app host"
  type        = string
  default     = "t3.small"
}

variable "host_cpu_credit_mode" {
  description = "CPU credit option for burstable instances. Use unlimited to avoid throttling under sustained load."
  type        = string
  default     = "unlimited"

  validation {
    condition     = contains(["standard", "unlimited"], var.host_cpu_credit_mode)
    error_message = "host_cpu_credit_mode must be standard or unlimited"
  }
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

variable "canonical_hostname" {
  description = "Canonical hostname for redirects (e.g., www.stackgenerate.com). Leave blank to disable apex->www redirect."
  type        = string
  default     = ""
}

variable "db_name" {
  description = "Database name for Aurora"
  type        = string
  default     = "appdb"
}

variable "db_master_username" {
  description = "Master username for Aurora"
  type        = string
  default     = "appuser"
}

variable "db_master_password" {
  description = "Master password for Aurora"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "db_min_capacity_acu" {
  description = "Aurora Serverless v2 minimum ACUs"
  type        = number
  default     = 0.5
}

variable "db_max_capacity_acu" {
  description = "Aurora Serverless v2 maximum ACUs"
  type        = number
  default     = 2
}
