const PAYPAL_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!clientId || !secret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET env vars");
  }

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function createOrder(
  accessToken: string,
  opts: { amount: number; interval?: string; petId?: string }
) {
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: opts.amount.toFixed(2) },
          ...(opts.petId ? { custom_id: opts.petId } : {}),
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`PayPal createOrder failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function captureOrder(accessToken: string, orderId: string) {
  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`PayPal captureOrder failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function createSubscription(
  accessToken: string,
  opts: { planId: string; petId?: string }
) {
  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: opts.planId,
      custom_id: opts.petId || "general",
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`PayPal createSubscription failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function activateSubscription(accessToken: string, subId: string) {
  const res = await fetch(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${encodeURIComponent(subId)}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`PayPal activateSubscription failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
