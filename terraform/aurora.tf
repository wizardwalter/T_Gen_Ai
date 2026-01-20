data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project_name}-aurora-subnets"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "${var.project_name}-aurora-subnets"
  }
}

resource "aws_security_group" "aurora" {
  name        = "${var.project_name}-aurora-sg"
  description = "Allow DB access from app host"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description              = "App host to Aurora"
    from_port                = var.db_port
    to_port                  = var.db_port
    protocol                 = "tcp"
    source_security_group_id = aws_security_group.app_host.id
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-aurora-sg"
  }
}

resource "aws_rds_cluster" "app" {
  cluster_identifier              = "${var.project_name}-aurora"
  engine                          = "aurora-postgresql"
  engine_version                  = "15.4"
  database_name                   = var.db_name
  master_username                 = var.db_master_username
  master_password                 = var.db_master_password
  db_subnet_group_name            = aws_db_subnet_group.aurora.name
  vpc_security_group_ids          = [aws_security_group.aurora.id]
  storage_encrypted               = true
  backup_retention_period         = 1
  preferred_backup_window         = "07:00-09:00"
  deletion_protection             = false
  apply_immediately               = true
  copy_tags_to_snapshot           = true
  enable_http_endpoint            = false
  skip_final_snapshot             = true
  port                            = var.db_port
  serverlessv2_scaling_configuration {
    min_capacity = var.db_min_capacity_acu
    max_capacity = var.db_max_capacity_acu
  }

  tags = {
    Name = "${var.project_name}-aurora"
  }
}

resource "aws_rds_cluster_instance" "app" {
  count               = 1
  identifier          = "${var.project_name}-aurora-${count.index}"
  cluster_identifier  = aws_rds_cluster.app.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.app.engine
  engine_version      = aws_rds_cluster.app.engine_version
  publicly_accessible = false
}
