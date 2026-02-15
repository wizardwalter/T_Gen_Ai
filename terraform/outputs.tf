
output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image"
  value       = aws_ecr_repository.api.repository_url
}

output "ui_ecr_repository_url" {
  description = "ECR repository URL for the UI image"
  value       = aws_ecr_repository.ui.repository_url
}

output "ui_service_url" {
  description = "App Runner URL for the UI service"
  value       = aws_apprunner_service.ui.service_url
}

output "api_service_url" {
  description = "App Runner URL for the API service"
  value       = aws_apprunner_service.api.service_url
}

output "ui_domain_validation_records" {
  description = "DNS records required to validate the UI custom domain"
  value       = var.ui_domain_name != "" ? aws_apprunner_custom_domain_association.ui[0].certificate_validation_records : []
}

output "api_domain_validation_records" {
  description = "DNS records required to validate the API custom domain"
  value       = var.api_domain_name != "" ? aws_apprunner_custom_domain_association.api[0].certificate_validation_records : []
}

output "ui_domain_dns_target" {
  description = "CNAME target for the UI custom domain"
  value       = var.ui_domain_name != "" ? aws_apprunner_custom_domain_association.ui[0].dns_target : ""
}

output "api_domain_dns_target" {
  description = "CNAME target for the API custom domain"
  value       = var.api_domain_name != "" ? aws_apprunner_custom_domain_association.api[0].dns_target : ""
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
