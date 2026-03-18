import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

  const response = await fetch(`${backendUrl}/triage/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ message: `Backend error: ${response.status}` }),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
