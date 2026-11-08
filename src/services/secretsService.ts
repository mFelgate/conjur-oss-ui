import { ApiError, apiRequestText, getConjurErrorMessage } from "./apiClient";
import type { ConjurErrorResponse } from "../types";
import {CONJUR_ACCOUNT} from "../config";
const RootPath = `/secrets/${encodeURIComponent(CONJUR_ACCOUNT)}`;

function throwSecretError(error: unknown, fallbackMessage: string): never {
  if (error instanceof ApiError) {
    const response = (error as ApiError<ConjurErrorResponse>).response;
    throw new Error(getConjurErrorMessage(response) ?? fallbackMessage);
  }

  throw error instanceof Error ? error : new Error(fallbackMessage);
}

export const secretsService = {
  async get(kind: string, identifier: string) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText(path).catch((error) =>
      throwSecretError(error, "Failed to load secret."),
    );
  },
  set(kind: string, identifier: string, value: string) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText(path, {
      method: "POST",
      body: value,
    }).catch((error) =>
      throwSecretError(error, "Failed to update secret."),
    );
  }
};
