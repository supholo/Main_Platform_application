// src/services/core/BaseApiService.ts
import { ApiConfig, ApiResponse, ApiError } from './types';

export abstract class BaseApiService {
  protected config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Check if mock mode is enabled
    if (this.config.useMock) {
      return this.getMockResponse<T>(
        endpoint,
        options.method || 'GET',
        options.body ? JSON.parse(options.body as string) : undefined
      );
    }

    // Real API call
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }
      }
      throw this.handleError(error);
    }
  }

  protected abstract getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>>;

  protected handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.details
    };
    
    return new Error(apiError.message);
  }

}