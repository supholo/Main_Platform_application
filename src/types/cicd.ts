// src/types/cicd.ts
export type PipelineStatus = 'running' | 'success' | 'failed' | 'cancelled' | 'pending';
export type EnvironmentType = 'development' | 'staging' | 'production';

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  provider: 'jenkins' | 'github' | 'gitlab' | 'azure' | 'aws';
  type: 'build' | 'deploy' | 'test' | 'release';
  configuration: {
    repository: string;
    branch: string;
    trigger: {
      type: 'push' | 'pull_request' | 'manual' | 'schedule';
      branches?: string[];
      schedule?: string;
    };
    environments: string[];
    steps: PipelineStep[];
    notifications?: {
      slack?: string;
      email?: string[];
      teams?: string;
    };
  };
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  type: 'script' | 'docker' | 'test' | 'deploy' | 'approval';
  configuration: {
    script?: string;
    image?: string;
    command?: string;
    environment?: Record<string, string>;
    artifacts?: {
      paths: string[];
      expiry?: string;
    };
    conditions?: {
      branches?: string[];
      environment?: string[];
      requiresApproval?: boolean;
    };
  };
  order: number;
  dependsOn?: string[];
  timeout?: number;
  retryStrategy?: {
    maxAttempts: number;
    interval: number;
  };
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  trigger: {
    type: 'manual' | 'automatic';
    source: string;
    user?: string;
  };
  status: PipelineStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  commit?: {
    hash: string;
    message: string;
    author: string;
  };
  steps: {
    id: string;
    name: string;
    status: PipelineStatus;
    startTime: string;
    endTime?: string;
    duration?: number;
    logs?: string[];
    artifacts?: {
      name: string;
      path: string;
      size: number;
    }[];
  }[];
  artifacts?: {
    name: string;
    path: string;
    size: number;
  }[];
  environment?: string;
}

export interface Environment {
  id: string;
  name: string;
  type: EnvironmentType;
  status: 'active' | 'inactive' | 'maintenance';
  variables: Record<string, string>;
  protection: {
    requiresApproval: boolean;
    approvers?: string[];
    restrictions?: {
      branches?: string[];
      time?: {
        start?: string;
        end?: string;
        timezone?: string;
      };
    };
  };
  deployments: {
    current?: {
      version: string;
      timestamp: string;
      status: 'stable' | 'unstable' | 'degraded';
    };
    history: {
      version: string;
      timestamp: string;
      status: 'success' | 'failed' | 'rolled-back';
    }[];
  };
}