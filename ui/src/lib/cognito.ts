import { createHmac } from "crypto";

type CognitoConfig = {
  clientId: string;
  clientSecret: string;
  region: string;
};

function parseRegionFromIssuer(issuer: string): string {
  const match = issuer.match(/^https:\/\/cognito-idp\.([a-z0-9-]+)\.amazonaws\.com\/.+$/);
  if (!match?.[1]) {
    throw new Error("Invalid COGNITO_ISSUER format");
  }
  return match[1];
}

export function getCognitoConfig(): CognitoConfig {
  const clientId = process.env.COGNITO_CLIENT_ID ?? "";
  const clientSecret = process.env.COGNITO_CLIENT_SECRET ?? "";
  const issuer = process.env.COGNITO_ISSUER ?? "";

  if (!clientId || !clientSecret || !issuer) {
    throw new Error("Missing Cognito env vars: COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_ISSUER");
  }

  return {
    clientId,
    clientSecret,
    region: parseRegionFromIssuer(issuer),
  };
}

export function createSecretHash(username: string, clientId: string, clientSecret: string): string {
  return createHmac("sha256", clientSecret).update(`${username}${clientId}`).digest("base64");
}

export async function cognitoPublicCall<TResponse>(region: string, target: string, body: Record<string, unknown>) {
  const res = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : typeof payload.__type === "string"
          ? payload.__type
          : "Cognito request failed";
    throw new Error(message);
  }

  return payload as TResponse;
}
