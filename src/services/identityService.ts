import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';
import { ApiServiceFactory } from './core/ApiServiceFactory';
import { CollectionName } from '../services/mockDb/types';


export type ApiKeyStatus = 'active' | 'revoked';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'apiAccess'>;

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  expires: string;
  lastUsed?: string;
  scopes: string[];
  status: ApiKeyStatus;
}

export interface ApiAccess {
    enabled: boolean;
    keys: ApiKey[];
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: UserStatus;
    lastLogin: string;
    mfaEnabled: boolean;
    createdAt: string;
    apiAccess: ApiAccess;
    identityProvider?: string;
    passwordReset?: boolean;
  }

export interface IdentityProvider {
  id: string;
  name: string;
  type: 'internal' | 'oauth2' | 'saml';
  config: {
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    callbackUrl?: string;
    samlMetadata?: string;mfaEnabled?: boolean;
    mfaEnforced?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      expiryDays: number;
      preventReuse: number;
    };
  };
  status: 'active' | 'inactive';
}



export class IdentityService extends BaseApiService {
  private initialized = false;
  private readonly USERS_COLLECTION: CollectionName = 'users';
  private readonly PROVIDERS_COLLECTION: CollectionName = 'identityProviders';

  private async ensureCollectionsExist() {
    try {
      // Get existing collections
      const existingUsers = await mockDb.find<User>(this.USERS_COLLECTION);
      const existingProviders = await mockDb.find<IdentityProvider>(this.PROVIDERS_COLLECTION);

      if (existingUsers === null || existingProviders === null) {
        // If collections don't exist, initialize them with empty arrays
        await mockDb.seed(this.USERS_COLLECTION, []);
        await mockDb.seed(this.PROVIDERS_COLLECTION, []);
      }
    } catch (error) {
      console.error('Error ensuring collections exist:', error);
      throw error;
    }
  }

