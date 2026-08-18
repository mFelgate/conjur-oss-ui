/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiRequestTextFullResponse,
} from "../src/services/apiClient";

// This suite documents known defects. It is intentionally excluded from `npm test`
// and should fail until each issue is fixed and moved into apiClient.test.ts.
describe("known API client issues", () => {
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

  it("keeps an empty dry-run 422 response as an ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("", {
          status: 422,
          statusText: "Unprocessable Entity",
        }),
      ),
    );

    await expect(
      apiRequestTextFullResponse("/policies/account/policy/root", {
        dryRun: true,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message:
        "/policies/account/policy/root failed: 422 422 Unprocessable Entity",
    });
  });
});
