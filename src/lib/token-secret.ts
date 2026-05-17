const DEV_ADMIN_TOKEN_SECRET = "hart-county-admin-dev-secret";

export function getAdminTokenSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET is required in production.");
  }

  return DEV_ADMIN_TOKEN_SECRET;
}
