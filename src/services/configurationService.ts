// src/services/configurationService.ts

import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';
import { ApiServiceFactory } from './core/ApiServiceFactory';
import { CollectionName } from './mockDb/types';
import {
  Configuration,
  ConfigurationAuditLog,
  ConfigurationTemplate,
  ConfigurationComparison,
  ConfigurationEnvironment,
  ValidationResult,
  ConfigurationValue,
  ConfigurationVersion,
  ConfigurationApproval,
  ConfigurationPromotion
} from '../types/configuration';

export class ConfigurationService extends BaseApiService {
  private initialized = false;
  private readonly CONFIG_COLLECTION = 'configurations' as CollectionName;
  private readonly AUDIT_COLLECTION = 'configurationAudits' as CollectionName;
  private readonly TEMPLATE_COLLECTION = 'configurationTemplates' as CollectionName;
  private readonly APPROVAL_COLLECTION = 'configurationApprovals' as CollectionName;
  private readonly PROMOTION_COLLECTION = 'configurationPromotions' as CollectionName;

  private async ensureCollectionsExist() {
    const collections = [
      this.CONFIG_COLLECTION,
      this.AUDIT_COLLECTION,
      this.TEMPLATE_COLLECTION,
      this.APPROVAL_COLLECTION,
      this.PROMOTION_COLLECTION
    ];

    for (const collection of collections) {
      await mockDb.seed(collection, []);
    }
  }

  // Configuration CRUD operations
  async getConfigurations(environment?: ConfigurationEnvironment): Promise<ApiResponse<Configuration[]>> {
    return this.request<Configuration[]>(`/configurations${environment ? `?env=${environment}` : ''}`);
  }

  async getConfiguration(id: string): Promise<ApiResponse<Configuration>> {
    return this.request<Configuration>(`/configurations/${id}`);
  }

