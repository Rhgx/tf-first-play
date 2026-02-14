import { mkdir } from "node:fs/promises";

interface BadgeTarget {
  filename: string;
  url: string;
}

const badgeTargets: BadgeTarget[] = [
  {
    filename: "mercenary.png",
    url: "https://wiki.teamfortress.com/w/images/3/37/Backpack_Mercenary.png",
  },
  {
    filename: "soldier-of-fortune.png",
    url: "https://wiki.teamfortress.com/w/images/3/38/Backpack_Soldier_of_Fortune.png",
  },
  {
    filename: "grizzled-veteran.png",
    url: "https://wiki.teamfortress.com/w/images/9/9b/Backpack_Grizzled_Veteran.png",
  },
];

const outputDir = new URL("../public/images/badges/", import.meta.url);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response> {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "tf2-first-play-date-finder/1.0",
      },
    });

    if (response.ok) {
      return response;
    }

    if (response.status !== 429 || attempt === maxAttempts) {
      throw new Error(`Failed to fetch ${url} (${response.status})`);
    }

    await sleep(1000 * attempt);
  }

  throw new Error(`Failed to fetch ${url}`);
}

async function downloadToFile(url: string, destination: URL) {
  const response = await fetchWithRetry(url);
  const bytes = await response.arrayBuffer();
  await Bun.write(destination, bytes);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  for (const target of badgeTargets) {
    const destination = new URL(target.filename, outputDir);
    const destinationFile = Bun.file(destination);

    if (await destinationFile.exists()) {
      console.log(`Skipped ${target.filename} (already exists)`);
      continue;
    }

    await downloadToFile(target.url, destination);
    console.log(`Saved ${target.filename}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
