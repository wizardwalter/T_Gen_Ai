resource "aws_db_subnet_group" "db" {
  name       = "sample4-db-subnets"
  subnet_ids = [aws_subnet.db.id]
}

resource "aws_rds_instance" "db" {
  identifier_prefix    = "sample4-rds"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "postgres"
  password             = "postgres123!"
  db_subnet_group_name = aws_db_subnet_group.db.name
  skip_final_snapshot  = true
}
