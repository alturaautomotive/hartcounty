import crypto from "crypto";

const INSECURE_DEFAULT_TOKEN_SECRET = "hart-county-admin-secret-key";

function getTokenSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret || secret === INSECURE_DEFAULT_TOKEN_SECRET) {
    return null;
  }
  return secret;
}

function requireTokenSecret(): string {
  const secret = getTokenSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET must be set to sign admin session tokens.");
  }
  return secret;
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
  const tokenSecret = requireTokenSecret();
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
