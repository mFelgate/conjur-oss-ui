/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequestJson, apiRequestText } from "../src/services/apiClient";

describe("API client error handling", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps a structured Conjur error and its message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "CONJ00001",
              message: "Access denied",
              target: "",
              details: { code: "", target: "", message: "" },
            },
          }),
          { status: 403, statusText: "Forbidden" },
        ),
      ),
    );

    try {
      await apiRequestJson("/resources/account");
      throw new Error("Expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(403);
      expect((error as ApiError).message).toBe(
        "/resources/account failed: 403 Forbidden",
      );
      expect((error as ApiError).response).toMatchObject({
        error: { code: "CONJ00001", message: "Access denied" },
      });
    }
  });

  it("turns an empty JSON error response into a readable ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("", { status: 404, statusText: "Not Found" }),
      ),
    );

    try {
      await apiRequestJson("/authenticators/account");
      throw new Error("Expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).message).toBe(
        "/authenticators/account failed: 404 Not Found",
      );
      expect((error as ApiError).response).toBeNull();
    }
  });

  it("uses a plain-text error body when one is available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Reverse proxy unavailable", {
          status: 502,
          statusText: "Bad Gateway",
        }),
      ),
    );

    try {
      await apiRequestText("/resources/account");
      throw new Error("Expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(502);
      expect((error as ApiError).message).toBe(
        "/resources/account failed: 502 Bad Gateway",
      );
      expect((error as ApiError).response).toBe("Reverse proxy unavailable");
    }
  });
});
