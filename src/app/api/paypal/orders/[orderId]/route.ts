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
    const capturedPayment = unit?.payments?.captures?.[0];
    if (!capturedPayment?.id || !capturedPayment.amount?.value) {
      throw new Error(`PayPal capture ${orderId} did not include a transaction id and amount.`);
    }
    const captureId = capturedPayment.id;
    const amount = parseFloat(capturedPayment.amount.value);
    const petId = unit?.custom_id || null;
    const payer = capture.payer;

    await prisma.donation.upsert({
      where: { paypalTransactionId: captureId },
      create: {
        amount,
        interval: interval ?? "one-time",
        petId,
        paypalTransactionId: captureId,
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

    return Response.json({ status: "COMPLETED", orderId, captureId });
  } catch (err) {
    console.error("PayPal capture order error:", err);
    return Response.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
