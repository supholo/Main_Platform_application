// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'viewer';
    tenantId?: string;
    permissions: string[];
    metadata?: {
      lastLogin?: string;
      failedLoginAttempts?: number;
      mfaEnabled?: boolean;
      preferences?: {
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        notifications?: {
          email?: boolean;
          push?: boolean;
          inApp?: boolean;
        };
      };
    };
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthToken {
    token: string;
    refreshToken: string;
    expiresAt: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    tenantId?: string;
    mfaCode?: string;
  }
  
  export interface AuthError {
    code: string;
    message: string;
    details?: Record<string, any>;
  }