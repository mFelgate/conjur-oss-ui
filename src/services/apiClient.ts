import { API_BASE_URL } from "../config";


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  query?: object;
  headers?: Record<string, string>;
  dryRun?: boolean;
  suppressUnauthorizedRedirect?: boolean;
}

export interface ApiErrorResponse {
  error: {
    code?: string | number;
    message?: string;
    target?: string;
    details?:
      | {
          code?: string | number;
          target?: string;
          message?: string;
        }
      | Array<{
          code?: string | number;
          target?: string;
          message?: string;
        }>;
  };
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

function getDetailFromParsedResponse(response: unknown): string | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const responseRecord = response as Record<string, unknown>;
  const message = responseRecord.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const error = responseRecord.error;
  if (!error || typeof error !== "object") {
    return null;
  }

  const errorMessage = (error as Record<string, unknown>).message;
  if (typeof errorMessage === "string" && errorMessage.trim()) {
    return errorMessage;
  }

  return null;
}

function apiErrorFromResponse(
  message: string,
  status: number,
  statusText: string,
): { response: unknown; detail: string } {
  try {
    const response = JSON.parse(message) as unknown;
    const detailFromPayload = getDetailFromParsedResponse(response);

    return {
      response,
      detail: detailFromPayload || message || `${status} ${statusText || "error"}`,
    };
  } catch {
    const detail = message || `${status} ${statusText || "error"}`;
    return {
      response: {
        error: {
          code: String(status),
          message: detail,
          target: "",
          details: { code: "", target: "", message: detail },
        },
      },
      detail,
    };
  }
}

async function throwApiError(path: string, response: Response): Promise<never> {
  const message = await response.text();
  const { response: apiError, detail } = apiErrorFromResponse(
    message,
    response.status,
    response.statusText,
  );

  throw new ApiError(
    apiError,
    response.status,
    `${path} failed: ${response.status} ${detail}`,
  );
}

function rethrowRequestError(path: string, error: unknown, log: boolean = false): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new Error(`API request failed for ${path}: ${error.message}`);
  }

  throw new Error(`API request failed for ${path}`);
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
  try {
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
  } catch (error) {
    rethrowRequestError(path, error, true);
  }
}

export async function apiRequestText(
  path: string,
  options: TextRequestOptions = {},
): Promise<string> {
  try {
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
  } catch (error) {
    rethrowRequestError(path, error);
  }
}

// Backward-compatible alias for existing JSON callers.
export const apiRequest = apiRequestJson;
