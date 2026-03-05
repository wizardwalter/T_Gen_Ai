import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const runtime = "nodejs";

const normalizeBase = (value: string) => value.replace(/\/+$/, "");
const DAILY_ANON_UPLOAD_LIMIT = 1;
const anonUsageByIp = new Map<string, { day: string; count: number }>();

const utcDay = () => new Date().toISOString().slice(0, 10);

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  return `unknown:${userAgent.slice(0, 80)}`;
}

function pruneUsage(currentDay: string) {
  if (anonUsageByIp.size < 5000) return;
  for (const [key, value] of anonUsageByIp.entries()) {
    if (value.day !== currentDay) {
      anonUsageByIp.delete(key);
    }
  }
}

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

  const session = await getServerSession(authOptions);
  const signedIn = Boolean(session?.user?.id);
  const day = utcDay();
  const ipKey = clientIp(req);
  if (!signedIn) {
    pruneUsage(day);
    const usage = anonUsageByIp.get(ipKey);
    if (usage?.day === day && usage.count >= DAILY_ANON_UPLOAD_LIMIT) {
      console.warn(`[upload-gate] blocked ip=${ipKey} day=${day} count=${usage.count}`);
      return Response.json(
        {
          errorCode: "FREE_UPLOAD_LIMIT_REACHED",
          message: "Please create an account to proceed.",
          limit: DAILY_ANON_UPLOAD_LIMIT,
          resetAtUtc: `${day}T23:59:59.999Z`,
        },
        { status: 429 },
      );
    }
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

    if (!signedIn && resp.ok) {
      const existing = anonUsageByIp.get(ipKey);
      if (existing?.day === day) {
        existing.count += 1;
        anonUsageByIp.set(ipKey, existing);
        console.info(`[upload-gate] anon upload ip=${ipKey} day=${day} count=${existing.count}`);
      } else {
        anonUsageByIp.set(ipKey, { day, count: 1 });
        console.info(`[upload-gate] anon upload ip=${ipKey} day=${day} count=1`);
      }
    }

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
