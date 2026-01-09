resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "ui" {
  bucket = "${var.project_name}-ui-${random_id.suffix.hex}"

  tags = {
    Name = "${var.project_name}-ui"
  }
}

resource "aws_s3_bucket_ownership_controls" "ui" {
  bucket = aws_s3_bucket.ui.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "ui" {
  bucket                  = aws_s3_bucket.ui.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "ui" {
  name                              = "${var.project_name}-ui-oac"
  description                       = "OAC for ${var.project_name} UI bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "ui" {
  enabled     = true
  price_class = var.cloudfront_price_class
  comment     = "${var.project_name} UI"
  aliases     = var.cloudfront_domain_names

  origin {
    domain_name = aws_eip.app_host.public_ip
    origin_id   = "ui-origin"

    custom_origin_config {
      http_port              = var.ui_container_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = aws_eip.app_host.public_ip
    origin_id   = "api-origin"

    custom_origin_config {
      http_port              = var.api_container_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ui-origin"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0

  }

  ordered_cache_behavior {
    path_pattern     = "/api/auth/*"
    target_origin_id = "ui-origin"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "api-origin"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn != "" ? [1] : []
    content {
      acm_certificate_arn      = var.acm_certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }

  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn == "" ? [1] : []
    content {
      cloudfront_default_certificate = true
    }
  }

  tags = {
    Name = "${var.project_name}-ui-cf"
  }
}

# --- CloudFront abuse guardrail ---
# CloudFront only publishes 1-minute metrics, so this alarm approximates "75 req in ~10-15s"
# by alerting/acting if Requests exceed 450 per minute. Alarm action triggers a Lambda that
# disables the distribution.

resource "aws_sns_topic" "cloudfront_guardrail" {
  name = "${var.project_name}-cloudfront-guardrail"
}

data "aws_iam_policy_document" "cloudfront_guardrail_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cloudfront_guardrail" {
  name               = "${var.project_name}-cloudfront-guardrail"
  assume_role_policy = data.aws_iam_policy_document.cloudfront_guardrail_assume.json
}

data "aws_iam_policy_document" "cloudfront_guardrail" {
  statement {
    actions = [
      "cloudfront:GetDistribution",
      "cloudfront:UpdateDistribution"
    ]
    resources = [aws_cloudfront_distribution.ui.arn]
  }

  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "cloudfront_guardrail" {
  name   = "${var.project_name}-cloudfront-guardrail"
  policy = data.aws_iam_policy_document.cloudfront_guardrail.json
}

resource "aws_iam_role_policy_attachment" "cloudfront_guardrail" {
  role       = aws_iam_role.cloudfront_guardrail.name
  policy_arn = aws_iam_policy.cloudfront_guardrail.arn
}

data "archive_file" "cloudfront_guardrail" {
  type        = "zip"
  output_path = "${path.module}/cloudfront-guardrail.zip"
  source {
    content  = replace(file("${path.module}/lambda/cloudfront-guardrail/index.js.tpl"), "__DISTRIBUTION_ID__", aws_cloudfront_distribution.ui.id)
    filename = "index.js"
  }
}

resource "aws_lambda_function" "cloudfront_guardrail" {
  function_name = "${var.project_name}-cloudfront-guardrail"
  role          = aws_iam_role.cloudfront_guardrail.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = data.archive_file.cloudfront_guardrail.output_path

  environment {
    variables = {
      DISTRIBUTION_ID = aws_cloudfront_distribution.ui.id
    }
  }
}

resource "aws_lambda_permission" "cloudfront_guardrail_sns" {
  statement_id  = "AllowSNSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cloudfront_guardrail.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.cloudfront_guardrail.arn
}

resource "aws_sns_topic_subscription" "cloudfront_guardrail" {
  topic_arn = aws_sns_topic.cloudfront_guardrail.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.cloudfront_guardrail.arn
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_guardrail" {
  alarm_name          = "${var.project_name}-cloudfront-guardrail"
  alarm_description   = "Approximate burst guardrail: disable distribution if Requests exceed 450 in 1 minute."
  namespace           = "AWS/CloudFront"
  metric_name         = "Requests"
  dimensions          = { DistributionId = aws_cloudfront_distribution.ui.id, Region = "Global" }
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  threshold           = 450
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.cloudfront_guardrail.arn]
}
