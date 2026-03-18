export const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function postTriage(body: {
  symptoms: string;
  age: number;
  zip_code: string;
}) {
  const res = await fetch(`${API_BASE}/api/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Triage request failed: ${res.status}`);
  }

  return res;
}
