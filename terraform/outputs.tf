output "cloudfront_domain" {
  description = "CloudFront domain for the UI"
  value       = aws_cloudfront_distribution.ui.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for invalidations"
  value       = aws_cloudfront_distribution.ui.id
}

output "cloudfront_aliases" {
  description = "Configured CloudFront aliases"
  value       = aws_cloudfront_distribution.ui.aliases
}

output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image"
  value       = aws_ecr_repository.api.repository_url
}

output "ui_ecr_repository_url" {
  description = "ECR repository URL for the UI image"
  value       = aws_ecr_repository.ui.repository_url
}

output "alb_dns_name" {
  description = "DNS name for the application load balancer"
  value       = aws_lb.app.dns_name
}

output "alb_zone_id" {
  description = "Zone ID for the application load balancer"
  value       = aws_lb.app.zone_id
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

output "aurora_endpoint" {
  description = "Writer endpoint for Aurora"
  value       = aws_rds_cluster.app.endpoint
}

output "aurora_reader_endpoint" {
  description = "Reader endpoint for Aurora"
  value       = aws_rds_cluster.app.reader_endpoint
}

output "aurora_db_name" {
  description = "Database name"
  value       = aws_rds_cluster.app.database_name
}
