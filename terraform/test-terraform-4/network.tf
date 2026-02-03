resource "aws_vpc" "main" {
  cidr_block           = "10.3.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_subnet" "web" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.3.1.0/24"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "app" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.3.2.0/24"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "db" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.3.3.0/24"
  availability_zone = "us-east-1a"
}
