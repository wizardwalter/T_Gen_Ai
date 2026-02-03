resource "aws_cognito_user_pool" "pool" {
  name = "sample1-users"
}

resource "aws_appsync_graphql_api" "api" {
  name                = "sample1-appsync"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"
  user_pool_config {
    default_action = "ALLOW"
    user_pool_id   = aws_cognito_user_pool.pool.id
  }
}

resource "aws_dynamodb_table" "settings" {
  name         = "sample1-settings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_lambda_function" "settings" {
  function_name = "sample1-settings-fn"
  role          = "arn:aws:iam::123456789012:role/lambda-exec"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "lambda_settings.zip"
}
