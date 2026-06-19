import { getAccessToken, createSubscription } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { petId } = body as {
      petId?: string;
    };

    const resolvedPlanId = process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID;
    if (!resolvedPlanId) {
      return Response.json(
        { error: "Missing plan ID" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const subscription = await createSubscription(accessToken, {
      planId: resolvedPlanId,
      petId,
    });

    return Response.json({ id: subscription.id });
  } catch (err) {
    console.error("PayPal create subscription error:", err);
    return Response.json(
      { error: "Failed to create PayPal subscription" },
      { status: 500 }
    );
  }
}
