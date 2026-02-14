
output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image"
  value       = aws_ecr_repository.api.repository_url
}

output "ui_ecr_repository_url" {
  description = "ECR repository URL for the UI image"
  value       = aws_ecr_repository.ui.repository_url
}


output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.app.name
}

output "ecs_ui_service_name" {
  description = "ECS UI service name"
  value       = aws_ecs_service.ui.name
}

output "ecs_api_service_name" {
  description = "ECS API service name"
  value       = aws_ecs_service.api.name
}

output "icons_bucket_name" {
  description = "S3 bucket for public icons"
  value       = aws_s3_bucket.icons.bucket
}

output "icons_base_url" {
  description = "Base URL for icons bucket"
  value       = "https://${aws_s3_bucket.icons.bucket}.s3.amazonaws.com"
}

output "db_endpoint" {
  description = "RDS endpoint for Postgres"
  value       = aws_db_instance.app.address
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.app.db_name
}
