import { getAccessToken, captureOrder } from "@/lib/paypal";
import prisma from "@/lib/prisma";
import { buildCapturedOrderDonation } from "@/lib/paypal-donations";

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
    const donation = buildCapturedOrderDonation(
      capture,
      orderId,
      interval ?? "one-time"
    );

    await prisma.donation.upsert({
      where: { paypalTransactionId: donation.paypalTransactionId },
      create: donation,
      update: {
        amount: donation.amount,
        interval: donation.interval,
        petId: donation.petId,
        name: donation.name,
        email: donation.email,
      },
    });

    return Response.json({ status: "COMPLETED", orderId });
  } catch (err) {
    console.error("PayPal capture order error:", err);
    return Response.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
