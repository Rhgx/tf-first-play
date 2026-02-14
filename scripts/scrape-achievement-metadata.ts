import { mkdir } from "node:fs/promises";
import { fetchSteamSchema, type SteamSchemaAchievement } from "./shared/steam-schema";

interface MetadataEntry {
  displayName: string;
  iconUrl: string;
  source: "steam";
}

interface MetadataFile {
  generatedAt: string;
  items: Record<string, MetadataEntry>;
}

interface ScrapeReport {
  generatedAt: string;
  total: number;
  steamMapped: number;
  missing: string[];
}

const outputMetadataPath = new URL("../data/achievement-metadata.generated.json", import.meta.url);
const outputReportPath = new URL("../data/scrape-report.generated.json", import.meta.url);

async function buildEntry(achievement: SteamSchemaAchievement): Promise<MetadataEntry> {
  return {
    displayName: achievement.displayName,
    iconUrl: achievement.icon,
    source: "steam",
  };
}

async function main() {
  const apiKey = Bun.env.STEAM_API_KEY || process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new Error("STEAM_API_KEY is required for scrape-achievement-metadata");
  }

  await mkdir(new URL("../data", import.meta.url), { recursive: true });

  const schemaAchievements = await fetchSteamSchema(apiKey);
  const entries = await Promise.all(
    schemaAchievements.map(async (achievement) => {
      const metadata = await buildEntry(achievement);
      return [achievement.name, metadata] as const;
    }),
  );

  const items = Object.fromEntries(entries);
  const values = Object.values(items);

  const metadataFile: MetadataFile = {
    generatedAt: new Date().toISOString(),
    items,
  };

  const missing = values
    .filter((entry) => !entry.iconUrl)
    .map((entry) => entry.displayName)
    .sort((left, right) => left.localeCompare(right));

  const report: ScrapeReport = {
    generatedAt: metadataFile.generatedAt,
    total: values.length,
    steamMapped: values.length,
    missing,
  };

  await Bun.write(outputMetadataPath, `${JSON.stringify(metadataFile, null, 2)}\n`);
  await Bun.write(outputReportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Generated ${values.length} achievement metadata entries from Steam schema.`);
  console.log(`Steam mapped: ${report.steamMapped}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
