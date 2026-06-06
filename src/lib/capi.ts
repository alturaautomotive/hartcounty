/**
 * Meta Conversions API (CAPI) — server-side event sender
 * Sends events directly from the server, bypassing ad blockers and iOS restrictions.
 * Pixel ID: 1896870744229819
 */

const PIXEL_ID = "1896870744229819";
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

interface CapiUserData {
  client_ip_address?: string;
  client_user_agent?: string;
  em?: string; // hashed email
  ph?: string; // hashed phone
  fbc?: string; // click ID from _fbc cookie
  fbp?: string; // browser ID from _fbp cookie

}

interface CapiCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  content_category?: string;
}

interface CapiEvent {
  event_name: string;
  event_time: number;
  action_source: "website";
  event_source_url?: string;
  user_data: CapiUserData;
  custom_data?: CapiCustomData;
  event_id?: string; // for dedup with browser pixel
}

/**
 * Send one or more events to Meta CAPI
 */
export async function sendCapiEvent(events: CapiEvent[]) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.warn("[CAPI] META_CAPI_TOKEN not set — skipping");
    return;
  }

  try {
    const res = await fetch(CAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        access_token: token,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[CAPI] Error:", res.status, err);
    } else {
      const data = await res.json();
      console.log("[CAPI] Success:", data);
    }
  } catch (err) {
    console.error("[CAPI] Fetch error:", err);
  }
}

/**
 * Helper: build a CAPI event from a Next.js request
 */
export function buildCapiEvent(
  eventName: string,
  request: Request,
  customData?: CapiCustomData,
  eventId?: string
): CapiEvent {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined;

  const userAgent = request.headers.get("user-agent") ?? undefined;

  // Extract _fbc and _fbp from cookie header
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k?.trim(), v.join("=")];
    })
  );

  return {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: request.url,
    event_id: eventId,
    user_data: {
      client_ip_address: ip,
      client_user_agent: userAgent,
      fbc: cookies["_fbc"],
      fbp: cookies["_fbp"],
    },
    custom_data: customData,
  };
}
