import { getPublicSiteUrl } from "@/lib/site-url";

/** Aligns newsletter typography and colors with the public site (globals + layout). */
export const emailTheme = {
  fontSans:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  background: "#f8f3e8",
  surface: "#ffffff",
  text: "#111827",
  textMuted: "#475569",
  textSubtle: "#64748b",
  slate950: "#0f172a",
  slate800: "#1e293b",
  amber200: "#fde68a",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  amber700: "#b45309",
  borderAmber: "rgba(251, 191, 36, 0.55)",
  successBg: "#ecfdf5",
  successText: "#047857",
} as const;

export function siteOrigin(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (trimmed) return trimmed.replace(/\/$/, "");
  return getPublicSiteUrl().replace(/\/$/, "");
}

export function donatePageUrl(baseUrl: string): string {
  return `${siteOrigin(baseUrl)}/donate`;
}
