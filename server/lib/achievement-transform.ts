import type { AchievementView, LookupResponse } from "../../src/lib/types";
import type { SteamAchievement } from "./steam";
import { fileURLToPath } from "node:url";

interface MetadataEntry {
  displayName: string;
  iconUrl: string;
  wikiUrl?: string;
  source: "wiki" | "steam";
}

interface MetadataFile {
  generatedAt: string;
  items: Record<string, MetadataEntry>;
}

const metadataPath = fileURLToPath(
  new URL("../../data/achievement-metadata.generated.json", import.meta.url),
);

let metadataCache: MetadataFile | null = null;

async function loadMetadata(): Promise<MetadataFile> {
  if (metadataCache) {
    return metadataCache;
  }

  const file = Bun.file(metadataPath);
  const exists = await file.exists();
  if (!exists) {
    metadataCache = { generatedAt: new Date(0).toISOString(), items: {} };
    return metadataCache;
  }

  try {
    metadataCache = (await file.json()) as MetadataFile;
  } catch {
    metadataCache = { generatedAt: new Date(0).toISOString(), items: {} };
  }

  return metadataCache;
}

export async function mapUnlockedAchievements(
  achievements: SteamAchievement[],
): Promise<LookupResponse["achievements"]> {
  const metadata = await loadMetadata();

  const unlocked = achievements
    .filter((achievement) => achievement.achieved === 1 && achievement.unlocktime > 0)
    .sort((left, right) => left.unlocktime - right.unlocktime);

  const items: AchievementView[] = unlocked.map((achievement) => {
    const entry = metadata.items[achievement.apiname];
    return {
      apiName: achievement.apiname,
      displayName: entry?.displayName ?? achievement.name ?? achievement.apiname,
      unlockTime: achievement.unlocktime,
      unlockDateIso: new Date(achievement.unlocktime * 1000).toISOString(),
      iconUrl: entry?.iconUrl ?? "https://wiki.teamfortress.com/w/images/5/54/Icon_achievement_trophy.png",
      source: entry?.source ?? "steam",
      wikiUrl: entry?.wikiUrl,
    };
  });

  return {
    unlockedCount: items.length,
    earliestUnlockIso: items[0]?.unlockDateIso ?? null,
    items,
  };
}