  private initializeApiAccess(): ApiAccess {
    return {
      enabled: false,
      keys: []
    };
  }
  async getUsers(): Promise<ApiResponse<User[]>> {
    if (!this.initialized && this.config.useMock) {
      await this.initializeMockData();
    }
    return this.request<User[]>('/users');
  }

  

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        apiAccess: this.initializeApiAccess()
      })
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  async getIdentityProviders(): Promise<ApiResponse<IdentityProvider[]>> {
    if (!this.initialized && this.config.useMock) {
      await this.initializeMockData();
    }
    return this.request<IdentityProvider[]>('/identity-providers');
  }
  async createIdentityProvider(data: Omit<IdentityProvider, 'id'>): Promise<ApiResponse<IdentityProvider>> {
    return this.request<IdentityProvider>('/identity-providers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateIdentityProvider(id: string, data: Partial<IdentityProvider>): Promise<ApiResponse<IdentityProvider>> {
    return this.request<IdentityProvider>(`/identity-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async createApiKey(userId: string, data: { name: string; scopes: string[]; expires: string }): Promise<ApiResponse<ApiKey>> {
    return this.request<ApiKey>(`/users/${userId}/api-keys`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async revokeApiKey(userId: string, keyId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/api-keys/${keyId}/revoke`, {
      method: 'POST'
    });
  }

  async updateProvider(id: string, data: Partial<IdentityProvider>): Promise<ApiResponse<IdentityProvider>> {
    return this.request<IdentityProvider>(`/identity-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  protected async getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const parseData = (data: any) => {
      if (!data) return data;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    };

    const parsedData = parseData(data);

    switch (true) {
      case endpoint === '/users' && method === 'GET':
        const users = await mockDb.find<User>(this.USERS_COLLECTION);
        return { data: users as T };

      case endpoint === '/users' && method === 'POST':
        const newUser: User = {
          id: generateId('user-'),
          ...parsedData,
          createdAt: new Date().toISOString(),
          lastLogin: '',
          apiAccess: this.initializeApiAccess()
        };
        const createdUser = await mockDb.create<User>(this.USERS_COLLECTION, newUser);
        return { data: createdUser as T };

        case endpoint.match(/^\/users\/[^/]+$/) && method === 'PUT':
          const userId = endpoint.split('/')[2];
          const existingUser = await mockDb.findById<User>(this.USERS_COLLECTION, userId);
          if (!existingUser) throw new Error('User not found');
          
          // Ensure we properly type the updated user data
          const updatedUserData: Partial<User> = {
            ...parsedData,
            status: parsedData.status as UserStatus,
            passwordReset: parsedData.passwordReset,
            apiAccess: parsedData.apiAccess ? {
              enabled: parsedData.apiAccess.enabled ?? existingUser.apiAccess.enabled,
              keys: parsedData.apiAccess.keys ?? existingUser.apiAccess.keys
            } : existingUser.apiAccess
          };
    
          const updatedUser = await mockDb.update<User>(
            this.USERS_COLLECTION,
            userId,
            updatedUserData
          );
          return { data: updatedUser as T };

      case endpoint === '/identity-providers' && method === 'GET':
        const providers = await mockDb.find<IdentityProvider>(this.PROVIDERS_COLLECTION);
        return { data: providers as T };

      case endpoint === '/identity-providers' && method === 'POST':
        const newProvider: IdentityProvider = {
          id: generateId('idp-'),
          ...parsedData,
          status: 'active'
        };
        const createdProvider = await mockDb.create<IdentityProvider>(this.PROVIDERS_COLLECTION, newProvider);
        return { data: createdProvider as T };

      case endpoint.match(/^\/identity-providers\/[^/]+$/) && method === 'PUT':
        const providerId = endpoint.split('/')[2];
        const existingProvider = await mockDb.findById<IdentityProvider>(this.PROVIDERS_COLLECTION, providerId);
        if (!existingProvider) throw new Error('Identity provider not found');
        const updatedProvider = await mockDb.update<IdentityProvider>(this.PROVIDERS_COLLECTION, providerId, {
          ...existingProvider,
          ...parsedData
        });
        return { data: updatedProvider as T };

        case endpoint.match(/^\/users\/[^/]+\/api-keys$/) && method === 'POST':
    const keyUserId = endpoint.split('/')[2];
    const user = await mockDb.findById<User>(this.USERS_COLLECTION, keyUserId);
    if (!user) throw new Error('User not found');

    const newKey: ApiKey = {
      id: generateId('key-'),
      key: generateId('pk-'),
      created: new Date().toISOString(),
      status: 'active' as ApiKeyStatus,
      ...parsedData
    };

    const userApiKeys = [...user.apiAccess.keys, newKey];
    await mockDb.update<User>(this.USERS_COLLECTION, keyUserId, {
      ...user,
      apiAccess: {
        enabled: true,
        keys: userApiKeys
      }
    });

    return { data: newKey as T };

case endpoint.match(/^\/users\/[^/]+\/api-keys\/[^/]+\/revoke$/) && method === 'POST':
    const revokeUserId = endpoint.split('/')[2];
    const keyId = endpoint.split('/')[4];
    const userToUpdate = await mockDb.findById<User>(this.USERS_COLLECTION, revokeUserId);
    if (!userToUpdate) throw new Error('User not found');
    
    const revokedApiKeys = userToUpdate.apiAccess.keys.map(key => 
      key.id === keyId ? { ...key, status: 'revoked' as ApiKeyStatus } : key
    );
    
    await mockDb.update<User>(this.USERS_COLLECTION, revokeUserId, {
      ...userToUpdate,
      apiAccess: {
        enabled: revokedApiKeys.some(key => key.status === 'active'),
        keys: revokedApiKeys
      }
    });
    
    return { data: undefined as T };
        

      default:
        throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
    }
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        await this.ensureCollectionsExist();
        // Check if collections exist first
        let existingUsers: User[] = [];
        let existingProviders: IdentityProvider[] = [];
        
        try {
          existingUsers = (await mockDb.find<User>(this.USERS_COLLECTION)) || [];
          existingProviders = (await mockDb.find<IdentityProvider>(this.PROVIDERS_COLLECTION)) || [];
        } catch (error) {
          console.log('Collections not initialized yet, proceeding with initialization');
        }

        // Only seed if collections are empty
        if (existingUsers.length === 0) {
          const mockUsers: User[] = [
            {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'Admin',
              status: 'active',
              lastLogin: new Date().toISOString(),
              mfaEnabled: true,
              createdAt: '2024-01-01T00:00:00Z',
              apiAccess: {
                enabled: true,
                keys: [
                  {
                    id: 'key-1',
                    name: 'Development API',
                    key: 'pk-dev-123',
                    created: '2024-01-01T00:00:00Z',
                    expires: '2025-01-01T00:00:00Z',
                    lastUsed: '2024-03-15T00:00:00Z',
                    scopes: ['read', 'write'],
                    status: 'active' as ApiKeyStatus
                  }
                ]
              }
            }
          ];
          await mockDb.seed(this.USERS_COLLECTION, mockUsers);
          console.log('Users seeded successfully');
        }

        if (existingProviders.length === 0) {
          const mockProviders: IdentityProvider[] = [
            {
              id: 'idp-1',
              name: 'Internal Auth',
              type: 'internal',
              config: {
                mfaEnabled: false,
                mfaEnforced: false,
                sessionTimeout: 30,
                passwordPolicy: {
                  minLength: 8,
                  requireUppercase: true,
                  requireNumbers: true,
                  requireSymbols: true,
                  expiryDays: 90,
                  preventReuse: 5
                }
              },
              status: 'active'
            }
          ];
          await mockDb.seed(this.PROVIDERS_COLLECTION, mockProviders);
          console.log('Providers seeded successfully');
        }

        this.initialized = true;
        console.log('Identity management mock data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize identity management mock data:', error);
        this.initialized = false;
        throw error;
      }
    }
  }
}

export const identityService = ApiServiceFactory.createService(IdentityService);