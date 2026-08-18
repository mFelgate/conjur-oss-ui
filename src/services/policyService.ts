import { apiRequestTextFullResponse, apiRequestText } from "./apiClient";
import type { HttpMethod } from "./apiClient";
import type { PolicyLoadResponse } from "../types";
import { CONJUR_ACCOUNT } from "../config";

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

    const response = await apiRequestTextFullResponse(path, {
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
      status: response.status,
      data: JSON.parse(response.data) as PolicyLoadResponse,
    };
  },
};
