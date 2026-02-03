resource "aws_vpc" "main" {
  cidr_block = "10.2.0.0/16"
}

resource "aws_subnet" "app" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.2.1.0/24"
  map_public_ip_on_launch = true
}

resource "aws_s3_bucket" "static" {
  bucket = "stackgenerate-sample3-static"
}

resource "aws_route53_zone" "public" {
  name = "example.com"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.static.id
    origin_id   = "s3-static"
  }
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-static"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction { restriction_type = "none" }
  }
  viewer_certificate { cloudfront_default_certificate = true }
}

resource "aws_wafv2_web_acl" "edge" {
  name        = "sample3-edge-waf"
  scope       = "CLOUDFRONT"
  description = "Basic rate limit"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "sample3-edge"
    sampled_requests_enabled   = true
  }
  rule {
    name     = "RateLimit"
    priority = 1
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    action { block {} }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "sample3-rate"
      sampled_requests_enabled   = true
    }
  }
}
