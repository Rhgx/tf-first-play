import { ApiError } from "./errors";

const ALLOWED_IMAGE_HOSTS = new Set([
  "steamcdn-a.akamaihd.net",
  "steamuserimages-a.akamaihd.net",
  "media.steampowered.com",
]);

const ALLOWED_SUFFIXES = [".steamstatic.com"];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

function isAllowedHost(hostname: string): boolean {
  const normalizedHost = hostname.toLowerCase();
  if (ALLOWED_IMAGE_HOSTS.has(normalizedHost)) {
    return true;
  }

  return ALLOWED_SUFFIXES.some((suffix) => normalizedHost.endsWith(suffix));
}

function normalizeSourceUrl(rawSource: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(rawSource);
  } catch {
    throw new ApiError("Invalid src URL", 400);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ApiError("Only http/https image sources are allowed", 400);
  }

  if (!isAllowedHost(parsed.hostname)) {
    throw new ApiError("Source host is not allowed", 400);
  }

  if (parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  return parsed;
}

async function fetchImageBytes(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "tf2-first-play-date-finder/1.0",
      },
    });

    if (!response.ok) {
      throw new ApiError(`Upstream image fetch failed (${response.status})`, 502);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Failed to fetch source image", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleImageProxy(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const source = requestUrl.searchParams.get("src")?.trim();

  if (!source) {
    throw new ApiError("Missing src query parameter", 400);
  }

  const normalizedUrl = normalizeSourceUrl(source);
  const upstream = await fetchImageBytes(normalizedUrl.toString());
  const contentType = upstream.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("image/")) {
    throw new ApiError("Source response is not an image", 415);
  }

  const bytes = await upstream.arrayBuffer();

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new ApiError("Source image exceeds maximum size", 413);
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const imageProxyInternals = {
  isAllowedHost,
  normalizeSourceUrl,
};
