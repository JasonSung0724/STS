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

export default api;
