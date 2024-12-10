// src/services/mockDb/types.ts
export type CollectionName = 
  | 'pipelines'
  | 'environments'
  | 'roles'
  | 'permissions'
  | 'users'
  | 'identityProviders' // Ensure this matches exactly
  | 'auditLogs'
  | 'applications'
  | 'notifications';

export interface MockDbRecord {
  id: string;
  [key: string]: any;
}

export interface MockCollection<T extends MockDbRecord = MockDbRecord> {
  name: CollectionName;
  data: T[];
}

export interface MockDatabase {
  collections: Map<CollectionName, MockCollection>;
}

export interface MockDbOptions {
  autoIncrement?: boolean;
  timestamps?: boolean;
}

export interface MockDbQueryOptions {
  limit?: number;
  offset?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface MockDbUpdateOptions {
  upsert?: boolean;
}

export class MockDbError extends Error {
  constructor(
    message: string,
    public code: string,
    public collection?: CollectionName
  ) {
    super(message);
    this.name = 'MockDbError';
  }
}

export interface MockDbIndexConfig {
  fields: string[];
  unique?: boolean;
}

export interface MockDbCollectionConfig {
  name: CollectionName;
  indexes?: MockDbIndexConfig[];
  options?: MockDbOptions;
}

// Type guards
export function isMockDbRecord(value: any): value is MockDbRecord {
  return value && typeof value === 'object' && typeof value.id === 'string';
}

export function isCollectionName(value: string): value is CollectionName {
  const validCollections: CollectionName[] = [
    'pipelines',
    'environments',
    'roles',
    'permissions',
    'users',
    'identityProviders',
    'auditLogs',
    'applications',
    'notifications'
  ];
  return validCollections.includes(value as CollectionName);
}