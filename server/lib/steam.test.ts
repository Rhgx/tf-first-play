import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { SteamClient } from "./steam";

describe("SteamClient", () => {
  const apiKey = "test-key";
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns steam64 as-is", async () => {
    const client = new SteamClient(apiKey);
    const steamId = await client.resolveSteamId("76561198012345678");
    expect(steamId).toBe("76561198012345678");
  });

  it("extracts steam64 from profile url", async () => {
    const client = new SteamClient(apiKey);
    const steamId = await client.resolveSteamId("https://steamcommunity.com/profiles/76561198012345678/");
    expect(steamId).toBe("76561198012345678");
  });

  it("resolves vanity names via api", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: { success: 1, steamid: "76561198012345678" } }),
      } as Response),
    ) as typeof fetch;

    const client = new SteamClient(apiKey);
    const steamId = await client.resolveSteamId("gaben");
    expect(steamId).toBe("76561198012345678");
  });

  it("flags inventory privacy for status 15", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: { status: 15 } }),
      } as Response),
    ) as typeof fetch;

    const client = new SteamClient(apiKey);
    const result = await client.getPlayerItems("76561198012345678");
    expect(result.isPrivate).toBe(true);
    expect(result.success).toBe(false);
  });
});
