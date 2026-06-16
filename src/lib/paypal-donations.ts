type PayPalCaptureResponse = {
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
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
  };
};

export function buildCapturedOrderDonation(
  capture: PayPalCaptureResponse,
  orderId: string,
  interval = "one-time"
) {
  const unit = capture.purchase_units?.[0];
  const paymentCapture = unit?.payments?.captures?.[0];
  const payer = capture.payer;
  const givenName = payer?.name?.given_name ?? "";
  const surname = payer?.name?.surname ?? "";
  const name = `${givenName} ${surname}`.trim();

  return {
    amount: parseFloat(paymentCapture?.amount?.value ?? "0"),
    interval,
    petId: unit?.custom_id || null,
    paypalTransactionId: paymentCapture?.id ?? orderId,
    name: name || null,
    email: payer?.email_address ?? null,
  };
}
