import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (data: {
    name: string;
    email: string;
    company: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// OAuth API
export const oauthApi = {
  // Get LINE OAuth authorization URL
  getLineAuthUrl: async () => {
    const response = await api.get("/oauth/line/authorize");
    return response.data;
  },

  // Exchange LINE authorization code for tokens
  lineCallback: async (code: string, state?: string) => {
    const response = await api.post("/oauth/line/token", { code, state });
    return response.data;
  },

  // Get Google OAuth authorization URL (via Supabase)
  getGoogleAuthUrl: async () => {
    const response = await api.get("/oauth/google/authorize");
    return response.data;
  },

  // Exchange Supabase tokens for our tokens
  supabaseCallback: async (
    accessToken: string,
    refreshToken?: string,
    provider: "google" | "github" | "facebook" = "google"
  ) => {
    const response = await api.post("/oauth/supabase/callback", {
      access_token: accessToken,
      refresh_token: refreshToken,
      provider,
    });
    return response.data;
  },
};

// Chat API
export const chatApi = {
  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  },

  createConversation: async () => {
    const response = await api.post("/chat/conversations");
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  },

  deleteConversation: async (id: string) => {
    const response = await api.delete(`/chat/conversations/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getKPIs: async () => {
    const response = await api.get("/analytics/kpi");
    return response.data;
  },

  getReports: async () => {
    const response = await api.get("/analytics/reports");
    return response.data;
  },

  uploadData: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/analytics/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  query: async (query: string) => {
    const response = await api.post("/analytics/query", { query });
    return response.data;
  },
};

// Articles API
export interface ArticleListItem {
  id: string;
  title: string;
  original_url: string;
  source_platform: string;
  author: string | null;
  summary: string | null;
  tags: string[] | null;
  status: "pending" | "processing" | "completed" | "failed";
  published_at: string | null;
  created_at: string;
}

export interface ArticleListResponse {
  items: ArticleListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ArticleDetail extends ArticleListItem {
  original_content: string;
  rewritten_content: string | null;
  updated_at: string;
}

export interface SyncResponse {
  message: string;
  articles_scraped: number;
  articles_rewritten: number;
  errors: string[] | null;
}

export const articlesApi = {
  list: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    platform?: string;
  }): Promise<ArticleListResponse> => {
    const response = await api.get("/articles", { params });
    return response.data;
  },

  get: async (id: string): Promise<ArticleDetail> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  sync: async (params?: {
    platforms?: string[];
    limit_per_platform?: number;
  }): Promise<SyncResponse> => {
    const response = await api.post("/articles/sync", null, { params });
    return response.data;
  },

  rewrite: async (id: string): Promise<ArticleDetail> => {
    const response = await api.post(`/articles/${id}/rewrite`);
    return response.data;
  },
};

export default api;
