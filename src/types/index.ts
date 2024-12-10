// src/types/index.ts
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  }
  
  export interface FilterOptions {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, unknown>;
  }
  
  export interface DateRange {
    start: string;
    end: string;
  }
  
  export type Theme = 'light' | 'dark' | 'system';
  
  export interface AppConfig {
    theme: Theme;
    sidebarCollapsed: boolean;
    notifications: {
      enabled: boolean;
      desktop: boolean;
      sound: boolean;
    };
  }
  
  export type { 
    Tenant,
    Application,
    MetricData,
    AuditLog,
    CloudConfiguration,
    IdentityProvider,
    Role,
    NotificationConfig 
  } from '../mocks';