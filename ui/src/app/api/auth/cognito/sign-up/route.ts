import { NextResponse } from "next/server";
import { cognitoPublicCall, createSecretHash, getCognitoConfig } from "@/lib/cognito";

type SignUpBody = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
};

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

function validateSignUp(body: SignUpBody): string | null {
  const email = body.email?.trim();
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!email || !password || !confirmPassword) {
    return "Email, password, and password confirmation are required.";
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignUpBody;
    const validationError = validateSignUp(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    const name = body.name?.trim();

    const { clientId, clientSecret, region } = getCognitoConfig();
    const secretHash = createSecretHash(email, clientId, clientSecret);

    await cognitoPublicCall(
      region,
      "AWSCognitoIdentityProviderService.SignUp",
      {
        ClientId: clientId,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
          { Name: "email", Value: email },
          ...(name ? [{ Name: "name", Value: name }] : []),
        ],
      },
    );

    return NextResponse.json({
      ok: true,
      nextStep: "confirm_email",
      email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
