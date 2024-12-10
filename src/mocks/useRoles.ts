// src/hooks/useRoles.ts
import { useState, useCallback } from 'react';
import { Role, Permission } from '../mocks/roleData';
import { roleService } from '../services/roleService';

export function useRoleManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      await roleService.validatePermissions(roleData.permissions);
      const newRole = await roleService.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      return newRole;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, roleData: Partial<Role>) => {
    try {
      setLoading(true);
      setError(null);
      if (roleData.permissions) {
        await roleService.validatePermissions(roleData.permissions);
      }
      const updatedRole = await roleService.updateRole(id, roleData);
      setRoles(prev => prev.map(role => 
        role.id === id ? updatedRole : role
      ));
      return updatedRole;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await roleService.deleteRole(id);
      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete role'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    roles,
    permissions,
    loading,
    error,
    loadRoles,
    createRole,
    updateRole,
    deleteRole
  };
}

// Custom hook for permission dependencies
export function usePermissionDependencies(permissions: Permission[]) {
  const getDependencies = useCallback((permissionId: string): string[] => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission || !permission.dependencies) return [];

    const allDependencies = new Set<string>();
    const addDependencies = (id: string) => {
      const p = permissions.find(p => p.id === id);
      if (!p || !p.dependencies) return;

      p.dependencies.forEach(depId => {
        if (!allDependencies.has(depId)) {
          allDependencies.add(depId);
          addDependencies(depId);
        }
      });
    };

    permission.dependencies.forEach(depId => {
      allDependencies.add(depId);
      addDependencies(depId);
    });

    return Array.from(allDependencies);
  }, [permissions]);

  const getDependents = useCallback((permissionId: string): string[] => {
    return permissions
      .filter(p => p.dependencies?.includes(permissionId))
      .map(p => p.id);
  }, [permissions]);

  return {
    getDependencies,
    getDependents
  };
}