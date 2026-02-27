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

variable "ui_domain_name" {
  description = "Custom domain for the UI (e.g., www.stackgenerate.com)"
  type        = string
  default     = ""
}

variable "api_domain_name" {
  description = "Custom domain for the API (e.g., api.stackgenerate.com)"
  type        = string
  default     = ""
}

variable "root_domain_name" {
  description = "Apex/root domain (e.g., stackgenerate.com)"
  type        = string
  default     = ""
}

variable "apex_redirect_target" {
  description = "Host to redirect the apex domain to (e.g., www.stackgenerate.com)"
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for the root domain"
  type        = string
  default     = ""
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

variable "nextauth_secret" {
  description = "NEXTAUTH_SECRET for the UI container"
  type        = string
  default     = ""
}

variable "apprunner_auto_deployments" {
  description = "Enable App Runner auto deployments"
  type        = bool
  default     = true
}

variable "ui_instance_cpu" {
  description = "App Runner UI CPU (e.g., 0.25 vCPU, 0.5 vCPU, 1 vCPU)"
  type        = string
  default     = "0.25 vCPU"
}

variable "ui_instance_memory" {
  description = "App Runner UI memory (e.g., 0.5 GB, 1 GB, 2 GB)"
  type        = string
  default     = "0.5 GB"
}

variable "api_instance_cpu" {
  description = "App Runner API CPU (e.g., 0.25 vCPU, 0.5 vCPU, 1 vCPU)"
  type        = string
  default     = "0.25 vCPU"
}

variable "api_instance_memory" {
  description = "App Runner API memory (e.g., 0.5 GB, 1 GB, 2 GB)"
  type        = string
  default     = "0.5 GB"
}

variable "cognito_domain_prefix" {
  description = "Unique domain prefix for Cognito Hosted UI"
  type        = string
}

variable "facebook_app_id" {
  description = "Facebook App ID for Cognito identity provider"
  type        = string
  default     = ""
}

variable "facebook_app_secret" {
  description = "Facebook App secret for Cognito identity provider"
  type        = string
  sensitive   = true
  default     = ""
}

variable "facebook_api_version" {
  description = "Facebook Graph API version"
  type        = string
  default     = "v19.0"
}

variable "apple_client_id" {
  description = "Apple Services ID (client_id) for Cognito identity provider"
  type        = string
  default     = ""
}

variable "apple_team_id" {
  description = "Apple Team ID for Cognito identity provider"
  type        = string
  default     = ""
}

variable "apple_key_id" {
  description = "Apple Key ID for Cognito identity provider"
  type        = string
  default     = ""
}

variable "apple_private_key" {
  description = "Apple private key for Cognito identity provider (PEM)"
  type        = string
  sensitive   = true
  default     = ""
}
