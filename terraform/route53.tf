locals {
  create_dns_record = var.zone_id != "" && var.domain_name != ""
}

resource "aws_route53_record" "app" {
  count   = local.create_dns_record ? 1 : 0
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.app.dns_name
    zone_id                = aws_lb.app.zone_id
    evaluate_target_health = true
  }
}
