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

variable "app_image" {
  description = "Container image for the UI+API service (ECR URI or public)"
  type        = string
}

variable "desired_count" {
  description = "Number of ECS tasks"
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "Fargate task CPU units (smallest 256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB (smallest 512)"
  type        = number
  default     = 512
}

variable "container_port" {
  description = "Container port exposed by the app"
  type        = number
  default     = 3000
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "zone_id" {
  description = "Route53 hosted zone ID (optional). If provided with domain_name, creates A record to ALB."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "DNS name to point at the ALB (optional)"
  type        = string
  default     = ""
}
