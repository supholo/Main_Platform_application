// src/hooks/useRoles.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Role, Permission } from '../types/role';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import { RoleService } from '../services/roleService';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitializedRef = useRef(false);

  const roleService = ApiServiceFactory.createService(RoleService);

  const loadData = useCallback(async () => {
    if (!isInitializedRef.current) {
      try {
        setLoading(true);
        setError(null);
        
        const [rolesResponse, permissionsResponse] = await Promise.all([
          roleService.getRoles(),
          roleService.getPermissions()
        ]);
        
        setRoles(rolesResponse.data);
        setPermissions(permissionsResponse.data);
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
        throw err;
      } finally {
        setLoading(false);
      }
    }
  }, [roleService]);

  // Rest of the existing CRUD operations remain the same
  const createRole = useCallback(async (data: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.createRole(data);
      setRoles(prevRoles => [...prevRoles, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const updateRole = useCallback(async (id: string, data: Partial<Role>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.updateRole(id, data);
      setRoles(prevRoles => 
        prevRoles.map(role => role.id === id ? response.data : role)
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roleService.deleteRole(id);
      setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const createPermission = useCallback(async (data: Omit<Permission, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.createPermission(data);
      setPermissions(prevPermissions => [...prevPermissions, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create permission'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const updatePermission = useCallback(async (id: string, data: Partial<Permission>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleService.updatePermission(id, data);
      setPermissions(prevPermissions => 
        prevPermissions.map(permission => permission.id === id ? response.data : permission)
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update permission'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const deletePermission = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roleService.deletePermission(id);
      setPermissions(prevPermissions => 
        prevPermissions.filter(permission => permission.id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete permission'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roleService]);

  const refetch = useCallback(async () => {
    isInitializedRef.current = false;
    return loadData();
  }, [loadData]);

  const initialize = useCallback(async () => {
    try {
      if (ApiServiceFactory.getConfig().useMock) {
        await roleService.initializeMockData();
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize'));
      throw err;
    }
  }, [roleService, loadData]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      initialize().catch(err => {
        console.error('Failed to initialize roles:', err);
      });
    }
  }, [initialize]);

  return {
    roles,
    permissions,
    loading,
    error,
    loadData,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    updatePermission,
    deletePermission,
    refetch,
    initialize
  };
}