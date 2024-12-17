// src/types/feature.ts

export type FeatureEnvironment = 'development' | 'qa' | 'staging' | 'production';

export type FeatureType = 'release' | 'experiment' | 'operational' | 'permission';

export type FeatureStatus = 'active' | 'inactive' | 'scheduled' | 'archived';

export type RolloutStrategy = 'all' | 'percentage' | 'userGroup' | 'custom';

export interface FeatureRule {
  id: string;
  type: 'user' | 'group' | 'environment' | 'percentage' | 'custom';
  condition: {
    attribute?: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'greaterThan' | 'lessThan';
    value: any;
  };
  enabled: boolean;
}

export interface FeatureValue {
  id: string;
  environment: FeatureEnvironment;
  enabled: boolean;
  rolloutPercentage?: number;
  rules: FeatureRule[];
}

export interface Feature {
  id: string;
  name: string;
  key: string;
  description: string;
  type: FeatureType;
  status: FeatureStatus;
  environment: FeatureEnvironment; // Added environment property
  values: FeatureValue[];
  tags?: string[];
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  previousVersions: FeatureVersion[];
  metadata: Record<string, any>;
}

export interface FeatureVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: {
    key: string;
    previousValue: any;
    newValue: any;
  }[];
  commitMessage: string;
  status: FeatureStatus;
}

export interface FeatureAuditLogs {
  id: string;
  featureId: string;
  action: 'created' | 'updated' | 'deleted' | 'promoted' | 'rolled_back' | 'accessed';
  performedBy: string;
  timestamp: string;
  details: {
    environment?: FeatureEnvironment;
    version?: number;
    changes?: {
      key: string;
      oldValue?: any;
      newValue?: any;
    }[];
    metadata?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
}

export interface FeatureTemplate {
  id: string;
  name: string;
  description: string;
  type: FeatureType;
  defaultValues: FeatureValue[];
  validationRules?: {
    required?: string[];
    format?: Record<string, string>;
    range?: Record<string, { min?: number; max?: number }>;
  };
  metadata: Record<string, any>;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureComparison {
  id: string;
  timestamp: string;
  environment1: FeatureEnvironment;
  environment2: FeatureEnvironment;
  differences: {
    key: string;
    status: 'added' | 'removed' | 'modified';
    value1?: FeatureValue;
    value2?: FeatureValue;
  }[];
}

export interface FeaturePromotion {
  id: string;
  featureId: string;
  sourceEnvironment: FeatureEnvironment;
  targetEnvironment: FeatureEnvironment;
  promotedBy: string;
  promotedAt: string;
  status: 'pending' | 'inProgress' | 'completed' | 'failed';
  changes: {
    key: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
}

export interface FeatureExperiment {
  id: string;
  featureId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  variants: {
    id: string;
    name: string;
    description: string;
    allocation: number;
    isControl: boolean;
  }[];
  metrics: {
    id: string;
    name: string;
    type: 'conversion' | 'numeric' | 'duration';
    goal: number;
  }[];
  results?: {
    variantId: string;
    metrics: Record<string, number>;
    confidence: number;
  }[];
}

export interface FeatureMetrics {
  id: string;
  featureId: string;
  environment: FeatureEnvironment;
  timestamp: string;
  data: {
    evaluations: number;
    enabled: number;
    disabled: number;
    errors: number;
    latency: number;
  };
}