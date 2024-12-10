// src/services/mockData.ts
import { generateId } from '../lib/utils';

export interface MockTenant {
  id: string;
  name: string;
  domain: string;
  industry: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'expired';
    startDate: string;
    endDate: string;
  };
}

export interface MockUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export interface MockApplication {
  id: string;
  tenantId: string;
  name: string;
  type: 'microservice' | 'webapp' | 'api';
  status: 'running' | 'stopped' | 'error';
  environment: 'development' | 'staging' | 'production';
  version: string;
  repository: string;
  lastDeployment: {
    id: string;
    status: 'success' | 'failed';
    timestamp: string;
    version: string;
  };
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

export interface MockMetric {
  id: string;
  applicationId: string;
  timestamp: string;
  type: 'cpu' | 'memory' | 'disk' | 'network';
  value: number;
  unit: string;
}

export interface MockAuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  details: string;
  status: 'success' | 'failure';
  metadata: Record<string, any>;
}

export interface MockRole {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface MockNotificationChannel {
  id: string;
  tenantId: string;
  type: 'email' | 'slack' | 'webhook';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  events: string[];
}

// Generate mock data
export const generateMockData = () => {
  const tenants: MockTenant[] = [
    {
      id: 'tenant-1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      industry: 'technology',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      owner: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@acme.com'
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      }
    },
    // Add more tenants...
  ];

  const users: MockUser[] = [
    {
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'john@acme.com',
      name: 'John Doe',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-03-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    // Add more users...
  ];

  const applications: MockApplication[] = [
    {
      id: 'app-1',
      tenantId: 'tenant-1',
      name: 'User Service',
      type: 'microservice',
      status: 'running',
      environment: 'production',
      version: '1.2.0',
      repository: 'https://github.com/acme/user-service',
      lastDeployment: {
        id: 'deploy-1',
        status: 'success',
        timestamp: '2024-03-15T08:00:00Z',
        version: '1.2.0'
      },
      metrics: {
        cpu: 45.5,
        memory: 78.2,
        requests: 1250,
        errors: 2
      }
    },
    // Add more applications...
  ];

  const generateMetrics = (applicationId: string, count: number): MockMetric[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `metric-${i}`,
      applicationId,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      type: 'cpu',
      value: Math.random() * 100,
      unit: 'percent'
    }));
  };

  const metrics: MockMetric[] = applications.flatMap(app => 
    generateMetrics(app.id, 60)
  );

  const auditLogs: MockAuditLog[] = [
    {
      id: 'audit-1',
      tenantId: 'tenant-1',
      timestamp: '2024-03-15T10:30:00Z',
      actor: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@acme.com'
      },
      action: 'DEPLOYMENT',
      resource: 'user-service',
      details: 'Deployed version 1.2.0',
      status: 'success',
      metadata: {
        version: '1.2.0',
        environment: 'production'
      }
    },
    // Add more audit logs...
  ];

  const roles: MockRole[] = [
    {
      id: 'role-1',
      tenantId: 'tenant-1',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['all'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    // Add more roles...
  ];

  const permissions: MockPermission[] = [
    {
      id: 'perm-users-read',
      name: 'Read Users',
      description: 'View user information',
      category: 'User Management'
    },
    // Add more permissions...
  ];

  const notificationChannels: MockNotificationChannel[] = [
    {
      id: 'channel-1',
      tenantId: 'tenant-1',
      type: 'slack',
      name: 'Development Team',
      enabled: true,
      config: {
        webhookUrl: 'https://hooks.slack.com/services/xxx',
        channel: '#deployments'
      },
      events: ['deployment.success', 'deployment.failure']
    },
    // Add more notification channels...
  ];

  return {
    tenants,
    users,
    applications,
    metrics,
    auditLogs,
    roles,
    permissions,
    notificationChannels
  };
};

export const mockData = generateMockData();