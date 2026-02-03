resource "aws_athena_database" "cur" {
  name   = "sample1_cur"
  bucket = aws_s3_bucket.cur.id
}

resource "aws_s3_bucket" "cur" {
  bucket = "stackgenerate-sample1-cur"
}

resource "aws_s3_bucket" "cur_results" {
  bucket = "stackgenerate-sample1-cur-results"
}

resource "aws_lambda_function" "cost" {
  function_name = "sample1-cost-fn"
  role          = "arn:aws:iam::123456789012:role/lambda-exec"
  runtime       = "python3.12"
  handler       = "index.handler"
  filename      = "lambda_cost.zip"
}
