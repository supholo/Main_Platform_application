export { 
    roleService,
    type Permission,
    type Role,
    type RoleAssignment,
    type RoleChangeEvent 
  } from '../roleService';
  export { RoleHelpers } from './helpers';
  
  // Usage example:
  const usage = async () => {
    const roleService = new RoleService();
    await roleService.initialize();
  
    // Create a custom role
    const newRole = await roleService.createRole({
      name: 'Project Manager',
      description: 'Manages project resources and team members',
      type: 'custom',
      permissions: ['users.view', 'apps.view', 'deploy.view'],
      metadata: {
        allowDelegation: true,
        maxDelegationDepth: 1,
        customFields: {
          projectScope: ['web', 'mobile'],
          requiresApproval: true
        }
      },
      status: 'active',
      userCount: 0
    }, 'admin-user-id');
  
    // Assign role to user
    await roleService.assignRole('user-123', newRole.id, 'admin-user-id', {
      expiresAt: '2024-12-31T23:59:59Z',
      metadata: {
        reason: 'Project leadership assignment',
        approvedBy: ['supervisor-id'],
        conditions: {
          timeRestriction: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          }
        }
      }
    });
  
    // Get user's effective permissions
    const userRoles = await roleService.getUserRoles('user-123');
    const effectivePermissions = userRoles.flatMap(role => 
      RoleHelpers.getEffectivePermissions(role, await roleService.getRoles(), await roleService.getPermissions())
    );
  
    // Analyze role usage
    const usage = await roleService.analyzeRoleUsage(newRole.id);
  
    // Get role change history
    const history = await roleService.getChangeHistory({
      roleId: newRole.id,
      startDate: '2024-01-01T00:00:00Z'
    });
  };