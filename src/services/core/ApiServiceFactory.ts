// src/services/core/ApiServiceFactory.ts
import { BaseApiService } from './BaseApiService';
import { ApiConfig } from './types';
import { mockDb } from '../mockDb/MockDatabase';

export class ApiServiceFactory {
  private static config: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    useMock: import.meta.env.VITE_USE_MOCK === 'true',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    headers: {}
  };

  static initialize() {
    // Set mock database latency if specified
    if (this.config.useMock && import.meta.env.VITE_MOCK_LATENCY) {
      mockDb.setLatency(parseInt(import.meta.env.VITE_MOCK_LATENCY));
    }

    // Add default headers
    this.config.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Version': import.meta.env.VITE_API_VERSION || '1.0',
      ...this.config.headers
    };

    // Add environment-specific configurations
    if (import.meta.env.VITE_ENV !== 'production') {
      console.log('API Configuration:', {
        useMock: this.config.useMock,
        baseUrl: this.config.baseUrl,
        environment: import.meta.env.VITE_ENV
      });
    }
  }

  static setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): ApiConfig {
    return { ...this.config };
  }

  static createService<T extends BaseApiService>(
    ServiceClass: new (config: ApiConfig) => T
  ): T {
    return new ServiceClass(this.config);
  }

  static isMockMode(): boolean {
    return this.config.useMock;
  }
}