import * as cheerio from "cheerio";

interface WikiSearchResult {
  title: string;
}

interface WikiSearchResponse {
  query?: {
    search?: WikiSearchResult[];
  };
}

interface WikiParseResponse {
  parse?: {
    title: string;
    text?: {
      "*": string;
    };
  };
}

interface WikiPageImagesResponse {
  query?: {
    pages?: Record<
      string,
      {
        original?: { source: string };
        thumbnail?: { source: string };
      }
    >;
  };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

export async function searchWikiTitle(query: string): Promise<string | null> {
  const endpoint = `https://wiki.teamfortress.com/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as WikiSearchResponse;
  const candidates = payload.query?.search ?? [];

  if (candidates.length === 0) {
    return null;
  }

  const target = normalize(query);
  const exact = candidates.find((entry) => normalize(entry.title) === target);
  return exact?.title ?? candidates[0]?.title ?? null;
}

export async function getInfoboxImageUrl(pageTitle: string): Promise<string | null> {
  const pageImageEndpoint = `https://wiki.teamfortress.com/w/api.php?action=query&titles=${encodeURIComponent(
    pageTitle,
  )}&prop=pageimages&piprop=original|thumbnail&pithumbsize=512&format=json`;
  const pageImageResponse = await fetch(pageImageEndpoint);
  if (pageImageResponse.ok) {
    const pageImagePayload = (await pageImageResponse.json()) as WikiPageImagesResponse;
    const pages = pageImagePayload.query?.pages
      ? Object.values(pageImagePayload.query.pages)
      : [];
    const page = pages[0];
    const pageImage = page?.original?.source ?? page?.thumbnail?.source;
    if (pageImage) {
      return pageImage;
    }
  }

  const endpoint = `https://wiki.teamfortress.com/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&format=json`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as WikiParseResponse;
  const html = payload.parse?.text?.["*"];
  if (!html) {
    return null;
  }

  const $ = cheerio.load(html);
  const image = $("table.infobox img, .infobox img").first();
  const src = image.attr("src");

  if (!src) {
    return null;
  }

  if (src.startsWith("//")) {
    return `https:${src}`;
  }

  if (src.startsWith("/")) {
    return `https://wiki.teamfortress.com${src}`;
  }

  return src;
}

export async function findWikiPageAndIcon(query: string): Promise<{ title: string; iconUrl: string | null } | null> {
  const title = await searchWikiTitle(query);
  if (!title) {
    return null;
  }

  const iconUrl = await getInfoboxImageUrl(title);
  return {
    title,
    iconUrl,
  };
}
