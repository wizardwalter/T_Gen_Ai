locals {
  cognito_callback_urls = compact([
    var.ui_domain_name != "" ? "https://${var.ui_domain_name}/api/auth/callback/cognito" : "",
    var.root_domain_name != "" ? "https://${var.root_domain_name}/api/auth/callback/cognito" : "",
  ])
  cognito_logout_urls = compact([
    var.ui_domain_name != "" ? "https://${var.ui_domain_name}/auth/sign-in" : "",
    var.root_domain_name != "" ? "https://${var.root_domain_name}/auth/sign-in" : "",
  ])
}

resource "aws_cognito_user_pool" "app" {
  name                     = "${var.project_name}-users"
  auto_verified_attributes = ["email"]

  username_attributes = ["email"]

  dynamic "email_configuration" {
    for_each = var.cognito_ses_source_arn != "" ? [1] : []
    content {
      email_sending_account  = "DEVELOPER"
      from_email_address     = var.cognito_from_email
      reply_to_email_address = var.cognito_reply_to_email
      source_arn             = var.cognito_ses_source_arn
      configuration_set      = var.cognito_ses_configuration_set != "" ? var.cognito_ses_configuration_set : null
    }
  }

  lifecycle {
    ignore_changes = [schema]
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = false
    mutable             = true
  }
}

resource "aws_cognito_user_pool_domain" "app" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.app.id
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.app.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "openid email profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
}

resource "aws_cognito_identity_provider" "facebook" {
  count         = var.facebook_app_id != "" && var.facebook_app_secret != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.app.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    authorize_scopes = "public_profile email"
    client_id        = var.facebook_app_id
    client_secret    = var.facebook_app_secret
    api_version      = var.facebook_api_version
  }

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
}

resource "aws_cognito_identity_provider" "apple" {
  count         = var.apple_client_id != "" && var.apple_team_id != "" && var.apple_key_id != "" && var.apple_private_key != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.app.id
  provider_name = "SignInWithApple"
  provider_type = "SignInWithApple"

  provider_details = {
    authorize_scopes = "name email"
    client_id        = var.apple_client_id
    team_id          = var.apple_team_id
    key_id           = var.apple_key_id
    private_key      = var.apple_private_key
  }

  attribute_mapping = {
    email = "email"
    name  = "name"
  }
}

resource "aws_cognito_user_pool_client" "app" {
  name         = "${var.project_name}-web"
  user_pool_id = aws_cognito_user_pool.app.id

  generate_secret                      = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers = compact([
    "COGNITO",
    "Google",
    var.facebook_app_id != "" && var.facebook_app_secret != "" ? "Facebook" : "",
    var.apple_client_id != "" && var.apple_team_id != "" && var.apple_key_id != "" && var.apple_private_key != "" ? "SignInWithApple" : "",
  ])

  depends_on = [
    aws_cognito_identity_provider.google,
    aws_cognito_identity_provider.facebook,
    aws_cognito_identity_provider.apple,
  ]

  callback_urls = local.cognito_callback_urls
  logout_urls   = local.cognito_logout_urls

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
