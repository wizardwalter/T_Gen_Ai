resource "aws_apigatewayv2_api" "http" {
  name          = "sample3-http"
  protocol_type = "HTTP"
}

resource "aws_lambda_function" "backend" {
  function_name = "sample3-backend"
  role          = "arn:aws:iam::123456789012:role/lambda-exec"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "lambda_backend.zip"
}

resource "aws_ecs_cluster" "app" {
  name = "sample3-app"
}

resource "aws_ecs_task_definition" "service" {
  family                   = "sample3-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"
  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "public.ecr.aws/docker/library/nginx:latest"
      essential = true
      portMappings = [{ containerPort = 80, hostPort = 80 }]
    }
  ])
}

resource "aws_security_group" "app" {
  name   = "sample3-app-sg"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_service" "app" {
  name            = "sample3-app"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = [aws_subnet.app.id]
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier  = "sample3-aurora"
  engine              = "aurora-mysql"
  master_username     = "admin"
  master_password     = "password123!"
  skip_final_snapshot = true
}

resource "aws_sqs_queue" "events" {
  name = "sample3-events"
}

resource "aws_sns_topic" "notifications" {
  name = "sample3-notifications"
}

resource "aws_elasticache_cluster" "cache" {
  cluster_id           = "sample3-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/aws/sample3/app"
  retention_in_days = 14
}

resource "aws_guardduty_detector" "gd" {
  enable = true
}
