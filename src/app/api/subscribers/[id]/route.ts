import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const subscriber = await prisma.subscriber.findUnique({ where: { id } });

  if (!subscriber) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(subscriber);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { firstName, source, unsubscribed } = body;

  const data: Record<string, unknown> = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (source !== undefined) data.source = source;
  if (unsubscribed !== undefined) data.unsubscribed = unsubscribed;

  const subscriber = await prisma.subscriber.update({
    where: { id },
    data,
  });

  return NextResponse.json(subscriber);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  await prisma.subscriber.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
