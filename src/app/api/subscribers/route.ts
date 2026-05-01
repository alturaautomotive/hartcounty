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
  const email = params.get("email");
  const search = params.get("search");
  const source = params.get("source");

  // Exact email lookup — returns { subscribed: boolean }
  if (email) {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });
    return NextResponse.json({ subscribed: !!subscriber });
  }

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (source) {
    where.source = source;
  }

  const subscribers = await prisma.subscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscribers);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token || !verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await request.json();
  const { email, firstName, source } = data;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const subscriber = await prisma.subscriber.upsert({
    where: { email },
    update: { firstName: firstName ?? undefined, source: source ?? undefined },
    create: {
      email,
      firstName: firstName ?? null,
      source: source ?? "manual",
      consentedAt: new Date(),
    },
  });

  return NextResponse.json(subscriber, { status: 201 });
}
