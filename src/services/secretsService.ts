import { apiRequest, apiRequestText } from "./apiClient";
import type {
  ApiListResponse,
  ListSecretsRequest,
  SecretRecord,
} from "../types";
import {CONJUR_ACCOUNT} from "../config";
const RootPath = `/secrets/${encodeURIComponent(CONJUR_ACCOUNT)}`;

export const secretsService = {
  get(kind, identifier) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText<ApiListResponse<SecretRecord>>(path);
  },
  async set(kind, identifier, value) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText<ApiListResponse<SecretRecord>>(path, {
      method: "POST",
      body: value
    });
  }
};
