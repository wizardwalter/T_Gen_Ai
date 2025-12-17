output "cloudfront_domain" {
  description = "CloudFront domain for the UI"
  value       = aws_cloudfront_distribution.ui.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for invalidations"
  value       = aws_cloudfront_distribution.ui.id
}

output "ui_bucket_name" {
  description = "S3 bucket for the UI static site"
  value       = aws_s3_bucket.ui.bucket
}

output "api_url" {
  description = "Base URL for the API Gateway HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image"
  value       = aws_ecr_repository.api.repository_url
}
