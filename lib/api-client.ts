import type { LookupRequest, LookupResponse } from "./types";

export async function lookupSteamProfile(input: string): Promise<LookupResponse> {
  const payload: LookupRequest = { input };

  const response = await fetch("/api/lookup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as LookupResponse;

  if (!response.ok) {
    const message = data.errors?.[0] ?? "Lookup failed";
    throw new Error(message);
  }

  return data;
}
