// ChatKit 配置

// API 端點配置
export const CHATKIT_CONFIG = {
  // 後端 API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  // ChatKit 會話端點
  sessionEndpoint: "/api/v1/chatkit/session",

  // ChatKit 樣式配置
  styles: {
    // 容器高度
    height: "100%",
    // 容器寬度
    width: "100%",
  },
};

// 獲取 ChatKit client secret
export async function getClientSecret(existingSecret?: string): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // 如果有現有的 secret，檢查是否需要刷新
  if (existingSecret) {
    // 可以在這裡實作 token 刷新邏輯
    // 暫時返回現有的 secret
    return existingSecret;
  }

  try {
    const response = await fetch(`${CHATKIT_CONFIG.apiUrl}${CHATKIT_CONFIG.sessionEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create ChatKit session");
    }

    const data = await response.json();
    return data.client_secret;
  } catch (error) {
    console.error("ChatKit session error:", error);
    throw error;
  }
}
