resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "icons" {
  bucket = "${var.project_name}-icons-${random_id.suffix.hex}"
  tags = {
    Name = "${var.project_name}-icons"
  }
}

resource "aws_s3_bucket_ownership_controls" "icons" {
  bucket = aws_s3_bucket.icons.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Allow public read for assets.
resource "aws_s3_bucket_public_access_block" "icons" {
  bucket                  = aws_s3_bucket.icons.id
  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "icons_read" {
  bucket = aws_s3_bucket.icons.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = "${aws_s3_bucket.icons.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.icons]
}

resource "aws_s3_bucket_cors_configuration" "icons" {
  bucket = aws_s3_bucket.icons.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
