import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscriberCount = await prisma.subscriber.count({
    where: { unsubscribed: false },
  });

  await inngest.send({ name: "app/weekly-digest.send", data: {} });

  return NextResponse.json({ queued: true, count: subscriberCount });
}
