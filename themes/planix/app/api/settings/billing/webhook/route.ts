import { NextResponse } from "next/server";

import { handleBillingWebhookEvent, verifyRazorpayWebhookSignature } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature")?.trim();

    if (!signature) {
      return NextResponse.json({ error: "Missing Razorpay webhook signature." }, { status: 400 });
    }

    const rawBody = await request.text();

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: unknown;
    };

    if (!event?.event) {
      return NextResponse.json({ error: "Webhook payload is incomplete." }, { status: 400 });
    }

    await handleBillingWebhookEvent(event as Parameters<typeof handleBillingWebhookEvent>[0]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billing webhook failed." },
      { status: 400 },
    );
  }
}
