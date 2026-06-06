import { NextResponse } from "next/server";

// Meta Messenger debug route — disabled. Integration moved to GoHighLevel.
export async function POST() {
  return NextResponse.json({ error: "Meta integration disabled" }, { status: 410 });
}
