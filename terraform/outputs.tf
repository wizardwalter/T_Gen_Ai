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

output "ui_bucket_name" {
  description = "S3 bucket for the UI static site"
  value       = aws_s3_bucket.ui.bucket
}

output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image"
  value       = aws_ecr_repository.api.repository_url
}

output "ui_ecr_repository_url" {
  description = "ECR repository URL for the UI image"
  value       = aws_ecr_repository.ui.repository_url
}

output "app_host_eip" {
  description = "Public IP for the app host EC2"
  value       = aws_eip.app_host.public_ip
}

output "app_host_instance_id" {
  description = "Instance ID for the app host EC2"
  value       = aws_instance.app_host.id
}

output "icons_bucket_name" {
  description = "S3 bucket for public icons"
  value       = aws_s3_bucket.icons.bucket
}

output "icons_base_url" {
  description = "Base URL for icons bucket"
  value       = "https://${aws_s3_bucket.icons.bucket}.s3.amazonaws.com"
}
