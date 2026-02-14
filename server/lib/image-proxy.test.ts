import { afterEach, describe, expect, it } from "bun:test";
import { isApiError } from "./errors";
import { handleImageProxy, imageProxyInternals } from "./image-proxy";

const originalFetch = globalThis.fetch;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("image-proxy", () => {
  describe("isAllowedHost", () => {
    it("allows known Steam hosts", () => {
      expect(imageProxyInternals.isAllowedHost("steamcdn-a.akamaihd.net")).toBe(true);
      expect(imageProxyInternals.isAllowedHost("avatars.akamai.steamstatic.com")).toBe(true);
      expect(imageProxyInternals.isAllowedHost("steamuserimages-a.akamaihd.net")).toBe(true);
    });

    it("rejects unknown hosts", () => {
      expect(imageProxyInternals.isAllowedHost("example.com")).toBe(false);
      expect(imageProxyInternals.isAllowedHost("evil.steamstatic.co")).toBe(false);
    });
  });

  describe("normalizeSourceUrl", () => {
    it("upgrades http to https for allowed hosts", () => {
      const normalized = imageProxyInternals.normalizeSourceUrl("http://steamcdn-a.akamaihd.net/image.png");
      expect(normalized.protocol).toBe("https:");
      expect(normalized.hostname).toBe("steamcdn-a.akamaihd.net");
    });

    it("throws for disallowed hosts", () => {
      expect(() => imageProxyInternals.normalizeSourceUrl("https://example.com/image.png")).toThrow(
        "Source host is not allowed",
      );
    });

    it("throws for non-http protocols", () => {
      expect(() => imageProxyInternals.normalizeSourceUrl("file:///tmp/image.png")).toThrow(
        "Only http/https image sources are allowed",
      );
    });
  });

  describe("handleImageProxy", () => {
    it("rejects when src is missing", async () => {
      const request = new Request("http://localhost/api/image-proxy");
      await expect(handleImageProxy(request)).rejects.toThrow("Missing src query parameter");
    });

    it("rejects disallowed hostname with 400", async () => {
      const request = new Request(
        "http://localhost/api/image-proxy?src=" + encodeURIComponent("https://example.com/image.png"),
      );
      const error = await handleImageProxy(request).then(
        () => null,
        (e: unknown) => e,
      );
      expect(error).not.toBeNull();
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.status).toBe(400);
        expect(error.message).toBe("Source host is not allowed");
      }
    });

    it("rejects non-image upstream responses", async () => {
      globalThis.fetch = async () =>
        new Response("not-image", {
          status: 200,
          headers: {
            "content-type": "text/plain",
          },
        });

      const request = new Request(
        "http://localhost/api/image-proxy?src=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fsample.txt",
      );

      await expect(handleImageProxy(request)).rejects.toThrow("Source response is not an image");
    });

    it("returns proxied bytes for valid image responses", async () => {
      globalThis.fetch = async () =>
        new Response(new Uint8Array([137, 80, 78, 71]), {
          status: 200,
          headers: {
            "content-type": "image/png",
          },
        });

      const request = new Request(
        "http://localhost/api/image-proxy?src=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fsample.png",
      );

      const response = await handleImageProxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");
      expect(response.headers.get("cache-control")).toContain("max-age=86400");
    });

    it("rejects oversized image with 413", async () => {
      const oversizedBody = new ArrayBuffer(MAX_IMAGE_BYTES + 1);
      globalThis.fetch = async () =>
        new Response(oversizedBody, {
          status: 200,
          headers: {
            "content-type": "image/png",
          },
        });

      const request = new Request(
        "http://localhost/api/image-proxy?src=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Flarge.png",
      );

      const error = await handleImageProxy(request).then(
        () => null,
        (e: unknown) => e,
      );
      expect(error).not.toBeNull();
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.status).toBe(413);
        expect(error.message).toBe("Source image exceeds maximum size");
      }
    });

    it("rejects on fetch abort/timeout with 502", async () => {
      globalThis.fetch = async () => {
        throw new DOMException("The operation was aborted.", "AbortError");
      };

      const request = new Request(
        "http://localhost/api/image-proxy?src=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fimage.png",
      );

      const error = await handleImageProxy(request).then(
        () => null,
        (e: unknown) => e,
      );
      expect(error).not.toBeNull();
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.status).toBe(502);
        expect(error.message).toBe("Failed to fetch source image");
      }
    });
  });
});
