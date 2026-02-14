import { describe, expect, it } from "bun:test";
import { parseLookupRequest } from "./validation";

describe("validation", () => {
  it("accepts valid lookup payload", async () => {
    const request = new Request("http://localhost/api/lookup", {
      method: "POST",
      body: JSON.stringify({ input: " 76561198012345678 " }),
      headers: { "Content-Type": "application/json" },
    });

    const parsed = await parseLookupRequest(request);
    expect(parsed.input).toBe("76561198012345678");
  });

  it("rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/lookup", {
      method: "POST",
      body: JSON.stringify({ input: "" }),
      headers: { "Content-Type": "application/json" },
    });

    await expect(parseLookupRequest(request)).rejects.toThrow("Invalid lookup request");
  });
});
