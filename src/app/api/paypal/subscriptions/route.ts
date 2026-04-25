import { getAccessToken, createSubscription } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, petId } = body as {
      planId?: string;
      petId?: string;
    };

    const resolvedPlanId = planId ?? process.env.NEXT_PUBLIC_MONTHLY_PLAN_ID;
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
