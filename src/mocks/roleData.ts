// src/mocks/roleData.ts
import { Permission, Role } from '../types/role';

export const mockPermissions: Permission[] = [
  {
    id: 'users_view',
    name: 'View Users',
    description: 'Can view user details and list',
    category: 'User Management',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'users_create',
    name: 'Create Users',
    description: 'Can create new users',
    category: 'User Management',
    type: 'system',
    risk: 'medium',
    dependencies: ['users_view']
  },
  {
    id: 'users_edit',
    name: 'Edit Users',
    description: 'Can modify user details',
    category: 'User Management',
    type: 'system',
    risk: 'medium',
    dependencies: ['users_view']
  },
  {
    id: 'users_delete',
    name: 'Delete Users',
    description: 'Can delete users',
    category: 'User Management',
    type: 'system',
    risk: 'high',
    dependencies: ['users_view']
  },
  {
    id: 'roles_view',
    name: 'View Roles',
    description: 'Can view roles and permissions',
    category: 'Role Management',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'roles_manage',
    name: 'Manage Roles',
    description: 'Can create, update, and delete roles',
    category: 'Role Management',
    type: 'system',
    risk: 'high',
    dependencies: ['roles_view']
  },
  {
    id: 'audit_view',
    name: 'View Audit Logs',
    description: 'Can view audit logs',
    category: 'Audit',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'settings_view',
    name: 'View Settings',
    description: 'Can view system settings',
    category: 'Settings',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'settings_edit',
    name: 'Edit Settings',
    description: 'Can modify system settings',
    category: 'Settings',
    type: 'system',
    risk: 'high',
    dependencies: ['settings_view']
  }
];

export const mockRoles: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    type: 'system',
    permissions: mockPermissions.map(p => p.id),
    status: 'active',
    userCount: 2,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedBy: 'system',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role_user',
    name: 'Basic User',
    description: 'Basic user access with limited permissions',
    type: 'custom',
    permissions: ['users_view', 'roles_view', 'audit_view'],
    status: 'active',
    userCount: 15,
    createdBy: 'system',
    createdAt: '2024-01-02T00:00:00Z',
    updatedBy: 'system',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'role_auditor',
    name: 'Auditor',
    description: 'Read-only access for auditing purposes',
    type: 'custom',
    permissions: ['users_view', 'roles_view', 'audit_view'],
    status: 'active',
    userCount: 5,
    createdBy: 'system',
    createdAt: '2024-01-03T00:00:00Z',
    updatedBy: 'system',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];