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

    await expect(apiRequestJson("/resources/account")).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      message: "/resources/account failed: 403 Access denied",
      response: { error: { code: "CONJ00001", message: "Access denied" } },
    });
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
      expect(error).toMatchObject({
        status: 404,
        message: "/authenticators/account failed: 404 404 Not Found",
        response: { error: { code: "404", message: "404 Not Found" } },
      });
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

    await expect(apiRequestText("/resources/account")).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      message: "/resources/account failed: 502 Reverse proxy unavailable",
    });
  });
});
