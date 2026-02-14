import { NextRequest } from "next/server";

export const runtime = "nodejs";

const normalizeBase = (value: string) => value.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  const apiBase =
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "http://localhost:4000";
  const sharedSecret = process.env.API_SHARED_SECRET;

  if (!sharedSecret) {
    return new Response("API_SHARED_SECRET is not configured.", {
      status: 500,
    });
  }

  try {
    const formData = await req.formData();
    const url = `${normalizeBase(apiBase)}/api/terraform/upload`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "x-stackgenerate-ui-secret": sharedSecret,
      },
      body: formData,
    });

    const body = await resp.arrayBuffer();
    const headers = new Headers(resp.headers);
    headers.delete("content-encoding");

    return new Response(body, {
      status: resp.status,
      headers,
    });
  } catch (err) {
    console.error("[api/terraform/upload] proxy failed", err);
    return new Response("Failed to forward upload.", { status: 502 });
  }
}
