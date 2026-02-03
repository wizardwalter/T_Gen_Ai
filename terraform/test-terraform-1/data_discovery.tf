resource "aws_lambda_function" "gremlin_resolver" {
  function_name = "sample1-gremlin-resolver"
  role          = "arn:aws:iam::123456789012:role/lambda-exec"
  runtime       = "python3.12"
  handler       = "index.handler"
  filename      = "lambda_gremlin.zip"
  vpc_config {
    subnet_ids         = [aws_subnet.private.id]
    security_group_ids = [aws_security_group.app.id]
  }
}

resource "aws_neptune_cluster" "graph" {
  cluster_identifier  = "sample1-neptune"
  skip_final_snapshot = true
  iam_roles           = []
}

resource "aws_elasticsearch_domain" "search" {
  domain_name           = "sample1-search"
  elasticsearch_version = "7.10"
  cluster_config { instance_type = "t3.small.elasticsearch" }
  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }
}
