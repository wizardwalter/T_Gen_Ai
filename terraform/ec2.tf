data "aws_ami" "app_host" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64*"]
  }
}

resource "aws_ecr_repository" "ui" {
  name = "${var.project_name}-ui"
}

resource "aws_security_group" "app_host" {
  name        = "${var.project_name}-app-sg"
  description = "Allow UI/API traffic from the internet (CloudFront in front)"
  vpc_id      = null # Using default VPC; adjust if you add a VPC module

  ingress {
    from_port   = var.ui_container_port
    to_port     = var.ui_container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = var.api_container_port
    to_port     = var.api_container_port
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

data "aws_iam_policy_document" "app_host_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app_host" {
  name               = "${var.project_name}-app-host"
  assume_role_policy = data.aws_iam_policy_document.app_host_assume.json
}

resource "aws_iam_role_policy_attachment" "app_host_ssm" {
  role       = aws_iam_role.app_host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "app_host_ecr" {
  role       = aws_iam_role.app_host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "app_host" {
  name = "${var.project_name}-app-host"
  role = aws_iam_role.app_host.name
}

resource "aws_eip" "app_host" {
  domain = "vpc"
}

locals {
  app_user_data = <<-EOF
    #!/bin/bash
    set -e
    yum update -y
    amazon-linux-extras install docker -y || yum install -y docker
    systemctl enable docker
    systemctl start docker

    REGION="${data.aws_region.current.name}"

    cat >/usr/local/bin/app-refresh.sh <<'REFRESH'
    #!/bin/bash
    set -e
    REGION="${data.aws_region.current.name}"
    ACCOUNT_ID=$(curl -s http://169.254.169.254/latest/meta-data/identity-credentials/ec2/info | grep -o '"AccountId":"[^"]*"' | cut -d'"' -f4 || aws sts get-caller-identity --query Account --output text)

    UI_IMAGE="${var.ui_image}"
    if [ -z "$UI_IMAGE" ]; then
      UI_IMAGE="$ACCOUNT_ID.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.project_name}-ui:latest"
    fi
    API_IMAGE="${var.api_image}"

    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

    docker pull $UI_IMAGE || true
    docker pull $API_IMAGE || true

    docker stop ui || true && docker rm ui || true
    docker stop api || true && docker rm api || true

    docker run -d --name ui -p ${var.ui_container_port}:${var.ui_container_port} \
      -e NEXTAUTH_URL="${var.nextauth_url}" \
      -e NEXT_PUBLIC_API_BASE="${var.next_public_api_base}" \
      -e GOOGLE_CLIENT_ID="${var.google_client_id}" \
      -e GOOGLE_CLIENT_SECRET="${var.google_client_secret}" \
      -e NEXTAUTH_SECRET="${var.nextauth_secret}" \
      $UI_IMAGE

    docker run -d --name api -p ${var.api_container_port}:${var.api_container_port} \
      $API_IMAGE
    REFRESH
    chmod +x /usr/local/bin/app-refresh.sh

    cat >/etc/systemd/system/app-refresh.service <<'UNIT'
    [Unit]
    Description=Refresh app containers from ECR on boot
    After=network-online.target docker.service
    Wants=network-online.target

    [Service]
    Type=oneshot
    ExecStart=/usr/local/bin/app-refresh.sh
    RemainAfterExit=no

    [Install]
    WantedBy=multi-user.target
    UNIT

    systemctl daemon-reload
    systemctl enable app-refresh.service
    systemctl start app-refresh.service
  EOF
}

data "aws_region" "current" {}

resource "aws_instance" "app_host" {
  ami                    = data.aws_ami.app_host.id
  instance_type          = var.host_instance_type
  iam_instance_profile   = aws_iam_instance_profile.app_host.name
  vpc_security_group_ids = [aws_security_group.app_host.id]
  user_data              = local.app_user_data

  tags = {
    Name = "${var.project_name}-app-host"
  }
}

resource "aws_eip_association" "app_host" {
  instance_id   = aws_instance.app_host.id
  allocation_id = aws_eip.app_host.id
}
