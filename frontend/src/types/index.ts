// User types
export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  company: string;
  password: string;
}

// Chat types
export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: {
    toolCalls?: ToolCall[];
    thinking?: string;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  category: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: "revenue" | "cost" | "customer" | "performance";
  data: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsQuery {
  query: string;
}

export interface AnalyticsQueryResponse {
  answer: string;
  data?: Record<string, unknown>;
  charts?: ChartConfig[];
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "area";
  title: string;
  data: unknown[];
  xKey: string;
  yKeys: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
