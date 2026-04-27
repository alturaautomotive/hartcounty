import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { handleMessaging } from "@/app/api/webhooks/meta/route";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { psid, text, mid } = await request.json();

  if (!psid || !text) {
    return NextResponse.json(
      { error: "psid and text are required" },
      { status: 400 }
    );
  }

  console.log("[DEBUG META-TEST] Simulating messaging from PSID:", psid, "text:", text);

  try {
    await handleMessaging({
      sender: { id: psid },
      message: { text, mid: mid ?? `debug-${Date.now()}` },
    });

    return NextResponse.json({ ok: true, psid, text });
  } catch (err) {
    console.error("[DEBUG META-TEST] Error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
