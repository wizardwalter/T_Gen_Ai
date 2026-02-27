locals {
  ui_env_raw = {
    NEXTAUTH_URL          = var.nextauth_url
    NEXT_PUBLIC_API_BASE  = var.next_public_api_base
    NEXT_PUBLIC_ICON_BASE = var.next_public_icon_base
    API_BASE              = var.api_base
    API_SHARED_SECRET     = var.api_shared_secret
    NEXTAUTH_SECRET       = var.nextauth_secret
    COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.app.id
    COGNITO_CLIENT_SECRET = aws_cognito_user_pool_client.app.client_secret
    COGNITO_ISSUER        = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.app.id}"
  }
  api_env_raw = {
    API_SHARED_SECRET = var.api_shared_secret
  }
  ui_env = {
    for k, v in local.ui_env_raw :
    k => trimspace(coalesce(v, ""))
    if trimspace(coalesce(v, "")) != ""
  }
  api_env = {
    for k, v in local.api_env_raw :
    k => trimspace(coalesce(v, ""))
    if trimspace(coalesce(v, "")) != ""
  }
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
        runtime_environment_variables = local.ui_env
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
      egress_type = "DEFAULT"
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
        runtime_environment_variables = local.api_env
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
      egress_type = "DEFAULT"
    }
  }
}

resource "aws_apprunner_custom_domain_association" "ui" {
  count       = var.ui_domain_name != "" ? 1 : 0
  service_arn = aws_apprunner_service.ui.arn
  domain_name = var.ui_domain_name
  enable_www_subdomain = false
}

resource "aws_apprunner_custom_domain_association" "api" {
  count       = var.api_domain_name != "" ? 1 : 0
  service_arn = aws_apprunner_service.api.arn
  domain_name = var.api_domain_name
  enable_www_subdomain = false
}
