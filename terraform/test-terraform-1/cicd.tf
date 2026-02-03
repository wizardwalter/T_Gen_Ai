resource "aws_codebuild_project" "build" {
  name         = "sample1-discovery-build"
  service_role = "arn:aws:iam::123456789012:role/codebuild-role"
  source { type = "CODEPIPELINE" }
  artifacts { type = "CODEPIPELINE" }
  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:7.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = true
  }
}

resource "aws_s3_bucket" "discovery_assets" {
  bucket = "stackgenerate-sample1-discovery"
}
