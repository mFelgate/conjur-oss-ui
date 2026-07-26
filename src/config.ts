// config.ts
const viteEnv = (import.meta as { env?: Record<string, string> }).env;

export const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? "";
export const CONJUR_ACCOUNT = viteEnv?.VITE_CONJUR_ACCOUNT ?? "";