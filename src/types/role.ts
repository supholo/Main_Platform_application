// src/types/role.ts
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies?: string[];
  type: 'system' | 'custom';
  scope?: string[];
  risk: 'low' | 'medium' | 'high';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: string[];
  metadata?: {
    allowDelegation?: boolean;
    maxDelegationDepth?: number;
    expirationDate?: string;
    customFields?: Record<string, any>;
  };
  userCount: number;
  status: 'active' | 'inactive' | 'deprecated';
  inheritedFrom?: string[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  lastReviewedAt?: string;
  lastReviewedBy?: string;
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