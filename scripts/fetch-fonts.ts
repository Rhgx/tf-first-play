import { mkdir } from "node:fs/promises";

interface FontTarget {
  filename: string;
  candidates: string[];
}

const basePaths = [
  "https://raw.githubusercontent.com/jakadak/TF2-extended-fonts/main",
  "https://raw.githubusercontent.com/jakadak/TF2-extended-fonts/master",
];

const fontTargets: FontTarget[] = [
  {
    filename: "TF2.ttf",
    candidates: ["TF2.ttf", "fonts/TF2.ttf", "resource/TF2.ttf"],
  },
  {
    filename: "TF2Secondary.ttf",
    candidates: ["TF2Secondary.ttf", "fonts/TF2Secondary.ttf", "resource/TF2Secondary.ttf"],
  },
  {
    filename: "TF2Build.ttf",
    candidates: ["TF2Build.ttf", "fonts/TF2Build.ttf", "resource/TF2Build.ttf"],
  },
  {
    filename: "TF2Professor.ttf",
    candidates: ["TF2Professor.ttf", "fonts/TF2Professor.ttf", "resource/TF2Professor.ttf"],
  },
];

const outputDir = new URL("../public/fonts/", import.meta.url);

async function fetchFirstAvailable(target: FontTarget): Promise<ArrayBuffer | null> {
  for (const basePath of basePaths) {
    for (const candidate of target.candidates) {
      const url = `${basePath}/${candidate}`;
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }

      return response.arrayBuffer();
    }
  }

  return null;
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  for (const target of fontTargets) {
    const bytes = await fetchFirstAvailable(target);
    if (!bytes) {
      console.warn(`Could not download ${target.filename}`);
      continue;
    }

    await Bun.write(new URL(target.filename, outputDir), bytes);
    console.log(`Saved ${target.filename}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
