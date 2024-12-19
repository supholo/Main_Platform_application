// src/services/applicationService.ts

import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';
import { ApiServiceFactory } from './core/ApiServiceFactory';
import { CollectionName } from './mockDb/types';
import {
  Application,
  ApplicationIntegration,
  ApplicationOnboarding,
  IntegrationType,
  CiCdConfig,
  LoggingConfig,
  MetricsConfig,
  NotificationConfig
} from '../types/application';

interface IApplicationService {
    getApplications(): Promise<ApiResponse<Application[]>>;
    getApplication(id: string): Promise<ApiResponse<Application>>;
    createApplication(data: Partial<Application>): Promise<ApiResponse<Application>>;
    updateApplication(id: string, data: Partial<Application>): Promise<ApiResponse<Application>>;
    deleteApplication(id: string): Promise<ApiResponse<void>>;
    getIntegrations(applicationId: string): Promise<ApiResponse<ApplicationIntegration[]>>;
    addIntegration(
      applicationId: string,
      type: IntegrationType,
      config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig
    ): Promise<ApiResponse<ApplicationIntegration>>;
    updateIntegration(
      applicationId: string,
      integrationId: string,
      config: Partial<CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig>
    ): Promise<ApiResponse<ApplicationIntegration>>;
    removeIntegration(applicationId: string, integrationId: string): Promise<ApiResponse<void>>;
    getOnboardingStatus(applicationId: string): Promise<ApiResponse<ApplicationOnboarding>>;
    updateOnboardingStatus(
      applicationId: string,
      data: Partial<ApplicationOnboarding>
    ): Promise<ApiResponse<ApplicationOnboarding>>;
    initializeMockData(): Promise<void>;
  }
  
  export class ApplicationService extends BaseApiService implements IApplicationService {
    private initialized = false;
    private readonly APP_COLLECTION = 'applications' as CollectionName;
    private readonly INTEGRATION_COLLECTION = 'applicationIntegrations' as CollectionName;
    private readonly ONBOARDING_COLLECTION = 'applicationOnboarding' as CollectionName;

  private async ensureCollectionsExist() {
    const collections = [
      this.APP_COLLECTION,
      this.INTEGRATION_COLLECTION,
      this.ONBOARDING_COLLECTION
    ];

    for (const collection of collections) {
      await mockDb.seed(collection, []);
    }
  }

  // Application CRUD operations
  async getApplications(): Promise<ApiResponse<Application[]>> {
    return this.request<Application[]>('/applications');
  }

  async getApplication(id: string): Promise<ApiResponse<Application>> {
    return this.request<Application>(`/applications/${id}`);
  }

  async createApplication(data: Partial<Application>): Promise<ApiResponse<Application>> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<ApiResponse<Application>> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteApplication(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/applications/${id}`, { method: 'DELETE' });
  }

  // Integration management
  async getIntegrations(applicationId: string): Promise<ApiResponse<ApplicationIntegration[]>> {
    return this.request<ApplicationIntegration[]>(`/applications/${applicationId}/integrations`);
  }

  async addIntegration(
    applicationId: string,
    type: IntegrationType,
    config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig
  ): Promise<ApiResponse<ApplicationIntegration>> {
    return this.request<ApplicationIntegration>(`/applications/${applicationId}/integrations`, {
      method: 'POST',
      body: JSON.stringify({ type, config })
    });
  }

  async updateIntegration(
    applicationId: string,
    integrationId: string,
    config: Partial<CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig>
  ): Promise<ApiResponse<ApplicationIntegration>> {
    return this.request<ApplicationIntegration>(
      `/applications/${applicationId}/integrations/${integrationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ config })
      }
    );
  }

  async removeIntegration(applicationId: string, integrationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/applications/${applicationId}/integrations/${integrationId}`,
      { method: 'DELETE' }
    );
  }

  // Onboarding management
  async getOnboardingStatus(applicationId: string): Promise<ApiResponse<ApplicationOnboarding>> {
    return this.request<ApplicationOnboarding>(`/applications/${applicationId}/onboarding`);
  }

  async updateOnboardingStatus(
    applicationId: string,
    data: Partial<ApplicationOnboarding>
  ): Promise<ApiResponse<ApplicationOnboarding>> {
    return this.request<ApplicationOnboarding>(`/applications/${applicationId}/onboarding`, {
      method: 'PUT',
      body: JSON.stringify(data)
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

      switch (true) {
        case path === '/applications' && method === 'GET': {
          const apps = await mockDb.find<Application>(this.APP_COLLECTION);
          return { data: apps as T };
        }

        case path === '/applications' && method === 'POST': {
          const newApp: Application = {
            id: generateId('app-'),
            ...JSON.parse(data),
            status: 'active',
            integrations: [],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system'
          };

          const created = await mockDb.create(this.APP_COLLECTION, newApp);

          // Create initial onboarding status
          const onboardingId = generateId('onboard-');
          const onboarding: ApplicationOnboarding & { id: string } = {
            id: onboardingId,
            step: 1,
            completed: false,
            application: created,
            integrations: {},
            applicationId: created.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await mockDb.create(this.ONBOARDING_COLLECTION, onboarding);

          return { data: created as T };
        }

        case /^\/applications\/([^\/]+)\/integrations$/.test(path) && method === 'GET': {
          const appId = path.split('/')[2];
          const integrations = await mockDb.find<ApplicationIntegration>(
            this.INTEGRATION_COLLECTION,
            { applicationId: appId }
          );
          return { data: integrations as T };
        }

        case /^\/applications\/([^\/]+)\/integrations$/.test(path) && method === 'POST': {
          const appId = path.split('/')[2];
          const integration: ApplicationIntegration = {
            id: generateId('int-'),
            applicationId: appId,
            ...JSON.parse(data),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const created = await mockDb.create(this.INTEGRATION_COLLECTION, integration);
          return { data: created as T };
        }

        case /^\/applications\/([^\/]+)\/onboarding$/.test(path) && method === 'GET': {
          const appId = path.split('/')[2];
          const onboarding = await mockDb.find<ApplicationOnboarding>(
            this.ONBOARDING_COLLECTION,
            { applicationId: appId }
          );
          return { data: onboarding[0] as T };
        }

        default:
          throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
      }
    } catch (error) {
      console.error('Error in getMockResponse:', error);
      throw error;
    }
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        await this.ensureCollectionsExist();

        // Add sample applications if none exist
        const existingApps = await mockDb.find<Application>(this.APP_COLLECTION);
        if (existingApps.length === 0) {
          const sampleApps: Application[] = [
            {
              id: generateId('app-'),
              name: 'Sample Application',
              description: 'A sample application for testing',
              status: 'active',
              version: '1.0.0',
              environments: ['development', 'staging', 'production'],
              integrations: [],
              tags: ['sample', 'test'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system'
            }
          ];

          for (const app of sampleApps) {
            await mockDb.create(this.APP_COLLECTION, app);
          }
        }

        this.initialized = true;
        console.log('Application management mock data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize application mock data:', error);
        throw error;
      }
    }
  }
}

export const applicationService = ApiServiceFactory.createService(ApplicationService);