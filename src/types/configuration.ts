// src/types/configuration.ts

export type ConfigurationEnvironment = 'development' | 'staging' | 'qa' | 'production';
export type ConfigurationStatus = 'active' | 'inactive' | 'pending' | 'archived';
export type ConfigurationType = 'application' | 'environment' | 'feature' | 'security' | 'integration';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PromotionStatus = 'eligible' | 'inProgress' | 'completed' | 'failed';
export type ConfigurationValueType = 'string' | 'number' | 'boolean' | 'json';
export type DependencyType = 'requires' | 'conflicts' | 'recommends';

export interface ConfigurationValue {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: ConfigurationValueType;
  isEncrypted: boolean;
  isSecret: boolean;
}



// Add type for the editing template state
export interface EditingTemplate extends Omit<ConfigurationTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  defaultValues: ConfigurationValue[];
}

export interface ConfigurationValue {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'json';
  isEncrypted: boolean;
  isSecret: boolean;
}

export interface ConfigurationVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: {
    key: string;
    previousValue: ConfigurationValue;
    newValue: ConfigurationValue;
  }[];
  commitMessage: string;
  status: ConfigurationStatus;
}

export interface ConfigurationApproval {
  id: string;
  configurationId: string;
  version: number;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: ApprovalStatus;
  comments: string[];
}

export interface ConfigurationPromotion {
  id: string;
  configurationId: string;
  sourceEnvironment: ConfigurationEnvironment;
  targetEnvironment: ConfigurationEnvironment;
  version: number;
  promotedBy: string;
  promotedAt: string;
  status: PromotionStatus;
  validationResults?: {
    passed: boolean;
    checks: {
      name: string;
      status: 'passed' | 'failed';
      message?: string;
    }[];
  };
}

export interface ConfigurationDependency {
  id: string;
  configurationId: string;
  dependsOn: string;
  type: 'requires' | 'conflicts' | 'recommends';
  constraint?: string;
}

export interface ConfigurationAuditLog {
  id: string;
  configurationId: string;  // Make this required
  action: 'created' | 'updated' | 'deleted' | 'promoted' | 'rolled_back' | 'accessed';  // Make this required
  performedBy: string;  // Make this required
  timestamp: string;
  details?: {
    environment?: ConfigurationEnvironment;
    version?: number;
    changes?: {
      key: string;
      oldValue?: string;
      newValue?: string;
    }[];
    metadata?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  type: ConfigurationType;
  environment: ConfigurationEnvironment;
  values: ConfigurationValue[];
  tags: string[];
  status: ConfigurationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  previousVersions: ConfigurationVersion[];
  dependencies: ConfigurationDependency[];
  approvals: ConfigurationApproval[];
  promotions: ConfigurationPromotion[];
  metadata: {
    isTemplate?: boolean;
    template?: string;
    category?: string;
    priority?: number;
    expiresAt?: string;
    customFields?: Record<string, any>;
  };
  validationRules?: {
    required?: string[];
    format?: Record<string, string>;
    range?: Record<string, { min?: number; max?: number }>;
    custom?: Record<string, string>;
  };
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// Template Types
export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  type: ConfigurationType;
  defaultValues: ConfigurationValue[]; // Not Partial anymore
  validationRules: {
    required: string[];
    format: Record<string, string>;
    range: Record<string, { min?: number; max?: number }>;
  };
  metadata: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string; // Added this field
}

// Comparison Types
export interface ConfigurationComparison {
  environment1: ConfigurationEnvironment;
  environment2: ConfigurationEnvironment;
  differences: {
    key: string;
    value1?: ConfigurationValue;
    value2?: ConfigurationValue;
    status: 'added' | 'removed' | 'modified';
  }[];
  timestamp: string;
}