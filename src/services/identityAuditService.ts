// src/services/identityAuditService.ts

import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';
import { BaseEntity } from './mockDb/MockDatabase';
import { ApiServiceFactory } from './core/ApiServiceFactory';

// Update interfaces to extend BaseEntity
export interface IdentityAuditEvent extends BaseEntity {
    eventType: 'user.login' | 'user.logout' | 'user.created' | 'user.updated' | 'access_review.initiated';
    timestamp: string;
    actor: {
      id: string;
      name: string;
      type: 'user' | 'system' | 'api';
    };
    target: {
      id: string;
      type: 'user' | 'role' | 'permission' | 'api_key' | 'policy' | 'identity_provider';
      name: string;
    };
    action: string;
    status: 'success' | 'failure';
    metadata: {
      ip?: string;
      userAgent?: string;
      location?: string;
      reason?: string;
      changes?: Record<string, { old: any; new: any }>;
      sessionId?: string;
      initiatedBy?: 'manual' | 'automatic' | 'scheduled';
    };
    risk: {
      level: 'low' | 'medium' | 'high' | 'critical';
      factors?: string[];
    };
  }

export interface IdentityComplianceReport extends BaseEntity {
  type: 'access_review' | 'policy_compliance' | 'security_posture';
  timestamp: string;
  status: 'compliant' | 'non_compliant' | 'needs_review';
  findings: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
    affectedUsers: string[];
    status: 'open' | 'resolved' | 'accepted';
  }>;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    mfaEnabled: number;
    passwordPolicyCompliant: number;
    unusedAccounts: number;
    highRiskUsers: number;
  };
}

export interface AccessReview extends BaseEntity {
  userId: string;
  userName: string;
  reviewDate: string;
  reviewer: {
    id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'revoked';
  items: Array<{
    type: 'role' | 'permission' | 'api_key';
    name: string;
    decision: 'maintain' | 'revoke';
    reason?: string;
  }>;
}

export class IdentityAuditService extends BaseApiService {
  private readonly AUDIT_COLLECTION = 'identityAudit';
  private readonly COMPLIANCE_COLLECTION = 'identityCompliance';
  private readonly ACCESS_REVIEW_COLLECTION = 'accessReviews';

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }

  async getAuditEvents(filters?: {
    startDate?: string;
    endDate?: string;
    eventType?: string[];
    actor?: string;
    target?: string;
    riskLevel?: string[];
  }): Promise<ApiResponse<IdentityAuditEvent[]>> {
    const url = this.buildUrl('/identity-audit/events', filters);
    return this.request<IdentityAuditEvent[]>(url);
  }

  async getComplianceReports(): Promise<ApiResponse<IdentityComplianceReport[]>> {
    return this.request<IdentityComplianceReport[]>('/identity-audit/compliance');
  }
  
  // Define getAccessReviews method
  async getAccessReviews(): Promise<ApiResponse<AccessReview[]>> {
    return this.request<AccessReview[]>('/identity-audit/access-reviews');
  }

