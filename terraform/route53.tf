locals {
  s3_website_zone_ids = {
    "us-east-1" = "Z3AQBSTGFYJSTF"
    "us-east-2" = "Z2O1EMRO9K5GLX"
    "us-west-1" = "Z2F56UZL2M1ACD"
    "us-west-2" = "Z3BJ6K6RIION7M"
  }
  s3_website_zone_id = lookup(local.s3_website_zone_ids, var.aws_region, null)
  apex_redirect_host = var.apex_redirect_target != "" ? var.apex_redirect_target : var.ui_domain_name
  ui_validation_records = var.ui_domain_name != "" ? {
    for rec in aws_apprunner_custom_domain_association.ui[0].certificate_validation_records :
    "${rec.name}|${rec.type}" => rec
  } : {}
  api_validation_records = var.api_domain_name != "" ? {
    for rec in aws_apprunner_custom_domain_association.api[0].certificate_validation_records :
    "${rec.name}|${rec.type}" => rec
  } : {}

}

resource "aws_route53_record" "ui_validation" {
  for_each = var.ui_domain_name != "" && var.hosted_zone_id != "" ? local.ui_validation_records : {}
  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl      = 300
  records  = [each.value.value]
}

resource "aws_route53_record" "api_validation" {
  for_each = var.api_domain_name != "" && var.hosted_zone_id != "" ? local.api_validation_records : {}
  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl      = 300
  records  = [each.value.value]
}

resource "aws_route53_record" "ui_cname" {
  count   = var.ui_domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.ui_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_apprunner_custom_domain_association.ui[0].dns_target]
}

resource "aws_route53_record" "api_cname" {
  count   = var.api_domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.api_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_apprunner_custom_domain_association.api[0].dns_target]
}

resource "aws_s3_bucket" "apex_redirect" {
  count  = var.root_domain_name != "" ? 1 : 0
  bucket = var.root_domain_name
}

resource "aws_s3_bucket_public_access_block" "apex_redirect" {
  count                   = var.root_domain_name != "" ? 1 : 0
  bucket                  = aws_s3_bucket.apex_redirect[0].id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "apex_redirect" {
  count  = var.root_domain_name != "" ? 1 : 0
  bucket = aws_s3_bucket.apex_redirect[0].id

  redirect_all_requests_to {
    host_name = local.apex_redirect_host
    protocol  = "https"
  }
}

data "aws_iam_policy_document" "apex_redirect" {
  count = var.root_domain_name != "" ? 1 : 0

  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.apex_redirect[0].arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "apex_redirect" {
  count  = var.root_domain_name != "" ? 1 : 0
  bucket = aws_s3_bucket.apex_redirect[0].id
  policy = data.aws_iam_policy_document.apex_redirect[0].json
}

resource "aws_acm_certificate" "apex_redirect" {
  count             = var.root_domain_name != "" ? 1 : 0
  domain_name       = var.root_domain_name
  validation_method = "DNS"
}

resource "aws_route53_record" "apex_redirect_validation" {
  count   = var.root_domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = one(aws_acm_certificate.apex_redirect[0].domain_validation_options).resource_record_name
  type    = one(aws_acm_certificate.apex_redirect[0].domain_validation_options).resource_record_type
  ttl     = 300
  records = [one(aws_acm_certificate.apex_redirect[0].domain_validation_options).resource_record_value]
}

resource "aws_acm_certificate_validation" "apex_redirect" {
  count                   = var.root_domain_name != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.apex_redirect[0].arn
  validation_record_fqdns = var.hosted_zone_id != "" ? [aws_route53_record.apex_redirect_validation[0].fqdn] : []
}

resource "aws_cloudfront_distribution" "apex_redirect" {
  count   = var.root_domain_name != "" ? 1 : 0
  enabled = true

  aliases = [var.root_domain_name]

  origin {
    origin_id   = "apex-redirect-s3"
    domain_name = aws_s3_bucket_website_configuration.apex_redirect[0].website_endpoint

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "apex-redirect-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.apex_redirect[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_route53_record" "apex_a" {
  count   = var.root_domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.root_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.apex_redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.apex_redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  count   = var.root_domain_name != "" && var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.root_domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.apex_redirect[0].domain_name
    zone_id                = aws_cloudfront_distribution.apex_redirect[0].hosted_zone_id
    evaluate_target_health = false
  }
}
