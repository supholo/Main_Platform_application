// src/services/featureService.ts

import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';
import { ApiServiceFactory } from './core/ApiServiceFactory';
import { CollectionName } from './mockDb/types';
import {
  Feature,
  FeatureAuditLogs,
  FeatureTemplate,
  FeatureComparison,
  FeatureEnvironment,
  FeatureVersion,
  FeatureValue,
  FeaturePromotion,
  FeatureExperiment,
  FeatureMetrics
} from '../types/feature';

export class FeatureService extends BaseApiService {
  private initialized = false;
  private readonly FEATURE_COLLECTION = 'features' as CollectionName;
  private readonly AUDIT_COLLECTION = 'featureAudits' as CollectionName;
  private readonly TEMPLATE_COLLECTION = 'featureTemplates' as CollectionName;
  private readonly EXPERIMENT_COLLECTION = 'featureExperiments' as CollectionName;
  private readonly METRICS_COLLECTION = 'featureMetrics' as CollectionName;
  private readonly PROMOTION_COLLECTION = 'featurePromotions' as CollectionName;

  private async ensureCollectionsExist() {
    const collections = [
      this.FEATURE_COLLECTION,
      this.AUDIT_COLLECTION,
      this.TEMPLATE_COLLECTION,
      this.EXPERIMENT_COLLECTION,
      this.METRICS_COLLECTION,
      this.PROMOTION_COLLECTION
    ];

    for (const collection of collections) {
      await mockDb.seed(collection, []);
    }
  }

  // Feature CRUD operations
  async getFeatures(environment?: FeatureEnvironment): Promise<ApiResponse<Feature[]>> {
    return this.request<Feature[]>(`/features${environment ? `?env=${environment}` : ''}`);
  }

  async getFeature(id: string): Promise<ApiResponse<Feature>> {
    return this.request<Feature>(`/features/${id}`);
  }

  async createFeature(data: Partial<Feature>): Promise<ApiResponse<Feature>> {
    return this.request<Feature>('/features', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateFeature(id: string, data: Partial<Feature>): Promise<ApiResponse<Feature>> {
    return this.request<Feature>(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteFeature(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/features/${id}`, { method: 'DELETE' });
  }

  // Version management
  async getFeatureVersions(id: string): Promise<ApiResponse<FeatureVersion[]>> {
    return this.request<FeatureVersion[]>(`/features/${id}/versions`);
  }

  async getTemplates(): Promise<ApiResponse<FeatureTemplate[]>> {
    return this.request<FeatureTemplate[]>('/features/templates');
  }

  async rollbackVersion(id: string, version: number): Promise<ApiResponse<Feature>> {
    return this.request<Feature>(`/features/${id}/rollback/${version}`, {
      method: 'POST'
    });
  }

  // Promotion management
  async promoteFeature(
    id: string,
    sourceEnv: FeatureEnvironment,
    targetEnv: FeatureEnvironment
  ): Promise<ApiResponse<FeaturePromotion>> {
    return this.request<FeaturePromotion>(`/features/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ sourceEnv, targetEnv })
    });
  }

  // Experiments
  async getExperiments(featureId?: string): Promise<ApiResponse<FeatureExperiment[]>> {
    return this.request<FeatureExperiment[]>(
      `/features/experiments${featureId ? `?featureId=${featureId}` : ''}`
    );
  }