  async logAuditEvent(eventData: Omit<IdentityAuditEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<IdentityAuditEvent>> {
    return this.request<IdentityAuditEvent>('/identity-audit/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async generateComplianceReport(type: string): Promise<ApiResponse<IdentityComplianceReport>> {
    return this.request<IdentityComplianceReport>('/identity-audit/compliance/generate', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  protected async getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const generateMockAuditEvent = (type?: string): IdentityAuditEvent => ({
        id: generateId('audit-'),
        eventType: type as IdentityAuditEvent['eventType'] || 'user.login',
        timestamp: new Date().toISOString(),
        actor: {
          id: 'user-1',
          name: 'John Doe',
          type: 'user'
        },
        target: {
          id: 'user-2',
          type: 'user',
          name: 'Jane Smith'
        },
        action: 'User action performed',
        status: 'success',
        metadata: {
          ip: '192.168.1.1',
          location: 'New York, US',
          userAgent: 'Mozilla/5.0...',
          reason: 'Regular activity'
        },
        risk: {
          level: 'low',
          factors: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
  
      const generateMockComplianceReport = (type?: string): IdentityComplianceReport => ({
        id: generateId('compliance-'),
        type: type as IdentityComplianceReport['type'] || 'security_posture',
        timestamp: new Date().toISOString(),
        status: 'needs_review',
        findings: [
          {
            id: generateId('finding-'),
            severity: 'high',
            category: 'MFA Compliance',
            description: 'Users without MFA enabled',
            recommendation: 'Enable MFA for all users',
            affectedUsers: ['user-1', 'user-2'],
            status: 'open'
          },
          {
            id: generateId('finding-'),
            severity: 'medium',
            category: 'Password Policy',
            description: 'Users with weak passwords',
            recommendation: 'Update password policy',
            affectedUsers: ['user-3', 'user-4'],
            status: 'open'
          }
        ],
        metrics: {
          totalUsers: 100,
          activeUsers: 85,
          mfaEnabled: 75,
          passwordPolicyCompliant: 95,
          unusedAccounts: 5,
          highRiskUsers: 3
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
  
      const generateMockAccessReview = (): AccessReview => ({
        id: generateId('review-'),
        userId: generateId('user-'),
        userName: 'John Doe',
        reviewDate: new Date().toISOString(),
        reviewer: {
          id: generateId('reviewer-'),
          name: 'Admin User'
        },
        status: 'pending',
        items: [
          {
            type: 'role',
            name: 'Admin',
            decision: 'maintain'
          },
          {
            type: 'permission',
            name: 'manage_users',
            decision: 'maintain'
          },
          {
            type: 'api_key',
            name: 'Development API',
            decision: 'revoke',
            reason: 'No longer needed'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
  
      // Sample mock data arrays
      const mockAuditEvents = [
        generateMockAuditEvent('user.login'),
        generateMockAuditEvent('user.created'),
        generateMockAuditEvent('user.updated'),
        generateMockAuditEvent('access_review.initiated'),
        generateMockAuditEvent('user.logout')
      ];
  
      const mockComplianceReports = [
        generateMockComplianceReport('security_posture'),
        generateMockComplianceReport('access_review'),
        generateMockComplianceReport('policy_compliance')
      ];
  
      const mockAccessReviews = Array(3).fill(null).map(() => generateMockAccessReview());

      switch (true) {
        case endpoint.startsWith('/identity-audit/events'):
          if (method === 'GET') {
            return { data: mockAuditEvents as T };
          }
          if (method === 'POST') {
            const newEvent: IdentityAuditEvent = {
              ...data,
              id: generateId('audit-'),
              timestamp: data.timestamp || new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return { data: newEvent as T };
          }
          break;
  
        case endpoint.startsWith('/identity-audit/compliance'):
          if (endpoint.includes('/generate') && method === 'POST') {
            const newReport = generateMockComplianceReport(data.type);
            return { data: newReport as T };
          }
          if (method === 'GET') {
            return { data: mockComplianceReports as T };
          }
          break;
  
        case endpoint.startsWith('/identity-audit/access-reviews'):
          if (method === 'GET') {
            return { data: mockAccessReviews as T };
          }
          if (method === 'POST') {
            if (endpoint.includes('/complete')) {
              const reviewId = endpoint.split('/')[3];
              const review = mockAccessReviews.find(r => r.id === reviewId);
              if (!review) {
                throw new Error('Review not found');
              }
              return { 
                data: { 
                  ...review, 
                  status: 'approved',
                  updatedAt: new Date().toISOString() 
                } as T 
              };
            } else {
              return { 
                data: generateMockAccessReview() as T 
              };
            }
          }
          break;
  
        default:
          throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
      }
  
      throw new Error(`Unhandled case: ${method} ${endpoint}`);
    }
}
  

export const identityAuditService = ApiServiceFactory.createService(IdentityAuditService);