import { ApiError, apiRequestText } from "./apiClient";
import type { HttpMethod } from "./apiClient";
import type { PolicyLoadResponse } from "../types";
import { CONJUR_ACCOUNT } from "../config";

interface PolicyErrorResponse {
  status: string;
  errors: PolicyError[];
}

interface PolicyError {
  line: number;
  column: number;
  message: string;
  context: PolicyErrorContext;
}

interface PolicyErrorContext {
  policy_id: string;
  offending_lines: number[];
}

function isPolicyErrorResponse(value: unknown): value is PolicyErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Array.isArray(record.errors);
}

const RootPath = `/policies/${encodeURIComponent(CONJUR_ACCOUNT)}/policy`;

export const policyService = {
  getEffectivePolicy(serviceId: string) {
    const path = `${RootPath}/${encodeURIComponent(serviceId)}`;
    return apiRequestText(path, {
      headers: {
        accept: "text/plain",
      },
    });
  },
  async loadPolicy(
    policyContent: string,
    branch: string,
    method: Extract<HttpMethod, "POST" | "PATCH" | "PUT">,
    dryRun: boolean = true,
  ) {
    const path = `${RootPath}/${encodeURIComponent(branch)}`;

    try {
      const response = await apiRequestText(path, {
        method,
        query: {
          dryRun,
        },
        headers: {
          accept: "text/plain",
        },
        body: policyContent,
      });

      return {
        status: 200,
        data: JSON.parse(response) as PolicyLoadResponse,
      };
    } catch (error) {
      if (error instanceof ApiError && dryRun && error.status === 422) {
        const policyError = isPolicyErrorResponse(error.response)
          ? error.response
          : {
              status: "Invalid YAML",
              errors: [],
            };

        throw new ApiError(
          policyError,
          error.status,
          error.message,
        );
      }

      throw error;
    }
  },
};
