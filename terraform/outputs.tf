output "alb_dns_name" {
  description = "Public DNS name of the ALB"
  value       = aws_lb.app.dns_name
}

output "service_url" {
  description = "Service URL (Route53 if configured, else ALB DNS)"
  value       = local.create_dns_record ? "${var.domain_name}" : aws_lb.app.dns_name
}
