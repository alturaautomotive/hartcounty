import { getAccessToken, activateSubscription } from "@/lib/paypal";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const { subId } = await params;

    const accessToken = await getAccessToken();
    const sub = await activateSubscription(accessToken, subId);

    const name = sub.subscriber?.name
      ? `${sub.subscriber.name.given_name} ${sub.subscriber.name.surname}`
      : null;
    const email = sub.subscriber?.email_address ?? null;
    const petId = sub.custom_id === "general" ? null : sub.custom_id;

    await prisma.donation.create({
      data: {
        amount: 25,
        interval: "monthly",
        name,
        email,
        petId,
        paypalTransactionId: subId,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("PayPal activate subscription error:", err);
    return Response.json(
      { error: "Failed to activate PayPal subscription" },
      { status: 500 }
    );
  }
}
