import prisma from "@/lib/prisma";
import { sendCapiEvent, buildCapiEvent } from "@/lib/capi";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);

  // Verify with PayPal
  const verifyUrl =
    process.env.NODE_ENV === "production"
      ? "https://ipnpb.paypal.com/cgi-bin/webscr"
      : "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";

  const verifyRes = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `${rawBody}&cmd=_notify-validate`,
  });
  const verifyText = await verifyRes.text();

  if (verifyText !== "VERIFIED") {
    console.warn("PayPal IPN verification failed:", verifyText);
    return Response.json({}, { status: 200 });
  }

  const paymentStatus = params.get("payment_status");
  if (paymentStatus !== "Completed") {
    return Response.json({}, { status: 200 });
  }

  const mcGross = params.get("mc_gross") ?? "0";
  const payerEmail = params.get("payer_email") ?? "";
  const firstName = params.get("first_name") ?? "";
  const lastName = params.get("last_name") ?? "";
  const txnId = params.get("txn_id") ?? "";
  const txnType = params.get("txn_type") ?? "";
  const custom = params.get("custom") ?? "";

  const amount = parseFloat(mcGross);
  const name = `${firstName} ${lastName}`.trim();
  const interval = txnType === "subscr_payment" ? "monthly" : "one-time";
  const petId = custom || null;

  // Fire CAPI Purchase event
  await sendCapiEvent([{
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: txnId,
    user_data: {
      client_ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      client_user_agent: request.headers.get("user-agent") ?? undefined,
    },
    custom_data: {
      value: amount,
      currency: "USD",
      content_name: interval === "monthly" ? "Monthly Donation" : "One-time Donation",
      content_type: "product",
    },
  }]);

  await prisma.donation.upsert({
    where: { paypalTransactionId: txnId },
    create: {
      paypalTransactionId: txnId,
      amount,
      name,
      email: payerEmail || null,
      petId,
      interval,
    },
    update: {
      amount,
      name,
      email: payerEmail || null,
      petId,
      interval,
    },
  });

  if (payerEmail) {
    await prisma.subscriber.upsert({
      where: { email: payerEmail },
      create: {
        email: payerEmail,
        source: "donation_form",
        isMonthly: interval === "monthly",
        firstName: name,
        consentedAt: new Date(),
      },
      update: {
        ...(interval === "monthly" ? { isMonthly: true } : {}),
      },
    });
  }

  return Response.json({}, { status: 200 });
}
