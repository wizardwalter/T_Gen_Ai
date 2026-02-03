import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" }) : null;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) return;
  const userId = session.metadata?.userId;
  const customerId = session.customer?.toString();
  const subscriptionId = session.subscription?.toString();

  if (!userId || !customerId || !subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      isSubscriber: subscription.status === "active" || subscription.status === "trialing",
      plan: "pro",
      subscriptionStatus: subscription.status,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
    },
  });
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId = sub.customer?.toString();
  const subscriptionId = sub.id;
  if (!customerId && !subscriptionId) return;

  const status = sub.status;
  const isActive = status === "active" || status === "trialing";
  const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  // Prefer subscriptionId match, fall back to customerId.
  const targetUser =
    (await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true },
    })) ||
    (customerId
      ? await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        })
      : null);

  if (!targetUser?.id) return;

  await prisma.user.update({
    where: { id: targetUser.id },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId,
      isSubscriber: isActive,
      plan: isActive ? "pro" : "free",
      subscriptionStatus: status,
      currentPeriodEnd,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[billing/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[billing/webhook] handler error", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
