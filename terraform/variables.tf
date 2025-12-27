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
  default     = "t3.micro"
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
