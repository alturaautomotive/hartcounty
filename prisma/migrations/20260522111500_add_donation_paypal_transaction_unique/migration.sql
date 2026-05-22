-- Align the database with the Prisma schema so PayPal IPN upserts can
-- deduplicate retries and REST capture writes by transaction ID.
CREATE UNIQUE INDEX "Donation_paypalTransactionId_key" ON "Donation"("paypalTransactionId");
