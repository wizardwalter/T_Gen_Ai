resource "aws_ecr_repository" "app" {
  name = "sample1/app"
}

resource "aws_ecs_cluster" "discovery" {
  name = "sample1-discovery"
}

resource "aws_ecs_task_definition" "discovery" {
  family                   = "sample1-discovery"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"
  container_definitions = jsonencode([
    {
      name      = "discovery"
      image     = "${aws_ecr_repository.app.repository_url}:latest"
      essential = true
      portMappings = [{ containerPort = 8080, hostPort = 8080 }]
    }
  ])
}

resource "aws_ecs_service" "discovery" {
  name            = "sample1-discovery"
  cluster         = aws_ecs_cluster.discovery.id
  task_definition = aws_ecs_task_definition.discovery.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = [aws_subnet.private.id]
    security_groups = [aws_security_group.app.id]
  }
}
