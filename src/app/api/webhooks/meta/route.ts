import { NextRequest } from "next/server";

// Meta Messenger webhook — disabled. Integration moved to GoHighLevel.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const challenge = params.get("hub.challenge");
  // Still respond to verification handshake so Meta doesn't error
  if (challenge) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new Response("OK", { status: 200 });
}

export async function POST() {
  // Inbound messages are no longer processed — integration disabled.
  return new Response("OK", { status: 200 });
}
