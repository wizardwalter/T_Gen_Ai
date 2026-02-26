locals {
  database_url = "postgresql://${var.db_master_username}:${var.db_master_password}@${aws_db_instance.app.address}:${var.db_port}/${var.db_name}?schema=public"
}

resource "aws_iam_role" "apprunner_ecr" {
  name = "${var.project_name}-apprunner-ecr"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = "sts:AssumeRole"
        Principal = { Service = "build.apprunner.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_role_policy" "apprunner_ecr" {
  name = "${var.project_name}-apprunner-ecr"
  role = aws_iam_role.apprunner_ecr.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_security_group" "apprunner" {
  name        = "${var.project_name}-apprunner-sg"
  description = "Egress for App Runner services"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_apprunner_vpc_connector" "app" {
  vpc_connector_name = "${var.project_name}-apprunner-vpc"
  subnets            = length(var.apprunner_subnet_ids) > 0 ? var.apprunner_subnet_ids : data.aws_subnets.default.ids
  security_groups    = [aws_security_group.apprunner.id]
}

resource "aws_apprunner_service" "ui" {
  service_name = "${var.project_name}-ui"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }

    image_repository {
      image_repository_type = "ECR"
      image_identifier      = var.ui_image
      image_configuration {
        port = tostring(var.ui_container_port)
        runtime_environment_variables = {
          NEXTAUTH_URL            = var.nextauth_url
          NEXT_PUBLIC_API_BASE    = var.next_public_api_base
          NEXT_PUBLIC_ICON_BASE   = var.next_public_icon_base
          API_BASE                = var.api_base
          API_SHARED_SECRET       = var.api_shared_secret
          GOOGLE_CLIENT_ID        = var.google_client_id
          GOOGLE_CLIENT_SECRET    = var.google_client_secret
          OAUTH_GITHUB_CLIENT_ID  = var.oauth_github_client_id
          OAUTH_GITHUB_CLIENT_SECRET = var.oauth_github_client_secret
          NEXTAUTH_SECRET         = var.nextauth_secret
          DATABASE_URL            = local.database_url
        }
      }
    }

    auto_deployments_enabled = var.apprunner_auto_deployments
  }

  instance_configuration {
    cpu    = var.ui_instance_cpu
    memory = var.ui_instance_memory
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 10
    timeout             = 5
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.app.arn
    }
  }
}

resource "aws_apprunner_service" "api" {
  service_name = "${var.project_name}-api"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }

    image_repository {
      image_repository_type = "ECR"
      image_identifier      = var.api_image
      image_configuration {
        port = tostring(var.api_container_port)
        runtime_environment_variables = {
          DATABASE_URL      = local.database_url
          API_SHARED_SECRET = var.api_shared_secret
        }
      }
    }

    auto_deployments_enabled = var.apprunner_auto_deployments
  }

  instance_configuration {
    cpu    = var.api_instance_cpu
    memory = var.api_instance_memory
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 10
    timeout             = 5
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.app.arn
    }
  }
}

resource "aws_apprunner_custom_domain_association" "ui" {
  count       = var.ui_domain_name != "" ? 1 : 0
  service_arn = aws_apprunner_service.ui.arn
  domain_name = var.ui_domain_name
}

resource "aws_apprunner_custom_domain_association" "api" {
  count       = var.api_domain_name != "" ? 1 : 0
  service_arn = aws_apprunner_service.api.arn
  domain_name = var.api_domain_name
}
