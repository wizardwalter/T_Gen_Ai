terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "app" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.1.1.0/24"
  map_public_ip_on_launch = true
}

resource "aws_s3_bucket" "ingest" {
  bucket = "stackgenerate-sample2-ingest"
}

resource "aws_apigatewayv2_api" "http" {
  name          = "sample2-api"
  protocol_type = "HTTP"
}

resource "aws_lambda_function" "ingest" {
  function_name = "sample2-ingest"
  role          = "arn:aws:iam::123456789012:role/lambda-exec"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "lambda_ingest.zip"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.ingest.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_sqs_queue" "work" {
  name = "sample2-work"
}

resource "aws_instance" "server" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.app.id
  associate_public_ip_address = true
  tags = { Name = "sample2-server" }
}

resource "aws_db_instance" "data" {
  identifier_prefix   = "sample2-data"
  allocated_storage   = 20
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  username            = "postgres"
  password            = "postgres123"
  skip_final_snapshot = true
}

resource "aws_ecs_cluster" "workers" {
  name = "sample2-workers"
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "sample2-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"
  container_definitions = jsonencode([
    {
      name      = "worker"
      image     = "public.ecr.aws/docker/library/busybox:latest"
      essential = true
      command   = ["sh", "-c", "echo processing && sleep 30"]
    }
  ])
}

resource "aws_ecs_service" "workers" {
  name            = "sample2-workers"
  cluster         = aws_ecs_cluster.workers.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 3
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = [aws_subnet.app.id]
    assign_public_ip = true
  }
}

resource "aws_iam_role" "analytics" {
  name = "sample2-analytics"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_instance" "analytics" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.app.id
  iam_instance_profile = aws_iam_role.analytics.name
  tags = { Name = "sample2-analytics" }
}
