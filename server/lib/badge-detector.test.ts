import { describe, expect, it } from "bun:test";
import { createUnknownBadge, detectBadge } from "./badge-detector";
import type { SteamItem } from "./steam";

describe("badge-detector", () => {
  it("returns unknown badge when no mercenary badge exists", () => {
    const result = detectBadge([{ id: 1, defindex: 42 }]);
    expect(result.found).toBe(false);
    expect(result.iconUrl).toBe("/images/badges/unknown.png");
  });

  it("detects mercenary badge tier and icon", () => {
    const items: SteamItem[] = [{ id: 1, defindex: 166 }];
    const result = detectBadge(items);

    expect(result.found).toBe(true);
    expect(result.tier).toBe("bronze");
    expect(result.iconUrl).toBe("/images/badges/mercenary.png");
  });

  it("extracts hire date from known attribute", () => {
    const items: SteamItem[] = [
      {
        id: 1,
        defindex: 170,
        attributes: [{ defindex: 143, float_value: 1267401600 }],
      },
    ];

    const result = detectBadge(items);
    expect(result.hireDateIso).toBe("2010-03-01T00:00:00.000Z");
  });

  it("creates unknown placeholder payload", () => {
    const result = createUnknownBadge("not visible");
    expect(result.isPlaceholder).toBe(true);
    expect(result.reason).toBe("not visible");
  });
});
