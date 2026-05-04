import crypto from "crypto";
import { getTokenSecret } from "./token-secret";

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
