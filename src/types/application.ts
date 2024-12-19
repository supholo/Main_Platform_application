// src/types/application.ts

export type ApplicationEnvironment = 'development' | 'staging' | 'qa' | 'production';

export type ApplicationStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export type IntegrationType = 'cicd' | 'logging' | 'metrics' | 'configuration' | 'notifications';

export interface ApplicationMetrics {
  cpu: number;
  memory: number;
  requestLatency: number;
  errorRate: number;
  uptime: number;
}

export interface ApplicationLog {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  service: string;
  metadata: Record<string, any>;
}

export interface CiCdConfig {
  provider: 'jenkins' | 'github' | 'gitlab' | 'azure';
  repository: string;
  branch: string;
  triggers: {
    onPush: boolean;
    onPullRequest: boolean;
    onMerge: boolean;
    schedules: string[];
  };
  buildConfiguration: Record<string, any>;
}

export interface LoggingConfig {
  provider: 'elk' | 'loki' | 'cloudwatch';
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  structuredLogging: boolean;
  retentionDays: number;
  filters: string[];
}

export interface MetricsConfig {
  provider: 'prometheus' | 'grafana' | 'datadog';
  scrapeInterval: number;
  retentionDays: number;
  dashboards: {
    id: string;
    name: string;
    panels: any[];
  }[];
}

export interface NotificationConfig {
  channels: {
    type: 'slack' | 'teams' | 'email';
    endpoint: string;
    events: string[];
  }[];
}

export interface ApplicationIntegration {
  id: string;
  applicationId: string;
  type: IntegrationType;
  status: 'active' | 'inactive' | 'error';
  config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  status: ApplicationStatus;
  version: string;
  environments: ApplicationEnvironment[];
  repository?: string;
  integrations: ApplicationIntegration[];
  metrics?: ApplicationMetrics;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ApplicationOnboarding {
  id: string;
  applicationId: string;
  step: number;
  completed: boolean;
  application: Partial<Application>;
  integrations: {
    [key in IntegrationType]?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}