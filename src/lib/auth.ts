import crypto from "crypto";

const DEV_TOKEN_SECRET = "hart-county-admin-dev-secret-key";

function getTokenSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV !== "production") {
    return DEV_TOKEN_SECRET;
  }

  console.error("ADMIN_SECRET is required to sign admin session tokens.");
  return null;
}

export type AdminSession = {
  userId: string;
  email: string;
  role?: "super_admin" | "manager";
};

export function createToken(
  userId: string,
  email: string,
  role?: AdminSession["role"]
): string {
  const tokenSecret = getTokenSecret();
  if (!tokenSecret) {
    throw new Error("ADMIN_SECRET is required to sign admin session tokens.");
  }

  const payload = JSON.stringify({
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const hmac = crypto.createHmac("sha256", tokenSecret).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const tokenSecret = getTokenSecret();
    if (!tokenSecret) return null;

    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto.createHmac("sha256", tokenSecret).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email, role: data.role };
  } catch {
    return null;
  }
}
