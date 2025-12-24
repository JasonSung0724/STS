// ChatKit 配置

// API 端點配置
export const CHATKIT_CONFIG = {
  // 後端 API URL (self-hosted mode)
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  // ChatKit 端點 (for self-hosted mode)
  endpoint: "/api/v1/chatkit",

  // Domain key for self-hosted mode (can be any string for local dev)
  domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || "local-dev",

  // ChatKit 樣式配置
  styles: {
    // 容器高度
    height: "100%",
    // 容器寬度
    width: "100%",
  },
};

// Get the full ChatKit API URL for self-hosted mode
export function getChatKitApiUrl(): string {
  return `${CHATKIT_CONFIG.apiUrl}${CHATKIT_CONFIG.endpoint}`;
}

// Get the ChatKit API config for self-hosted mode
export function getChatKitApiConfig() {
  return {
    url: getChatKitApiUrl(),
    domainKey: CHATKIT_CONFIG.domainKey,
  };
}

// Get auth token for API requests
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}