  async createExperiment(data: Partial<FeatureExperiment>): Promise<ApiResponse<FeatureExperiment>> {
    return this.request<FeatureExperiment>('/features/experiments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Metrics
  async getMetrics(
    featureId: string,
    environment: FeatureEnvironment,
    timeRange: { start: string; end: string }
  ): Promise<ApiResponse<FeatureMetrics[]>> {
    return this.request<FeatureMetrics[]>(
      `/features/${featureId}/metrics?env=${environment}&start=${timeRange.start}&end=${timeRange.end}`
    );
  }

  // Environment comparison
  async compareEnvironments(
    env1: FeatureEnvironment,
    env2: FeatureEnvironment
  ): Promise<ApiResponse<FeatureComparison>> {
    return this.request<FeatureComparison>(`/features/compare?env1=${env1}&env2=${env2}`);
  }

  // Audit logs
  async getAuditLogs(featureId?: string): Promise<ApiResponse<FeatureAuditLogs[]>> {
    return this.request<FeatureAuditLogs[]>(
      `/features/audit${featureId ? `?featureId=${featureId}` : ''}`
    );
  }

  protected async getMockResponse<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!this.initialized) {
        await this.initializeMockData();
      }

      const url = new URL(endpoint, 'http://mock');
      const path = url.pathname;
      const params = Object.fromEntries(url.searchParams);

      switch (true) {
        case path === '/features' && method === 'GET': {
          const features = await mockDb.find<Feature>(this.FEATURE_COLLECTION);
          if (params.env) {
            return {
              data: features.filter(f => 
                f.values.some(v => v.environment === params.env)
              ) as T
            };
          }
          return { data: features as T };
        }

        case endpoint === '/features/templates' && method === 'GET': {
          const templates = await mockDb.find<FeatureTemplate>(this.TEMPLATE_COLLECTION);
          return { data: templates as T };
        }

        case path === '/features/audit' && method === 'GET': {
          const auditLogs = await mockDb.find<FeatureAuditLogs>(this.AUDIT_COLLECTION);
          if (params.featureId) {
            return {
              data: auditLogs.filter(log => log.featureId === params.featureId) as T
            };
          }
          const sortedLogs = auditLogs.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          return { data: sortedLogs as T };
        }

        case path === '/features/experiments' && method === 'GET': {
          const experiments = await mockDb.find<FeatureExperiment>(this.EXPERIMENT_COLLECTION);
          if (params.featureId) {
            return {
              data: experiments.filter(exp => exp.featureId === params.featureId) as T
            };
          }
          return { data: experiments as T };
        }

        case /^\/features\/([^\/]+)\/versions$/.test(path): {
          const featureId = path.split('/')[2];
          const feature = await mockDb.findById<Feature>(this.FEATURE_COLLECTION, featureId);
          
          if (!feature) {
            return { data: [] as T };
          }

          const versions: FeatureVersion[] = [
            {
              id: generateId('ver-'),
              version: feature.version,
              createdAt: feature.updatedAt,
              createdBy: feature.updatedBy,
              changes: [],
              commitMessage: 'Current version',
              status: feature.status
            },
            ...(feature.previousVersions || [])
          ];

          return { data: versions as T };
        }

        case /^\/features\/([^\/]+)\/metrics/.test(path): {
          const featureId = path.split('/')[2];
          const environment = params.env as FeatureEnvironment;
          const startDate = new Date(params.start);
          const endDate = new Date(params.end);
          
          // Generate mock metrics data
          const metrics: FeatureMetrics[] = [];
          let currentDate = startDate;
          
          while (currentDate <= endDate) {
            metrics.push({
              id: generateId('metric-'),
              featureId,
              environment,
              timestamp: currentDate.toISOString(),
              data: {
                evaluations: Math.floor(Math.random() * 1000) + 100,
                enabled: Math.floor(Math.random() * 800) + 50,
                disabled: Math.floor(Math.random() * 200) + 50,
                errors: Math.floor(Math.random() * 10),
                latency: Math.random() * 100 + 50
              }
            });
            
            currentDate = new Date(currentDate.setHours(currentDate.getHours() + 1));
          }

          return { data: metrics as T };
        }

        case path === '/features' && method === 'POST': {
          const newFeature: Feature = {
            id: generateId('feat-'),
            ...JSON.parse(data),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            previousVersions: [],
            status: 'active',
            metadata: {}
          };

          const created = await mockDb.create(this.FEATURE_COLLECTION, newFeature);

          await this.createAuditLog({
            featureId: created.id,
            action: 'created',
            performedBy: 'system',
            details: {
              environment: created.values[0]?.environment,
              version: 1
            }
          });

          return { data: created as T };
        }

        // Add more case handlers for other endpoints...

        default:
          throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
      }
    } catch (error) {
      console.error('Error in getMockResponse:', error);
      throw error;
    }
  }

  private async createAuditLog(data: Pick<FeatureAuditLogs, 'featureId' | 'action' | 'performedBy' | 'details'>): Promise<void> {
    const auditLog: FeatureAuditLogs = {
      id: generateId('audit-'),
      featureId: data.featureId,
      action: data.action,
      performedBy: data.performedBy,
      timestamp: new Date().toISOString(),
      details: data.details,
      ipAddress: '127.0.0.1',
      userAgent: 'Mock Browser'
    };

    await mockDb.create(this.AUDIT_COLLECTION, auditLog);
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        await this.ensureCollectionsExist();

        const existingFeatures = await mockDb.find<Feature>(this.FEATURE_COLLECTION);
        if (existingFeatures.length === 0) {
          const featureId = generateId('feat-');
          const sampleFeatures: Feature[] = [
            {
              id: featureId,
              name: 'Dark Mode',
              key: 'dark_mode',
              description: 'Enable dark mode theme across the application',
              type: 'release',
              status: 'active',
              environment: 'development',
              values: [
                {
                  id: generateId('val-'),
                  environment: 'development',
                  enabled: true,
                  rolloutPercentage: 100,
                  rules: []
                }
              ],
              tags: ['ui', 'theme'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              version: 1,
              previousVersions: [],
              metadata: {}
            }
          ];

          for (const feature of sampleFeatures) {
            await mockDb.create(this.FEATURE_COLLECTION, feature);

            // Create initial audit log
            const initialAuditLog: FeatureAuditLogs = {
              id: generateId('audit-'),
              featureId: feature.id,
              action: 'created',
              performedBy: 'system',
              timestamp: new Date().toISOString(),
              details: {
                environment: feature.values[0].environment,
                version: 1,
                changes: [],
                metadata: {}
              },
              ipAddress: '127.0.0.1',
              userAgent: 'Mock Browser'
            };

            await mockDb.create(this.AUDIT_COLLECTION, initialAuditLog);
          }
        }

        // Initialize templates collection if empty
        const existingTemplates = await mockDb.find(this.TEMPLATE_COLLECTION);
        if (existingTemplates.length === 0) {
          const sampleTemplates: FeatureTemplate[] = [
            {
              id: generateId('tmpl-'),
              name: 'Basic Feature Flag',
              description: 'Simple on/off feature flag template',
              type: 'release',
              defaultValues: [
                {
                  id: generateId('val-'),
                  environment: 'development',
                  enabled: false,
                  rules: []
                }
              ],
              metadata: {},
              version: 1
            }
          ];

          for (const template of sampleTemplates) {
            await mockDb.create(this.TEMPLATE_COLLECTION, template);
          }
        }

        // Initialize experiments if empty
        const existingExperiments = await mockDb.find(this.EXPERIMENT_COLLECTION);
        if (existingExperiments.length === 0) {
          await mockDb.seed(this.EXPERIMENT_COLLECTION, []);
        }

        this.initialized = true;
        console.log('Feature management mock data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize feature mock data:', error);
        throw error;
      }
    }
  }
}

export const featureService = ApiServiceFactory.createService(FeatureService);