import { getAccessToken, activateSubscription } from "@/lib/paypal";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ subId: string }> }
) {
  try {
    const { subId } = await params;

    const accessToken = await getAccessToken();
    await activateSubscription(accessToken, subId);

    return Response.json({ success: true });
  } catch (err) {
    console.error("PayPal activate subscription error:", err);
    return Response.json(
      { error: "Failed to activate PayPal subscription" },
      { status: 500 }
    );
  }
}
