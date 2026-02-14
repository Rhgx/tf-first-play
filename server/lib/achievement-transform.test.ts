import { describe, expect, it } from "bun:test";
import { mapUnlockedAchievements } from "./achievement-transform";

describe("achievement-transform", () => {
  it("filters and sorts unlocked achievements", async () => {
    const result = await mapUnlockedAchievements([
      { apiname: "B", achieved: 1, unlocktime: 20 },
      { apiname: "A", achieved: 1, unlocktime: 10 },
      { apiname: "C", achieved: 0, unlocktime: 5 },
    ]);

    expect(result.unlockedCount).toBe(2);
    expect(result.items[0]?.apiName).toBe("A");
    expect(result.items[1]?.apiName).toBe("B");
  });

  it("falls back to api name when metadata is missing", async () => {
    const result = await mapUnlockedAchievements([{ apiname: "TF_TEST", achieved: 1, unlocktime: 10 }]);
    expect(result.items[0]?.displayName).toBe("TF_TEST");
    expect(result.items[0]?.source).toBe("steam");
  });
});
