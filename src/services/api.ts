// src/services/api.ts
import { ApiResponse, ApiError } from '../types/api';

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private tenantId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...(this.tenantId ? { 'X-Tenant-ID': this.tenantId } : {})
    };

    const useMock = import.meta.env.VITE_USE_MOCK === 'true';
    const isDev = import.meta.env.MODE === 'development';

    try {
      // Use mock responses if mock mode is enabled or in development
      if (useMock || isDev) {
        return await this.getMockResponse(endpoint, method, data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw error;
      }

      return await response.json();
    } catch (error) {
      // If mock is enabled and we get an error, try mock response
      if (useMock) {
        try {
          return await this.getMockResponse(endpoint, method, data);
        } catch (mockError) {
          console.error('Mock response error:', mockError);
          throw mockError;
        }
      }

      if ((error as ApiError).code) {
        throw error;
      }
      throw {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: { originalError: error }
      };
    }
  }

  // Mock API responses
  private async getMockResponse(endpoint: string, method: string, data?: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // For GET requests
  if (method === 'GET') {
    switch (true) {
      case endpoint.includes('/applications'):
        return { 
          data: [
            {
              id: 'app-1',
              name: 'User Service',
              status: 'running',
              version: '1.0.0',
              metrics: {
                cpu: 45,
                memory: 60,
                requests: 1200,
                errors: 5
              },
              lastDeployment: {
                status: 'success',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
              }
            },
            {
              id: 'app-2',
              name: 'Payment Service',
              status: 'running',
              version: '1.1.0',
              metrics: {
                cpu: 35,
                memory: 55,
                requests: 800,
                errors: 2
              },
              lastDeployment: {
                status: 'success',
                timestamp: new Date().toISOString(),
                version: '1.1.0'
              }
            }
          ]
        };
        case endpoint.includes('/audit-logs'):
          return {
            data: [
              {
                id: 'log-1',
                timestamp: new Date().toISOString(),
                actor: {
                  name: 'John Doe',
                  email: 'john@example.com'
                },
                action: 'User Login',
                resource: 'Authentication',
                status: 'success',
                details: 'Successful login attempt'
              },
              {
                id: 'log-2',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                actor: {
                  name: 'Jane Smith',
                  email: 'jane@example.com'
                },
                action: 'Role Update',
                resource: 'Role Management',
                status: 'success',
                details: 'Modified permissions for Admin role'
              },
              {
                id: 'log-3',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                actor: {
                  name: 'System',
                  email: 'system@example.com'
                },
                action: 'Deployment',
                resource: 'Application',
                status: 'error',
                details: 'Failed to deploy version 1.2.0'
              }
            ]
          };
  
        case endpoint.includes('/roles'):
          return {
            data: [
              {
                id: 'role-1',
                name: 'Administrator',
                description: 'Full system access with all permissions',
                isSystem: true,
                permissions: ['manage_users', 'manage_roles', 'manage_systems'],
                userCount: 3,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              },
              {
                id: 'role-2',
                name: 'Developer',
                description: 'Access to development and deployment features',
                isSystem: false,
                permissions: ['deploy_apps', 'view_logs', 'manage_configs'],
                userCount: 12,
                createdAt: '2024-01-02T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z'
              },
              {
                id: 'role-3',
                name: 'Auditor',
                description: 'Read-only access to logs and configurations',
                isSystem: false,
                permissions: ['view_logs', 'view_configs'],
                userCount: 5,
                createdAt: '2024-01-03T00:00:00Z',
                updatedAt: '2024-01-03T00:00:00Z'
              }
            ]
          };
  
        case endpoint.includes('/permissions'):
          return {
            data: [
              {
                id: 'perm-1',
                name: 'Manage Users',
                description: 'Create, update, and delete users',
                category: 'User Management',
                dependencies: []
              },
              {
                id: 'perm-2',
                name: 'Manage Roles',
                description: 'Create, update, and delete roles',
                category: 'User Management',
                dependencies: ['manage_users']
              },
              {
                id: 'perm-3',
                name: 'View Logs',
                description: 'View system and audit logs',
                category: 'Monitoring',
                dependencies: []
              },
              {
                id: 'perm-4',
                name: 'Manage Systems',
                description: 'Manage system configurations',
                category: 'System',
                dependencies: []
              }
            ]
          };
  
        case endpoint.includes('/metrics'):
          // Generate some random time-series data
          const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            cpu: 30 + Math.random() * 40,
            memory: 40 + Math.random() * 30,
            disk: 50 + Math.random() * 20,
            network: Math.random() * 100
          }));
          
          return {
            data: timeSeriesData
          };
      default:
        return { data: {} };
    }
  }

    // For POST/PUT requests
  switch (true) {
    case endpoint.includes('/tenant'):
      return {
        data: {
          id: `tenant-${Date.now()}`,
          ...data,
          status: 'active'
        }
      };

    case endpoint.includes('/application'):
      return {
        data: {
          id: `app-${Date.now()}`,
          ...data,
          status: 'created'
        }
      };

    case endpoint.includes('/cloud-config'):
      return {
        data: {
          id: `config-${Date.now()}`,
          ...data,
          status: 'configured'
        }
      };

    case endpoint.includes('/identity'):
      return {
        data: {
          id: `identity-${Date.now()}`,
          ...data,
          status: 'configured'
        }
      };

    case endpoint.includes('/notifications'):
      return {
        data: {
          id: `notification-${Date.now()}`,
          ...data,
          status: 'configured'
        }
      };

    case endpoint.includes('/role'):
      return {
        data: {
          id: `role-${Date.now()}`,
          ...data,
          created: new Date().toISOString()
        }
      };

      default:
        return {
          data: { success: true }
        };
    }
  }

  // API Methods
  async createTenant(data: any): Promise<ApiResponse<any>> {
    return this.post('/tenant', data);
  }

  async createApplication(data: any): Promise<ApiResponse<any>> {
    return this.post('/application', data);
  }

  async saveCloudConfiguration(data: any): Promise<ApiResponse<any>> {
    return this.post('/cloud-config', data);
  }

  async configureIdentityProvider(data: any): Promise<ApiResponse<any>> {
    return this.post('/identity/provider', data);
  }

  async configureNotifications(data: any): Promise<ApiResponse<any>> {
    return this.post('/notifications/config', data);
  }

  async createRole(data: any): Promise<ApiResponse<any>> {
    return this.post('/role', data);
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  post<T>(endpoint: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  put<T>(endpoint: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // Add these methods to your ApiService class
async getTenant(): Promise<ApiResponse<any>> {
  return this.get('/tenant');
}

async getApplications(): Promise<ApiResponse<any>> {
  return this.get('/applications');
}

async getMetrics(applicationId: string, timeRange: any): Promise<ApiResponse<any>> {
  return this.get(`/applications/${applicationId}/metrics?start=${timeRange.start}&end=${timeRange.end}`);
}

async getAuditLogs(filters: any): Promise<ApiResponse<any>> {
  const queryParams = new URLSearchParams(filters).toString();
  return this.get(`/audit-logs?${queryParams}`);
}

async getCloudConfiguration(): Promise<ApiResponse<any>> {
  return this.get('/cloud-config');
}

async getIdentityProvider(): Promise<ApiResponse<any>> {
  return this.get('/identity/provider');
}

async getRoles(): Promise<ApiResponse<any>> {
  return this.get('/roles');
}

  // Add these methods to your ApiService class
  async getPermissions(): Promise<ApiResponse<any>> {
    return this.get('/permissions');
  }

  async getRole(id: string): Promise<ApiResponse<any>> {
    return this.get(`/roles/${id}`);
  }

  async updateRole(id: string, data: any): Promise<ApiResponse<any>> {
    return this.put(`/roles/${id}`, data);
  }

  async deleteRole(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/roles/${id}`);
  }

async getNotificationConfigs(): Promise<ApiResponse<any>> {
  return this.get('/notifications/config');
}

async getNotificationChannels(): Promise<ApiResponse<any>> {
  return this.get('/notifications/channels');
}
}

export const api = new ApiService(import.meta.env.VITE_API_BASE_URL || '/api');