// src/services/notificationService.ts
import { 
    NotificationRule, 
    NotificationEvent, 
    NotificationChannel,
    NotificationPriority,
    NotificationStatus 
  } from '../types/notifications';
  
  const mockNotificationRules: NotificationRule[] = [
    {
      id: 'rule-1',
      name: 'Deployment Notifications',
      description: 'Notify team about deployment status',
      channel: 'slack',
      priority: 'high',
      status: 'active',
      conditions: {
        events: ['deployment.started', 'deployment.completed', 'deployment.failed'],
        filters: {
          environment: ['production'],
          severity: ['high', 'critical']
        }
      },
      template: {
        body: '{{status}}: Deployment of {{service}} to {{environment}} {{result}}',
        variables: ['status', 'service', 'environment', 'result']
      },
      config: {
        slack: {
          channel: '#deployments',
          mentions: ['@devops']
        }
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'rule-2',
      name: 'Critical Error Alerts',
      description: 'Alert on critical system errors',
      channel: 'email',
      priority: 'critical',
      status: 'active',
      conditions: {
        events: ['error.critical', 'system.crash'],
        schedule: {
          blackoutPeriods: [
            {
              start: '2024-12-24T00:00:00Z',
              end: '2024-12-26T00:00:00Z',
              reason: 'Christmas Holiday'
            }
          ]
        }
      },
      template: {
        subject: 'Critical System Alert: {{error_type}}',
        body: 'A critical error occurred:\n\nError: {{error_message}}\nService: {{service}}\nTime: {{timestamp}}',
        variables: ['error_type', 'error_message', 'service', 'timestamp'],
        format: 'text'
      },
      config: {
        email: {
          recipients: ['team@example.com'],
          cc: ['management@example.com']
        }
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];
  
  const mockNotificationEvents: NotificationEvent[] = [
    {
      id: 'event-1',
      ruleId: 'rule-1',
      channel: 'slack',
      status: 'sent',
      priority: 'high',
      message: 'SUCCESS: Deployment of user-service to production completed successfully',
      recipientCount: 1,
      metadata: {
        source: 'deployment-service',
        triggeredBy: 'pipeline-1'
      },
      createdAt: '2024-03-15T10:30:00Z',
      sentAt: '2024-03-15T10:30:01Z'
    }
  ];
  
  export class NotificationService {
    private static instance: NotificationService;
    private rules: NotificationRule[] = mockNotificationRules;
    private events: NotificationEvent[] = mockNotificationEvents;
  
    private constructor() {}
  
    static getInstance(): NotificationService {
      if (!NotificationService.instance) {
        NotificationService.instance = new NotificationService();
      }
      return NotificationService.instance;
    }
  
    async getRules(): Promise<NotificationRule[]> {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.rules;
    }
  
    async getRule(id: string): Promise<NotificationRule | null> {
      await new Promise(resolve => setTimeout(resolve, 200));
      return this.rules.find(rule => rule.id === id) || null;
    }
  
    async createRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationRule> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newRule: NotificationRule = {
        id: `rule-${Date.now()}`,
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.rules.push(newRule);
      return newRule;
    }
  
    async updateRule(id: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const index = this.rules.findIndex(rule => rule.id === id);
      if (index === -1) throw new Error('Rule not found');
  
      const updatedRule = {
        ...this.rules[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.rules[index] = updatedRule;
      return updatedRule;
    }
  
    async deleteRule(id: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const index = this.rules.findIndex(rule => rule.id === id);
      if (index === -1) throw new Error('Rule not found');
      this.rules.splice(index, 1);
    }
  
    async getEvents(filters?: {
      ruleId?: string;
      status?: string;
      priority?: NotificationPriority;
      startDate?: string;
      endDate?: string;
    }): Promise<NotificationEvent[]> {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filteredEvents = [...this.events];
  
      if (filters) {
        if (filters.ruleId) {
          filteredEvents = filteredEvents.filter(event => event.ruleId === filters.ruleId);
        }
        if (filters.status) {
          filteredEvents = filteredEvents.filter(event => event.status === filters.status);
        }
        if (filters.priority) {
          filteredEvents = filteredEvents.filter(event => event.priority === filters.priority);
        }
        if (filters.startDate) {
          filteredEvents = filteredEvents.filter(event => event.createdAt >= filters.startDate!);
        }
        if (filters.endDate) {
          filteredEvents = filteredEvents.filter(event => event.createdAt <= filters.endDate!);
        }
      }
  
      return filteredEvents;
    }
  
    async testRule(rule: NotificationRule): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Simulate testing the notification rule
      const testEvent: NotificationEvent = {
        id: `test-${Date.now()}`,
        ruleId: rule.id,
        channel: rule.channel,
        status: 'sent',
        priority: rule.priority,
        subject: 'Test Notification',
        message: 'This is a test notification',
        recipientCount: 1,
        metadata: {
          source: 'notification-service',
          triggeredBy: 'test'
        },
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString()
      };
      this.events.push(testEvent);
      return true;
    }
  }
  
  export const notificationService = NotificationService.getInstance();