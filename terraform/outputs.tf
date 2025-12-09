output "ui_bucket_name" {
  description = "S3 bucket for the UI static site"
  value       = aws_s3_bucket.ui.bucket
}

output "cloudfront_domain" {
  description = "CloudFront domain for the UI"
  value       = aws_cloudfront_distribution.ui.domain_name
}

output "api_url" {
  description = "Base URL for the API Gateway HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}
