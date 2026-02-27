import { NextResponse } from "next/server";
import { cognitoPublicCall, createSecretHash, getCognitoConfig } from "@/lib/cognito";

type ConfirmBody = {
  email?: string;
  code?: string;
};

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConfirmBody;
    const emailRaw = body.email?.trim();
    const code = body.code?.trim();

    if (!emailRaw || !code) {
      return NextResponse.json({ error: "Email and confirmation code are required." }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);
    const { clientId, clientSecret, region } = getCognitoConfig();
    const secretHash = createSecretHash(email, clientId, clientSecret);

    await cognitoPublicCall(
      region,
      "AWSCognitoIdentityProviderService.ConfirmSignUp",
      {
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        SecretHash: secretHash,
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