  async createConfiguration(data: Partial<Configuration>): Promise<ApiResponse<Configuration>> {
    return this.request<Configuration>('/configurations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateConfiguration(id: string, data: Partial<Configuration>): Promise<ApiResponse<Configuration>> {
    return this.request<Configuration>(`/configurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteConfiguration(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/configurations/${id}`, { method: 'DELETE' });
  }

  // Version management
  async getConfigurationVersions(id: string): Promise<ApiResponse<ConfigurationVersion[]>> {
    return this.request<ConfigurationVersion[]>(`/configurations/${id}/versions`);
  }

  async rollbackVersion(id: string, version: number): Promise<ApiResponse<Configuration>> {
    return this.request<Configuration>(`/configurations/${id}/rollback/${version}`, {
      method: 'POST'
    });
  }

  // Promotion management
  async promoteConfiguration(
    id: string,
    sourceEnv: ConfigurationEnvironment,
    targetEnv: ConfigurationEnvironment
  ): Promise<ApiResponse<ConfigurationPromotion>> {
    return this.request<ConfigurationPromotion>(`/configurations/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ sourceEnv, targetEnv })
    });
  }

  // Validation
  async validateConfiguration(data: Partial<Configuration>): Promise<ApiResponse<ValidationResult>> {
    return this.request<ValidationResult>('/configurations/validate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Comparison
  async compareEnvironments(
    env1: ConfigurationEnvironment,
    env2: ConfigurationEnvironment
  ): Promise<ApiResponse<ConfigurationComparison>> {
    return this.request<ConfigurationComparison>(`/configurations/compare?env1=${env1}&env2=${env2}`);
  }

  // Audit logs
  async getAuditLogs(configId?: string): Promise<ApiResponse<ConfigurationAuditLog[]>> {
    return this.request<ConfigurationAuditLog[]>(
      `/configurations/audit${configId ? `?configId=${configId}` : ''}`
    );
  }

  // Templates
  async getTemplates(): Promise<ApiResponse<ConfigurationTemplate[]>> {
    return this.request<ConfigurationTemplate[]>('/configurations/templates');
  }

  async createFromTemplate(templateId: string, data: Partial<Configuration>): Promise<ApiResponse<Configuration>> {
    return this.request<Configuration>('/configurations/from-template', {
      method: 'POST',
      body: JSON.stringify({ templateId, ...data })
    });
  }

  protected async getMockResponse<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
  
      if (!this.initialized) {
        await this.initializeMockData();
      }
  
      // Parse endpoint
      const url = new URL(endpoint, 'http://mock');
      const path = url.pathname;
      const params = Object.fromEntries(url.searchParams);
  
      switch (true) {
        case path === '/configurations' && method === 'GET': {
          const configs = await mockDb.find<Configuration>(this.CONFIG_COLLECTION);
          if (params.env) {
            return { 
              data: configs.filter(c => c.environment === params.env) as T 
            };
          }
          return { data: configs as T };
        }
  
        case path === '/configurations' && method === 'POST': {
          const newConfig: Configuration = {
            id: generateId('config-'),
            ...JSON.parse(data),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            previousVersions: [],
            status: 'active',
            dependencies: [],
            approvals: [],
            promotions: [],
            metadata: {}
          };
          
          const created = await mockDb.create(this.CONFIG_COLLECTION, newConfig);
          
          // Create initial version
          const initialVersion: ConfigurationVersion = {
            id: generateId('ver-'),
            version: 1,
            createdAt: newConfig.createdAt,
            createdBy: newConfig.createdBy,
            changes: [],
            commitMessage: 'Initial version',
            status: newConfig.status
          };
  
          created.previousVersions = [initialVersion];
          await mockDb.update(this.CONFIG_COLLECTION, created.id, created);
          
          await this.createAuditLog({
            configurationId: created.id,
            action: 'created',
            performedBy: 'current-user',
            details: { 
              environment: created.environment,
              version: 1
            }
          });
          
          return { data: created as T };
        }
  
        case /^\/configurations\/([^\/]+)\/versions$/.test(path): {
          const configId = path.split('/')[2];
          const config = await mockDb.findById<Configuration>(this.CONFIG_COLLECTION, configId);
          
          if (!config) {
            // Return empty array instead of throwing error
            return { data: [] as T };
          }
  
          const versions: ConfigurationVersion[] = [
            {
              id: generateId('ver-'),
              version: config.version,
              createdAt: config.updatedAt,
              createdBy: config.updatedBy,
              changes: [],
              commitMessage: 'Current version',
              status: config.status
            },
            ...(config.previousVersions || [])
          ];
  
          return { data: versions as T };
        }
  
        case path === '/configurations/templates' && method === 'GET': {
          const templates = await mockDb.find<ConfigurationTemplate>(this.TEMPLATE_COLLECTION);
          return { data: templates as T };
        }
  
        case path === '/configurations/from-template' && method === 'POST': {
          const { templateId, ...configData } = JSON.parse(data);
          const template = await mockDb.findById<ConfigurationTemplate>(this.TEMPLATE_COLLECTION, templateId);
          
          if (!template) {
            throw new Error(`Template with id ${templateId} not found`);
          }
        
          const newConfig: Configuration = {
            id: generateId('config-'),
            ...configData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            previousVersions: [],
            status: 'active',
            metadata: {
              ...configData.metadata,
              template: templateId
            }
          };
        
          const created = await mockDb.create(this.CONFIG_COLLECTION, newConfig);
          
          await this.createAuditLog({
            configurationId: created.id,
            action: 'created',
            performedBy: 'current-user',
            details: { 
              environment: created.environment,
              version: 1,
              metadata: { template: templateId },  // Move template to metadata
              changes: []  // Add empty changes array
            }
          });
        
          return { data: created as T };
        }
  
        case path === '/configurations/audit' && method === 'GET': {
          const auditLogs = await mockDb.find<ConfigurationAuditLog>(this.AUDIT_COLLECTION);
          if (params.configId) {
            return {
              data: auditLogs.filter(log => log.configurationId === params.configId) as T
            };
          }
          const sortedLogs = auditLogs.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          return { data: sortedLogs as T };
        }
  
        default:
          throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
      }
    } catch (error) {
      console.error('Error in getMockResponse:', error);
      throw error;
    }
  }

  private async createAuditLog(data: Pick<ConfigurationAuditLog, 'configurationId' | 'action' | 'performedBy' | 'details'>): Promise<void> {
    if (!data.configurationId || !data.action || !data.performedBy) {
      throw new Error('Missing required audit log fields');
    }
  
    const auditLog: ConfigurationAuditLog = {
      id: generateId('audit-'),
      configurationId: data.configurationId,
      action: data.action,
      performedBy: data.performedBy,
      timestamp: new Date().toISOString(),
      details: {
        environment: data.details?.environment,
        version: data.details?.version,
        changes: data.details?.changes || [],
        metadata: data.details?.metadata || {}
      },
      ipAddress: '127.0.0.1',  // Mock value
      userAgent: 'Mock Browser'  // Mock value
    };
  
    await mockDb.create(this.AUDIT_COLLECTION, auditLog);
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        await this.ensureCollectionsExist();
  
        // Add sample configurations if none exist
        const existingConfigs = await mockDb.find<Configuration>(this.CONFIG_COLLECTION);
        if (existingConfigs.length === 0) {
          const configId = generateId('config-');
          const sampleConfigs: Configuration[] = [
            {
              id: configId,
              name: 'API Settings',
              description: 'Main API configuration settings',
              type: 'application',
              environment: 'development',
              values: [
                {
                  id: generateId('val-'),
                  key: 'API_URL',
                  value: 'https://api.dev.example.com',
                  type: 'string',
                  isEncrypted: false,
                  isSecret: false
                }
              ],
              tags: ['api', 'core'],
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              version: 1,
              previousVersions: [],
              dependencies: [],
              approvals: [],
              promotions: [],
              metadata: {}
            }
          ];
  
          for (const config of sampleConfigs) {
            await mockDb.create(this.CONFIG_COLLECTION, config);
  
            // Create initial audit log
            const initialAuditLog: ConfigurationAuditLog = {
              id: generateId('audit-'),
              configurationId: config.id,
              action: 'created',
              performedBy: 'system',
              timestamp: new Date().toISOString(),
              details: {
                environment: config.environment,
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
          await mockDb.seed(this.TEMPLATE_COLLECTION, []);
        }
  
        this.initialized = true;
        console.log('Configuration management mock data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize configuration mock data:', error);
        this.initialized = true;
        throw error;
      }
    }
  }
}

export const configurationService = ApiServiceFactory.createService(ConfigurationService);