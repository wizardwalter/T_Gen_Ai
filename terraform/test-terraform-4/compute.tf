resource "aws_launch_template" "web" {
  name_prefix   = "sample4-web-"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web.id]
}

resource "aws_autoscaling_group" "web" {
  desired_capacity    = 2
  max_size            = 3
  min_size            = 2
  vpc_zone_identifier = [aws_subnet.web.id]
  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
}

resource "aws_security_group" "app" {
  name   = "sample4-app-sg"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "sample4-app-"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  vpc_security_group_ids = [aws_security_group.app.id]
}

resource "aws_autoscaling_group" "app" {
  desired_capacity    = 2
  max_size            = 3
  min_size            = 2
  vpc_zone_identifier = [aws_subnet.app.id]
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
}
