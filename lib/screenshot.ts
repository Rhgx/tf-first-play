import { toBlob } from "html-to-image";

export interface ScreenshotResult {
  copied: boolean;
  downloaded: boolean;
  fileName: string;
}

const FONT_FACES = [
  { family: "TF2", file: "/fonts/TF2.ttf" },
  { family: "TF2 Secondary", file: "/fonts/TF2Secondary.ttf" },
  { family: "TF2 Build", file: "/fonts/TF2Build.ttf" },
  { family: "TF2 Professor", file: "/fonts/TF2Professor.ttf" },
] as const;

let fontEmbedCSSCache: string | null = null;

async function buildFontEmbedCSS(): Promise<string> {
  if (fontEmbedCSSCache) return fontEmbedCSSCache;

  const parts: string[] = [];
  for (const { family, file } of FONT_FACES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const b64 = btoa(
        new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ""),
      );
      parts.push(
        `@font-face { font-family: "${family}"; src: url("data:font/truetype;base64,${b64}") format("truetype"); }`,
      );
    } catch {
      /* font unavailable – skip */
    }
  }
  fontEmbedCSSCache = parts.join("\n");
  return fontEmbedCSSCache;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function createTimestamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(
    date.getUTCHours(),
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

function makeFileName(steamId: string, generatedAtIso: string): string {
  const date = new Date(generatedAtIso);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return `tf2-first-play-${steamId}-${createTimestamp(safeDate)}-utc.png`;
}

async function waitForImageElements(node: HTMLElement, timeoutMs = 5_000): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  if (images.length === 0) {
    return;
  }

  await Promise.race([
    Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    ).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

/**
 * Convert a single image URL to a base64 data-URL.
 * Returns `null` when the fetch or conversion fails so the caller can
 * fall back to the original `src`.
 */
async function toDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Replace every `<img>` src in `node` with an inline base64 data-URL.
 *
 * `html-to-image` caches fetched resources by pathname alone, so images
 * sharing the same path (e.g. `/api/image-proxy`) but differing only in
 * query parameters all resolve to a single cached image.  By inlining
 * the images ourselves we bypass the library's internal fetch entirely.
 *
 * Returns a cleanup function that restores the original `src` values.
 */
async function inlineImageSources(node: HTMLElement): Promise<() => void> {
  const images = Array.from(node.querySelectorAll("img"));
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    images.map(async (img) => {
      const original = img.src;
      if (!original || original.startsWith("data:")) return;

      const dataUrl = await toDataUrl(original);
      if (dataUrl) {
        originals.push({ img, src: original });
        img.src = dataUrl;
      }
    }),
  );

  return () => {
    for (const { img, src } of originals) {
      img.src = src;
    }
  };
}

function triggerDownload(blob: Blob, fileName: string): boolean {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
  return true;
}

async function tryClipboardCopy(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    return false;
  }

  try {
    const item = new ClipboardItem({
      "image/png": blob,
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

export async function captureShareCard(
  node: HTMLElement,
  steamId: string,
  generatedAtIso: string,
): Promise<ScreenshotResult> {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
  await waitForImageElements(node);

  const restoreImages = await inlineImageSources(node);

  const fontEmbedCSS = await buildFontEmbedCSS();
  const width = node.scrollWidth;
  const height = node.scrollHeight;

  let blob: Blob | null;
  try {
    blob = await toBlob(node, {
      backgroundColor: "#2e2b2a",
      width,
      height,
      pixelRatio: 2,
      fontEmbedCSS,
    });
  } finally {
    restoreImages();
  }

  if (!blob) {
    throw new Error("Failed to generate screenshot image");
  }

  const copied = await tryClipboardCopy(blob);
  const fileName = makeFileName(steamId, generatedAtIso);
  const downloaded = triggerDownload(blob, fileName);

  return {
    copied,
    downloaded,
    fileName,
  };
}
