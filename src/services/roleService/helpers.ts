// src/services/roleService/helpers.ts
import { Permission, Role } from '../../types';

export class RoleHelpers {
  static validatePermissionDependencies(
    permissions: Permission[],
    selectedPermissions: string[]
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    selectedPermissions.forEach(permId => {
      const permission = permissions.find(p => p.id === permId);
      if (permission?.dependencies) {
        permission.dependencies.forEach(depId => {
          if (!selectedPermissions.includes(depId)) {
            missing.push(depId);
          }
        });
      }
    });

    return {
      valid: missing.length === 0,
      missing: [...new Set(missing)]
    };
  }

  static getRoleHierarchy(roles: Role[]): Map<string, Set<string>> {
    const hierarchy = new Map<string, Set<string>>();
    
    roles.forEach(role => {
      if (role.inheritedFrom) {
        role.inheritedFrom.forEach(parentId => {
          if (!hierarchy.has(parentId)) {
            hierarchy.set(parentId, new Set());
          }
          hierarchy.get(parentId)!.add(role.id);
        });
      }
    });

    return hierarchy;
  }

  static getEffectivePermissions(
    role: Role,
    roles: Role[],
    permissions: Permission[]
  ): Permission[] {
    const allPermissions = new Set<string>(role.permissions);

    // Add inherited permissions
    const processInheritance = (roleId: string) => {
      const currentRole = roles.find(r => r.id === roleId);
      if (currentRole?.inheritedFrom) {
        currentRole.inheritedFrom.forEach(parentId => {
          const parentRole = roles.find(r => r.id === parentId);
          if (parentRole) {
            parentRole.permissions.forEach(p => allPermissions.add(p));
            processInheritance(parentId);
          }
        });
      }
    };

    processInheritance(role.id);

    return permissions.filter(p => allPermissions.has(p.id));
  }

  static isRoleAssignmentValid(
    role: Role,
    userId: string,
    existingAssignments: { roleId: string; }[]
  ): boolean {
    // Check if user already has the role
    if (existingAssignments.some(a => a.roleId === role.id)) {
      return false;
    }

    // Check for conflicting roles if defined in metadata
    if (role.metadata?.conflictsWith) {
      const conflicts = existingAssignments.some(a => 
        role.metadata?.conflictsWith?.includes(a.roleId)
      );
      if (conflicts) {
        return false;
      }
    }

    return true;
  }

  static calculateRoleMetrics(
    role: Role,
    assignments: { status: string; assignedAt: string; }[]
  ): {
    totalAssignments: number;
    activeAssignments: number;
    avgAssignmentDuration: number;
    lastAssigned?: Date;
  } {
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const assignmentDates = assignments.map(a => new Date(a.assignedAt));
    const lastAssigned = assignmentDates.length > 0 
      ? new Date(Math.max(...assignmentDates.map(d => d.getTime())))
      : undefined;

    // Calculate average assignment duration
    const durations = assignments
      .filter(a => a.status !== 'active')
      .map(a => new Date().getTime() - new Date(a.assignedAt).getTime());
    
    const avgDuration = durations.length > 0
      ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
      : 0;

    return {
      totalAssignments: assignments.length,
      activeAssignments,
      avgAssignmentDuration: avgDuration,
      lastAssigned
    };
  }
}