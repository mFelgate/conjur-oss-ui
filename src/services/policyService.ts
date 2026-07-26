import { apiRequestTextFullResponse, apiRequestText } from "./apiClient";
import type {
  ApiListResponse,
  ListPolicyRequest,
  PolicyRecord,
} from "../types";
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
    method: string,
    dryRun: boolean = true,
  ) {
    const path = `${RootPath}/${encodeURIComponent(branch)}`;

    const response = await apiRequestTextFullResponse(path, {
      method: method,
      query: {
        dryRun: dryRun,
      },
       headers: {
        accept: "text/plain",
      },
      body: policyContent,
    });

    return { status: response.status, data: JSON.parse(response.data) as PolicyLoadResponse };
  },

  
};
