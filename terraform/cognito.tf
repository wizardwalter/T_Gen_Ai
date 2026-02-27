locals {
  cognito_email_base_url = var.ui_domain_name != "" ? "https://${var.ui_domain_name}" : (
    var.root_domain_name != "" ? "https://${var.root_domain_name}" : "https://www.stackgenerate.com"
  )

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

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verify your StackGenerate account"
    email_message        = <<-EOT
      <html>
        <body style="margin:0;padding:0;background:#0f172a;color:#e2e8f0;font-family:Arial,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111827;border:1px solid #334155;border-radius:16px;padding:24px;">
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <img src="${local.cognito_email_base_url}/logo-v2.png" alt="StackGenerate" width="160" style="display:block;height:auto;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:22px;font-weight:700;color:#f8fafc;padding-bottom:8px;">
                      Confirm your email
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;line-height:1.6;color:#cbd5e1;padding-bottom:16px;">
                      Use this code to finish setting up your StackGenerate account.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px;">
                      <div style="display:inline-block;background:#020617;border:1px solid #475569;border-radius:10px;padding:12px 16px;font-size:28px;letter-spacing:4px;font-weight:700;color:#38bdf8;">
                        {####}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;line-height:1.5;color:#94a3b8;">
                      If you didn't request this, you can ignore this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    EOT
  }

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
