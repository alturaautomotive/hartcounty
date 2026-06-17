-- Ensure PayPal transaction IDs are actually unique in migrated databases.
CREATE UNIQUE INDEX IF NOT EXISTS "Donation_paypalTransactionId_key" ON "Donation"("paypalTransactionId");
