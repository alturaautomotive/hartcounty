const DEFAULT_DEV_TOKEN_SECRET = "hart-county-admin-secret-key";

export function getTokenSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET is required in production");
  }

  return DEFAULT_DEV_TOKEN_SECRET;
}
