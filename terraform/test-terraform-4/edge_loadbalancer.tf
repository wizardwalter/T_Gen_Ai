resource "aws_route53_zone" "public" {
  name = "three-tier.example.com"
}

resource "aws_wafv2_web_acl" "edge" {
  name  = "sample4-waf"
  scope = "REGIONAL"
  default_action { allow {} }
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "sample4-waf"
    sampled_requests_enabled   = true
  }
}

resource "aws_security_group" "web" {
  name   = "sample4-web-sg"
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

resource "aws_lb" "alb" {
  name               = "sample4-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.web.id, aws_subnet.app.id]
  security_groups    = [aws_security_group.web.id]
}

resource "aws_lb_target_group" "web" {
  name     = "sample4-web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}
