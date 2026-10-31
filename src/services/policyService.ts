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

interface PolicyApplyErrorResponse {
  error: {
    code: string;
    message: string;
    innererror?: {
      code: string;
      filename: string;
      line: number;
      column: number;
    };
  };
}

interface PolicyDryRunMessageErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

function isPolicyDryRunMessageErrorResponse(
  value: unknown,
): value is PolicyDryRunMessageErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const error = record.error;
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = (error as Record<string, unknown>).message;
  return typeof message === "string";
}

function toPolicyLoadResult(response: string): PolicyLoadResponse {
  return JSON.parse(response) as PolicyLoadResponse;
}

async function requestPolicyLoad(
  path: string,
  policyContent: string,
  method: Extract<HttpMethod, "POST" | "PATCH" | "PUT">,
  dryRun: boolean,
): Promise<string> {
  return apiRequestText(path, {
    method,
    query: {
      dryRun,
    },
    headers: {
      accept: "text/plain",
    },
    body: policyContent,
  });
}

async function runDryRunPolicyLoad(
  path: string,
  policyContent: string,
  method: Extract<HttpMethod, "POST" | "PATCH" | "PUT">,
): Promise<PolicyLoadResponse> {
  try {
    const response = await requestPolicyLoad(path, policyContent, method, true);
    return toPolicyLoadResult(response);
  } catch (error) {
    // Conjur returns structured validation errors for dry-run failures (422).
    if (error instanceof ApiError && error.status === 422) {
      const response = error.response as unknown;

      if (isPolicyDryRunMessageErrorResponse(response)) {
        throw new ApiError(response, error.status, response.error.message);
      }

      const policyError = (error as ApiError<PolicyErrorResponse>).response;

      throw new ApiError(policyError, error.status, "Dry run validation failed.");
    }

    throw error;
  }
}

async function runApplyPolicyLoad(
  path: string,
  policyContent: string,
  method: Extract<HttpMethod, "POST" | "PATCH" | "PUT">,
): Promise<PolicyLoadResponse> {
  try {
    const response = await requestPolicyLoad(path, policyContent, method, false);
    return toPolicyLoadResult(response);
  } catch (error) {
    if (error instanceof ApiError) {
      const response = (error as ApiError<PolicyApplyErrorResponse>).response;
      throw new ApiError(
        response,
        error.status,
        response.error.message ?? `Policy load failed (HTTP ${error.status}).`,
      );
    }

    throw error;
  }
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

    if (dryRun) {
      return runDryRunPolicyLoad(path, policyContent, method);
    }

    return runApplyPolicyLoad(path, policyContent, method);
  },
};
