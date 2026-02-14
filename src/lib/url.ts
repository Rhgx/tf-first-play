export function toProxyImageUrl(source?: string | null): string | null {
  if (!source) {
    return null;
  }

  if (source.startsWith("/")) {
    return source;
  }

  try {
    const parsed = new URL(source, window.location.origin);

    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}`;
    }

    return `/api/image-proxy?src=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return null;
  }
}
