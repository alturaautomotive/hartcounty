import { getAccessToken, captureOrder } from "@/lib/paypal";
import prisma from "@/lib/prisma";

type PayPalCaptureResponse = {
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id?: string;
        amount?: {
          value?: string;
        };
      }>;
    };
  }>;
};

function getCaptureTransaction(capture: PayPalCaptureResponse) {
  return capture.purchase_units?.[0]?.payments?.captures?.[0];
}

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
    const transaction = getCaptureTransaction(capture);
    const transactionId = transaction?.id;
    if (!transactionId) {
      throw new Error("PayPal capture response missing transaction id");
    }
    const amount = parseFloat(transaction?.amount?.value ?? "0");
    const petId = unit?.custom_id || null;
    const payer = capture.payer;

    await prisma.donation.upsert({
      where: { paypalTransactionId: transactionId },
      create: {
        amount,
        interval: interval ?? "one-time",
        petId,
        paypalTransactionId: transactionId,
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

    return Response.json({ status: "COMPLETED", orderId });
  } catch (err) {
    console.error("PayPal capture order error:", err);
    return Response.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
