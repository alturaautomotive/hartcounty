/**
 * Public site origin for absolute links (emails, password reset, etc.).
 *
 * Priority:
 * 1. `NEXT_PUBLIC_BASE_URL` — set this on Vercel to your `*.vercel.app` URL (or final domain later).
 * 2. `VERCEL_URL` — automatically set on Vercel deployments (no scheme).
 * 3. `http://localhost:3000` for local dev.
 */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (explicit) {
    let u = explicit.replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(u)) {
      u = `https://${u}`;
    }
    return u;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}
