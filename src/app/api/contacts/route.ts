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
  const search = params.get("search");
  const source = params.get("source");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  if (source) {
    where.source = source;
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      messages: {
        take: 1,
        orderBy: { sentAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log("Contacts fetched:", contacts.length);
  return NextResponse.json(contacts);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await request.json();
  const { firstName, lastName, email, phone, source, tags, notes } = data;

  if (!source) {
    return NextResponse.json({ error: "source is required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      email: email ?? null,
      phone: phone ?? null,
      source,
      tags: tags ?? [],
      notes: notes ?? null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
