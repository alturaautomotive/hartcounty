import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const contactId = params.get("contactId");

  if (!contactId) {
    return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { contactId };

  const since = params.get("since");
  if (since) {
    where.sentAt = { gt: new Date(since) };
  }

  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { sentAt: "asc" },
  });

  return NextResponse.json({ messages, contact });
}
