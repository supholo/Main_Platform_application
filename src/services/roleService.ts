// src/services/roleService.ts
import { BaseApiService } from './core/BaseApiService';
import { ApiResponse } from './core/types';
import { Role, Permission } from '../types/role';
import { mockDb } from './mockDb/MockDatabase';
import { generateId } from '../lib/utils';

export class RoleService extends BaseApiService {
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.request<Role[]>('/roles');
  }

  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.request<Permission[]>('/permissions');
  }

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ApiResponse<Role>> {
    return this.request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRole(id: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.request<Role>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/roles/${id}`, {
      method: 'DELETE'
    });
  }

  async createPermission(data: Omit<Permission, 'id'>): Promise<ApiResponse<Permission>> {
    return this.request<Permission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePermission(id: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePermission(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/permissions/${id}`, {
      method: 'DELETE'
    });
  }

  protected async getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    console.log('Mock Response Data:', { endpoint, method, data });
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (true) {
      case endpoint === '/roles' && method === 'GET':
        const roles = await mockDb.find<Role>('roles');
        return { data: roles as T };

      case endpoint === '/permissions' && method === 'GET':
        const permissions = await mockDb.find<Permission>('permissions');
        return { data: permissions as T };

      case endpoint === '/roles' && method === 'POST': {
        const newRole: Role = {
          id: generateId('role_'),
          ...data,
          status: data.status || 'active',
          type: data.type || 'custom',
          userCount: 0,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedBy: 'current-user',
          updatedAt: new Date().toISOString()
        };

        const createdRole = await mockDb.create<Role>('roles', newRole);
        return { data: createdRole as T };
      }

      case endpoint.match(/^\/roles\/[^/]+$/) && method === 'PUT': {
        const roleId = endpoint.split('/')[2];
        const existingRole = await mockDb.findById<Role>('roles', roleId);
        
        if (!existingRole) {
          throw new Error('Role not found');
        }

        if (existingRole.type === 'system' && data.type !== 'system') {
          throw new Error('Cannot modify system role type');
        }

        const updatedRole = await mockDb.update<Role>('roles', roleId, {
          ...data,
          updatedBy: 'current-user',
          updatedAt: new Date().toISOString()
        });

        return { data: updatedRole as T };
      }

      case endpoint.match(/^\/roles\/[^/]+$/) && method === 'DELETE': {
        const roleId = endpoint.split('/')[2];
        const roleToDelete = await mockDb.findById<Role>('roles', roleId);
        
        if (!roleToDelete) {
          throw new Error('Role not found');
        }

        if (roleToDelete.type === 'system') {
          throw new Error('Cannot delete system roles');
        }

        await mockDb.delete('roles', roleId);
        return { data: undefined as T };
      }

      case endpoint === '/permissions' && method === 'POST': {
        const newPermission: Permission = {
          id: generateId('perm_'),
          ...data,
          type: 'custom'
        };

        const createdPermission = await mockDb.create<Permission>('permissions', newPermission);
        return { data: createdPermission as T };
      }

      case endpoint.match(/^\/permissions\/[^/]+$/) && method === 'PUT': {
        const permissionId = endpoint.split('/')[2];
        const existingPermission = await mockDb.findById<Permission>('permissions', permissionId);
        
        if (!existingPermission) {
          throw new Error('Permission not found');
        }

        if (existingPermission.type === 'system') {
          throw new Error('Cannot delete system Permission');
        }

        const updatedPermission = await mockDb.update<Permission>(
          'permissions', 
          permissionId,
          data
        );

        return { data: updatedPermission as T };
      }

      case endpoint.match(/^\/permissions\/[^/]+$/) && method === 'DELETE':
        const deletePermissionId = endpoint.split('/')[2];
        const existingPermission = await mockDb.findById<Permission>('permissions', deletePermissionId);
        
        if (!existingPermission) {
          throw new Error('Permission not found');
        }

        if (existingPermission.type === 'system') {
          throw new Error('Cannot modify system permissions');
        }

        await mockDb.delete('permissions', deletePermissionId);
        return { data: undefined as T };

      default:
        throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
    }
  }

  // Helper method to initialize mock data
  async initializeMockData() {
    if (this.config.useMock) {
      const { mockRoles, mockPermissions } = await import('../mocks/roleData');
      await mockDb.seed('roles', mockRoles);
      await mockDb.seed('permissions', mockPermissions);
    }
  }
}