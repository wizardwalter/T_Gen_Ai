import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appBase = process.env.NEXTAUTH_URL || "http://localhost:3000";
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" }) : null;

async function createPortalUrl() {
  if (!stripe) throw new Error("Billing not configured");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) throw new Error("No billing profile");

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appBase}/profile`,
  });

  return portal.url;
}

export async function POST() {
  try {
    const url = await createPortalUrl();
    return NextResponse.json({ url });
  } catch (err) {
    const message = (err as Error).message || "Portal session failed";
    const status = message === "Unauthorized" ? 401 : message === "No billing profile" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const url = await createPortalUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    const message = (err as Error).message || "Portal session failed";
    const status = message === "Unauthorized" ? 401 : message === "No billing profile" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
