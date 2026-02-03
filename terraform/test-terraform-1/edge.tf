resource "aws_s3_bucket" "web" {
  bucket = "stackgenerate-sample1-web"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.web.id
    origin_id   = "s3-web"
  }
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-web"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_wafregional_web_acl" "waf" {
  name        = "sample1-waf"
  metric_name = "sample1waf"
  default_action { type = "ALLOW" }
  rule {
    priority = 1
    action { type = "BLOCK" }
    override_action { type = "NONE" }
    type = "RATE_BASED"
    rate_based_rule {
      rate_key   = "IP"
      rate_limit = 2000
    }
  }
}
