// src/services/roleService/defaults.ts
import { Permission, Role } from '../../types';

export const defaultPermissions: Permission[] = [
  // User Management
  {
    id: 'users.view',
    name: 'View Users',
    description: 'View user details and list',
    category: 'User Management',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'users.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    category: 'User Management',
    type: 'system',
    risk: 'medium',
    dependencies: ['users.view']
  },
  {
    id: 'users.edit',
    name: 'Edit Users',
    description: 'Modify user details and settings',
    category: 'User Management',
    type: 'system',
    risk: 'medium',
    dependencies: ['users.view']
  },
  {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Delete user accounts',
    category: 'User Management',
    type: 'system',
    risk: 'high',
    dependencies: ['users.view']
  },

  // Role Management
  {
    id: 'roles.view',
    name: 'View Roles',
    description: 'View role configurations',
    category: 'Role Management',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'roles.create',
    name: 'Create Roles',
    description: 'Create new roles',
    category: 'Role Management',
    type: 'system',
    risk: 'high',
    dependencies: ['roles.view']
  },
  {
    id: 'roles.edit',
    name: 'Edit Roles',
    description: 'Modify existing roles',
    category: 'Role Management',
    type: 'system',
    risk: 'high',
    dependencies: ['roles.view']
  },
  {
    id: 'roles.delete',
    name: 'Delete Roles',
    description: 'Delete roles',
    category: 'Role Management',
    type: 'system',
    risk: 'high',
    dependencies: ['roles.view']
  },
  {
    id: 'roles.assign',
    name: 'Assign Roles',
    description: 'Assign roles to users',
    category: 'Role Management',
    type: 'system',
    risk: 'medium',
    dependencies: ['roles.view', 'users.view']
  },

  // Application Management
  {
    id: 'apps.view',
    name: 'View Applications',
    description: 'View application details and list',
    category: 'Application Management',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'apps.create',
    name: 'Create Applications',
    description: 'Create new applications',
    category: 'Application Management',
    type: 'system',
    risk: 'high',
    dependencies: ['apps.view']
  },
  {
    id: 'apps.edit',
    name: 'Edit Applications',
    description: 'Modify application settings',
    category: 'Application Management',
    type: 'system',
    risk: 'high',
    dependencies: ['apps.view']
  },
  {
    id: 'apps.delete',
    name: 'Delete Applications',
    description: 'Delete applications',
    category: 'Application Management',
    type: 'system',
    risk: 'high',
    dependencies: ['apps.view']
  },

  // Deployment
  {
    id: 'deploy.view',
    name: 'View Deployments',
    description: 'View deployment status and history',
    category: 'Deployment',
    type: 'system',
    risk: 'low'
  },
  {
    id: 'deploy.create',
    name: 'Create Deployments',
    description: 'Create new deployments',
    category: 'Deployment',
    type: 'system',
    risk: 'high',
    dependencies: ['deploy.view', 'apps.view']
  },
  {
    id: 'deploy.rollback',
    name: 'Rollback Deployments',
    description: 'Rollback deployments',
    category: 'Deployment',
    type: 'system',
    risk: 'high',
    dependencies: ['deploy.view', 'deploy.create']
  }
];

export const defaultRoles: Role[] = [
  // System Administrator
  {
    id: 'role_system_admin',
    name: 'System Administrator',
    description: 'Full system access with all privileges',
    type: 'system',
    permissions: defaultPermissions.map(p => p.id),
    metadata: {
      allowDelegation: false,
    },
    userCount: 0,
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },

  // Security Administrator
  {
    id: 'role_security_admin',
    name: 'Security Administrator',
    description: 'Manages user access and security settings',
    type: 'system',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.assign'
    ],
    metadata: {
      allowDelegation: true,
      maxDelegationDepth: 1
    },
    userCount: 0,
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },

  // Developer
  {
    id: 'role_developer',
    name: 'Developer',
    description: 'Application development and deployment access',
    type: 'system',
    permissions: [
      'apps.view', 'apps.create', 'apps.edit',
      'deploy.view', 'deploy.create'
    ],
    metadata: {
      allowDelegation: false
    },
    userCount: 0,
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },

  // Viewer
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access to system resources',
    type: 'system',
    permissions: [
      'users.view',
      'roles.view',
      'apps.view',
      'deploy.view'
    ],
    metadata: {
      allowDelegation: false
    },
    userCount: 0,
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  }
];



// src/services/roleService/index.ts
