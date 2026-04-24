import crypto from "crypto";

const TOKEN_SECRET = process.env.ADMIN_SECRET ?? "hart-county-admin-secret-key";

export function createToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString();
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}
