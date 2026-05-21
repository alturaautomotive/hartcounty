import crypto from "crypto";

const DEVELOPMENT_TOKEN_SECRET = "hart-county-admin-secret-key";

export type AdminSession = {
  userId: string;
  email: string;
  role?: "super_admin" | "manager";
};

export function getTokenSecret(): string {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET is required in production.");
  }

  return DEVELOPMENT_TOKEN_SECRET;
}

export function createToken(
  userId: string,
  email: string,
  role?: AdminSession["role"]
): string {
  const payload = JSON.stringify({
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const hmac = crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email, role: data.role };
  } catch {
    return null;
  }
}
