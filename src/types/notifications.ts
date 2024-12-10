// src/types/notifications.ts
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'inapp';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'active' | 'inactive' | 'testing';

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  conditions: {
    events: string[];
    filters?: {
      environment?: string[];
      severity?: string[];
      source?: string[];
    };
    schedule?: {
      start?: string;
      end?: string;
      timezone?: string;
      blackoutPeriods?: Array<{
        start: string;
        end: string;
        reason?: string;
      }>;
    };
  };
  template: {
    subject?: string;
    body: string;
    variables?: string[];
    format?: 'text' | 'html' | 'markdown';
  };
  config: {
    email?: {
      recipients: string[];
      cc?: string[];
      bcc?: string[];
    };
    slack?: {
      channel: string;
      webhook?: string;
      mentions?: string[];
    };
    webhook?: {
      url: string;
      method: 'POST' | 'PUT';
      headers?: Record<string, string>;
      retry?: {
        maxAttempts: number;
        backoff: number;
      };
    };
    inapp?: {
      roles?: string[];
      expiry?: number;
      actions?: Array<{
        label: string;
        url?: string;
        action?: string;
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

export interface NotificationEvent {
  id: string;
  ruleId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  priority: NotificationPriority;
  subject?: string;
  message: string;
  recipientCount: number;
  metadata: {
    source: string;
    triggeredBy?: string;
    error?: string;
    retryCount?: number;
  };
  createdAt: string;
  sentAt?: string;
}