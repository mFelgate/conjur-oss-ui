import { apiRequestText } from "./apiClient";
import {CONJUR_ACCOUNT} from "../config";
const RootPath = `/secrets/${encodeURIComponent(CONJUR_ACCOUNT)}`;

export const secretsService = {
  get(kind: string, identifier: string) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText(path);
  },
  async set(kind: string, identifier: string, value: string) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`;
    return apiRequestText(path, {
      method: "POST",
      body: value
    });
  }
};
