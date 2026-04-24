import { getAccessToken, createOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, interval, petId } = body as {
      amount: number;
      interval?: string;
      petId?: string;
    };

    if (!amount || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const order = await createOrder(accessToken, { amount, interval, petId });

    return Response.json({ id: order.id });
  } catch (err) {
    console.error("PayPal create order error:", err);
    return Response.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
