import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messageId } = await request.json();
  if (!messageId || typeof messageId !== "string") {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
