import { API_BASE_URL } from "../config";
import type { ConjurErrorResponse, ConjurV2ErrorResponse } from "../types";


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  query?: object;
  headers?: Record<string, string>;
  dryRun?: boolean;
  suppressUnauthorizedRedirect?: boolean;
}

interface JsonRequestOptions extends RequestOptions {
  body?: unknown;
}

interface TextRequestOptions extends RequestOptions {
  body?: string;
}

const ACCESS_TOKEN_STORAGE_KEY = "conjur.accessToken";

export class ApiError<T = unknown> extends Error {
  response: T;
  status: number;

  constructor(response: T, status: number, message?: string) {
    super(message);
    this.name = "ApiError";
    this.response = response;
    this.status = status;
  }
}

export function getConjurErrorMessage(
  response: ConjurErrorResponse | null | undefined,
): string | null {
  if (!response) {
    return null;
  }

  const envelopeMessage = response.error?.message;
  return typeof envelopeMessage === "string"
    ? envelopeMessage.trim() || null
    : null;
}

// Kept as a named export for v2 callers and hot-reloaded modules that still
// reference the earlier helper name.
export function getConjurV2ErrorMessage(
  response: ConjurV2ErrorResponse | null | undefined,
): string | null {
  const message = response?.message;
  return typeof message === "string" ? message.trim() || null : null;
}

export function getConjurApiErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) {
    return null;
  }

  const response = (error as ApiError<ConjurErrorResponse>).response;
  return getConjurErrorMessage(response);
}

function parseErrorResponse(message: string): unknown {
  if (!message) {
    return null;
  }

  try {
    return JSON.parse(message) as unknown;
  } catch {
    return message;
  }
}

async function throwApiError(path: string, response: Response): Promise<never> {
  const message = await response.text();
  const apiError = parseErrorResponse(message);
  const detail = response.statusText || "error";

  throw new ApiError(
    apiError,
    response.status,
    `${path} failed: ${response.status} ${detail}`,
  );
}

function buildUrl(path: string, query?: object) {
  const url = new URL(path, API_BASE_URL || window.location.origin);
  if (query) {
    Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

function handleUnauthorized(options: RequestOptions): never {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  if (!options.suppressUnauthorizedRedirect) {
    window.location.href = "/token-expired";
  }

  throw new Error("Unauthorized");
}

async function request(
  path: string,
  options: RequestOptions & { body?: BodyInit },
): Promise<Response> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim();

  return fetch(buildUrl(`/api${path}`, options.query), {
    method: options.method ?? "GET",
    headers: {
      ...(accessToken ? { Authorization: `Token token="${accessToken}"` } : {}),
      ...options.headers,
    },
    body: options.body,
  });
}

export async function apiRequestJson<T>(
  path: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const response = await request(path, {
    ...options,
    headers: {
      ...(options.body !== undefined && options.body !== null
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    body:
      options.body === undefined || options.body === null
        ? undefined
        : JSON.stringify(options.body),
  });

  if (response.status === 401) {
    handleUnauthorized(options);
  }

  if (!response.ok) {
    return await throwApiError(path, response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiRequestText(
  path: string,
  options: TextRequestOptions = {},
): Promise<string> {
  const response = await request(path, {
    ...options,
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "text/plain" } : {}),
      ...options.headers,
    },
    body: options.body,
  });

  if (response.status === 401) {
    handleUnauthorized(options);
  }

  if (!response.ok) {
    return await throwApiError(path, response);
  }

  if (response.status === 204) {
    return "";
  }

  return response.text();
}

// Backward-compatible alias for existing JSON callers.
export const apiRequest = apiRequestJson;
