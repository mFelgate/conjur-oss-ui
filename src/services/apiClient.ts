import { API_BASE_URL } from "../config";


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  query?: object;
  headers?: Record<string, string>;
  dryRun?: boolean;
  suppressUnauthorizedRedirect?: boolean;
}

export interface PolicyErrorResponse {
  status: string;
  errors: PolicyError[];
}

export interface PolicyError {
  line: number;
  column: number;
  message: string;
  context: PolicyErrorContext;
}

export interface PolicyErrorContext {
  policy_id: string;
  offending_lines: number[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    target: string;
    details: {
      code: string;
      target: string;
      message: string;
    };
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
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!options.suppressUnauthorizedRedirect) {
        window.location.href = "/token-expired";
      }
      return Promise.reject(new Error("Unauthorized"));
    }

    if (!response.ok) {
      const message = await response.text();
      const apiError = JSON.parse(message) as ApiErrorResponse;
      throw new ApiError(apiError, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      console.error("API request error:", error);
      throw new Error(`API request failed for ${path}: ${error.message}`);
    }

    throw new Error(`API request failed for ${path}`);
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
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!options.suppressUnauthorizedRedirect) {
        window.location.href = "/token-expired";
      }
      return Promise.reject(new Error("Unauthorized"));
    }

    if (!response.ok) {
      const message = await response.text();
      let apiError: ApiErrorResponse | string = message;

      try {
        apiError = JSON.parse(message) as ApiErrorResponse;
      } catch {
        // keep plain text fallback
      }

      throw new ApiError(apiError, response.status);
    }

    if (response.status === 204) {
      return "";
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`API request failed for ${path}: ${error.message}`);
    }

    throw new Error(`API request failed for ${path}`);
  }
}

export async function apiRequestTextFullResponse(
  path: string,
  options: TextRequestOptions = {},
): Promise<{ status: number; data: string }> {
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
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!options.suppressUnauthorizedRedirect) {
        window.location.href = "/token-expired";
      }
      return Promise.reject(new Error("Unauthorized"));
    }

    if (!response.ok) {
      const message = await response.text();
      if (options.dryRun && response.status === 422) {
        const apiError = JSON.parse(message) as PolicyErrorResponse;
        throw new ApiError(apiError, response.status);
      }

      const apiError = JSON.parse(message) as ApiErrorResponse;
      throw new ApiError(
        apiError,
        response.status,
        `API request failed for ${path}: ${response.statusText}`,
      );
    }

    if (response.status === 204) {
      return { status: 204, data: "" };
    }

    return { status: response.status, data: await response.text() };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`API request failed for ${path}: ${error.message}`);
    }

    throw new Error(`API request failed for ${path}`);
  }
}

// Backward-compatible alias for existing JSON callers.
export const apiRequest = apiRequestJson;
