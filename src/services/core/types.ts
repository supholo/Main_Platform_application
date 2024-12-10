// src/services/core/types.ts
export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}