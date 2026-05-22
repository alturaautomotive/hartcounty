import { getAccessToken, captureOrder } from "@/lib/paypal";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { interval } = body as { interval?: string };

    const accessToken = await getAccessToken();
    const capture = await captureOrder(accessToken, orderId);

    const unit = capture.purchase_units?.[0];
    const paymentCapture = unit?.payments?.captures?.[0];
    const paypalTransactionId = paymentCapture?.id;
    const amount = parseFloat(paymentCapture?.amount?.value ?? "0");
    const petId = unit?.custom_id || null;
    const payer = capture.payer;

    if (!paypalTransactionId || !Number.isFinite(amount) || amount <= 0) {
      throw new Error("PayPal capture response did not include a valid payment transaction");
    }

    await prisma.donation.upsert({
      where: { paypalTransactionId },
      create: {
        amount,
        interval: interval ?? "one-time",
        petId,
        paypalTransactionId,
        name: payer?.name
          ? `${payer.name.given_name} ${payer.name.surname}`
          : null,
        email: payer?.email_address ?? null,
      },
      update: {
        amount,
        interval: interval ?? "one-time",
        petId,
        name: payer?.name
          ? `${payer.name.given_name} ${payer.name.surname}`
          : null,
        email: payer?.email_address ?? null,
      },
    });

    return Response.json({ status: "COMPLETED", orderId, paypalTransactionId });
  } catch (err) {
    console.error("PayPal capture order error:", err);
    return Response.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
