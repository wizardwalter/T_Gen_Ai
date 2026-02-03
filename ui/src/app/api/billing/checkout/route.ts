import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
const appBase = process.env.NEXTAUTH_URL || "http://localhost:3000";

if (!stripeSecretKey) {
  // eslint-disable-next-line no-console
  console.warn("[billing/checkout] STRIPE_SECRET_KEY not set. Calls will fail.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" }) : null;

export async function POST() {
  if (!stripe || !priceId) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const email = session?.user?.email || undefined;
  const name = session?.user?.name || undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch or create a Stripe customer and persist the ID.
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, isSubscriber: true },
  });

  const customerId =
    userRecord?.stripeCustomerId ||
    (await (async () => {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });
      return customer.id;
    })());

  // If already subscribed, short-circuit to profile.
  if (userRecord?.isSubscriber) {
    return NextResponse.json({ url: `${appBase}/profile` });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: false,
    subscription_data: {
      metadata: { userId },
    },
    metadata: { userId },
    success_url: `${appBase}/upload?checkout=success`,
    cancel_url: `${appBase}/upload?checkout=cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
