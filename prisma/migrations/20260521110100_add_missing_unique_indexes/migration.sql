-- Keep Prisma's runtime upserts aligned with the deployed PostgreSQL schema.
CREATE UNIQUE INDEX "Donation_paypalTransactionId_key" ON "Donation"("paypalTransactionId");
