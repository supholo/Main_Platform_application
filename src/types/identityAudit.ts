// src/types/identityAudit.ts

// src/constants/identityAudit.ts

export const IDENTITY_AUDIT_CONSTANTS = {
  ACTOR_TYPES: {
    USER: 'user',
    SYSTEM: 'system',
    API: 'api'
  } as const,

  TARGET_TYPES: {
    USER: 'user',
    ROLE: 'role',
    PERMISSION: 'permission',
    API_KEY: 'api_key',
    POLICY: 'policy',
    IDENTITY_PROVIDER: 'identity_provider'
  } as const,

  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  } as const,

  EVENT_STATUSES: {
    SUCCESS: 'success',
    FAILURE: 'failure'
  } as const,

  INITIATED_BY: {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    SCHEDULED: 'scheduled'
  } as const
} as const;

export type IdentityAuditEventType = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'user.logout'
  | 'user.password_changed'
  | 'user.mfa_enabled'
  | 'user.mfa_disabled'
  | 'user.locked'
  | 'user.unlocked'
  | 'role.assigned'
  | 'role.removed'
  | 'permission.granted'
  | 'permission.revoked'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'policy.violation'
  | 'identity_provider.configured'
  | 'identity_provider.updated'
  | 'access_review.initiated'
  | 'access_review.completed';

export interface IdentityAuditEvent {
  id?: string;
  eventType: IdentityAuditEventType;
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
    [key: string]: any;
  };
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors?: string[];
  };
}

export interface IdentityComplianceReport {
  id: string;
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

export interface AccessReview {
  id: string;
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