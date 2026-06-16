import assert from "node:assert/strict";
import test from "node:test";
import { buildCapturedOrderDonation } from "./paypal-donations";

test("buildCapturedOrderDonation keys donations by capture transaction id", () => {
  const donation = buildCapturedOrderDonation(
    {
      purchase_units: [
        {
          custom_id: "pet_123",
          payments: {
            captures: [
              {
                id: "PAYPAL-CAPTURE-123",
                amount: { value: "25.00" },
              },
            ],
          },
        },
      ],
      payer: {
        name: { given_name: "Ada", surname: "Lovelace" },
        email_address: "ada@example.com",
      },
    },
    "PAYPAL-ORDER-456"
  );

  assert.equal(donation.paypalTransactionId, "PAYPAL-CAPTURE-123");
  assert.equal(donation.amount, 25);
  assert.equal(donation.petId, "pet_123");
  assert.equal(donation.name, "Ada Lovelace");
  assert.equal(donation.email, "ada@example.com");
});

test("buildCapturedOrderDonation falls back to order id if capture id is absent", () => {
  const donation = buildCapturedOrderDonation(
    {
      purchase_units: [
        {
          payments: {
            captures: [{ amount: { value: "10.50" } }],
          },
        },
      ],
    },
    "PAYPAL-ORDER-789",
    "monthly"
  );

  assert.equal(donation.paypalTransactionId, "PAYPAL-ORDER-789");
  assert.equal(donation.amount, 10.5);
  assert.equal(donation.interval, "monthly");
  assert.equal(donation.petId, null);
});
