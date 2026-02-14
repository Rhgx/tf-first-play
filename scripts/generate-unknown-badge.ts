import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sourcePath = new URL("../public/images/badges/mercenary.png", import.meta.url);
const fontPath = new URL("../public/fonts/TF2Build.ttf", import.meta.url);
const outputPath = new URL("../public/images/badges/unknown.png", import.meta.url);
const sourceFilePath = fileURLToPath(sourcePath);
const fontFilePath = fileURLToPath(fontPath);
const outputFilePath = fileURLToPath(outputPath);
const normalizedSourcePath = sourceFilePath.replace(/\\/g, "/");
const normalizedFontPath = fontFilePath.replace(/\\/g, "/");
const normalizedOutputPath = outputFilePath.replace(/\\/g, "/");

const source = Bun.file(sourcePath);
const font = Bun.file(fontPath);

if (!(await source.exists())) {
  throw new Error("Missing source image: public/images/badges/mercenary.png");
}

if (!(await font.exists())) {
  throw new Error("Missing font: public/fonts/TF2Build.ttf");
}

const args = [
  normalizedSourcePath,
  "-alpha",
  "set",
  "-channel",
  "RGB",
  "-evaluate",
  "set",
  "0",
  "+channel",
  "-font",
  normalizedFontPath,
  "-fill",
  "white",
  "-stroke",
  "black",
  "-strokewidth",
  "2",
  "-gravity",
  "center",
  "-pointsize",
  "220",
  "-annotate",
  "+0+16",
  "?",
  normalizedOutputPath,
];

const result = spawnSync("magick", args, {
  stdio: "inherit",
});

if (result.status !== 0) {
  throw new Error(`ImageMagick failed with status ${result.status ?? -1}`);
}

console.log("Generated public/images/badges/unknown.png");
