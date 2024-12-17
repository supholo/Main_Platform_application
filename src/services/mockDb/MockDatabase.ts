// src/services/mockDb/MockDatabase.ts
export type CollectionName =
  | "roles"
  | "permissions"
  | "applications"
  | "metrics"
  | "auditLogs"
  | "notifications"
  | "users"
  | "environments"
  | "pipelines"
  | "identityProviders" // Make sure this is included
  | "identityAudit" // Make sure this is included
  | "deployments"
  | "securityMetrics" // Add this
  | "accessLogs" // Add this
  | "securityAlerts" // Add this;
  | "businessMetrics" // Add this;
  | "complianceStatus" // Add this;
  | "vendorRisks" // Add this;
  | "configurations" // Add this;
  | "configurationAudits" // Add this;
  | "configurationTemplates" // Add this;
  | "configurationApprovals" // Add this;
  | "configurationPromotions" // Add this;
  | 'features'                   // Added new collections
  | 'featureAudits'
  | 'featureTemplates'
  | 'featureExperiments'
  | 'featureMetrics'
  | 'featurePromotions'
  | "threatIndicators"; // Add this;

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow additional properties
}

export class MockDatabase {
  private static instance: MockDatabase;
  private store: Map<CollectionName, Map<string, any>>;
  private latency: number = 300;

  private constructor() {
    this.store = new Map();
    this.initializeCollections();
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  setLatency(ms: number): void {
    this.latency = ms;
  }

  private initializeCollections() {
    const collections: CollectionName[] = [
      "roles",
      "permissions",
      "applications",
      "metrics",
      "auditLogs",
      "notifications",
      "users",
      "environments",
      "pipelines",
      "identityProviders", // Added this line
      "identityAudit",
      "deployments",
      "securityMetrics", // Add this
      "accessLogs", // Add this
      "securityAlerts", // Add this
      "businessMetrics",
      "complianceStatus",
      "vendorRisks",
      "threatIndicators",
      "configurations",
      "configurationAudits",
      "configurationTemplates",
      "configurationApprovals",
      "configurationPromotions",
      "features",
      "featureAudits",
      "featureTemplates",
      "featureExperiments",
      "featureMetrics",
      "featurePromotions",
    ];

    collections.forEach((collection) => {
      this.store.set(collection, new Map());
    });
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latency));
  }

  async find<T extends BaseEntity>(
    collection: CollectionName,
    query?: Partial<T>
  ): Promise<T[]> {
    await this.delay();
    let results = Array.from(this.store.get(collection)?.values() || []) as T[];

    if (query) {
      results = results.filter((item) =>
        Object.entries(query).every(([key, value]) => {
          if (value === undefined) return true;
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(item[key]) === JSON.stringify(value);
          }
          return item[key] === value;
        })
      );
    }

    return results;
  }

  async findById<T extends BaseEntity>(
    collection: CollectionName,
    id: string
  ): Promise<T | null> {
    await this.delay();
    return (this.store.get(collection)?.get(id) || null) as T | null;
  }

  async create<T extends BaseEntity>(
    collection: CollectionName,
    data: T
  ): Promise<T> {
    await this.delay();
    const collectionMap = this.store.get(collection);
    if (!collectionMap) {
      throw new Error(`Collection ${collection} not found`);
    }

    const timestamp = new Date().toISOString();
    const newData = {
      ...data,
      createdAt: data.createdAt || timestamp,
      updatedAt: data.updatedAt || timestamp,
    };

    collectionMap.set(data.id, newData);
    return newData;
  }

  async update<T extends BaseEntity>(
    collection: CollectionName,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    await this.delay();
    const collectionMap = this.store.get(collection);
    if (!collectionMap) {
      throw new Error(`Collection ${collection} not found`);
    }

    const existing = collectionMap.get(id);
    if (!existing) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    collectionMap.set(id, updated);
    return updated as T;
  }

  async delete(collection: CollectionName, id: string): Promise<void> {
    await this.delay();
    const collectionMap = this.store.get(collection);
    if (!collectionMap?.has(id)) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    collectionMap.delete(id);
  }

  async seed<T extends BaseEntity>(
    collection: CollectionName,
    data: T[]
  ): Promise<void> {
    const collectionMap = this.store.get(collection);
    if (!collectionMap) {
      throw new Error(`Collection ${collection} not found`);
    }

    // Clear existing data
    collectionMap.clear();

    // Add new data with timestamps if not present
    const timestamp = new Date().toISOString();
    data.forEach((item) => {
      const itemWithTimestamps = {
        ...item,
        createdAt: item.createdAt || timestamp,
        updatedAt: item.updatedAt || timestamp,
      };
      collectionMap.set(item.id, itemWithTimestamps);
    });
  }

  async clear(collection?: CollectionName): Promise<void> {
    if (collection) {
      this.store.get(collection)?.clear();
    } else {
      this.store.forEach((map) => map.clear());
    }
  }
}

export const mockDb = MockDatabase.getInstance();
