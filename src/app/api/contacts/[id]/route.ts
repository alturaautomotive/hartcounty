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
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { messages: true },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(contact);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { notes, tags } = body;

  const data: Record<string, unknown> = {};
  if (notes !== undefined) data.notes = notes;
  if (tags !== undefined) data.tags = tags;

  const contact = await prisma.contact.update({
    where: { id },
    data,
  });

  return NextResponse.json(contact);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
