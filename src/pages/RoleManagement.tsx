// src/pages/RoleManagement.tsx
import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Search, 
  AlertTriangle,
  Filter,
  Check,
  X,
  Settings,
  Eye,
  Edit,
  Trash2,
  List
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '../components/ui/Card';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useRoles } from '../hooks/useRoles';
import { Role, Permission } from '../types/role';
import { RoleEditor } from '../components/role/RoleEditor';
import { PermissionEditor } from '../components/role/PermissionEditor';

const RoleStatusBadge: React.FC<{ status: Role['status'] }> = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const RolePermissionsOverview: React.FC<{
  permissions: string[];
  allPermissions: Permission[];
}> = ({ permissions, allPermissions }) => {
  const categories = useMemo(() => {
    const permMap = new Map(allPermissions.map(p => [p.id, p]));
    return permissions.reduce((acc, permId) => {
      const perm = permMap.get(permId);
      if (perm) {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
      }
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions, allPermissions]);

  return (
    <div className="mt-2">
      {Object.entries(categories).map(([category, perms]) => (
        <div key={category} className="mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{category}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {perms.map(perm => (
              <span
                key={perm.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  perm.risk === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : perm.risk === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {perm.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RoleManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Role['status'] | ''>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [showPermissionsList, setShowPermissionsList] = useState(false);

  const {
    roles,
    permissions,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    updatePermission,
    deletePermission,
    refetch
  } = useRoles();

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || role.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [roles, searchTerm, filterStatus]);

  const handleCreatePermission = async (data: Omit<Permission, 'id'>) => {
    try {
      setActionError(null);
      await createPermission(data);
      setShowPermissionEditor(false);
      setShowPermissionsList(true); // Return to list view after creation
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create permission');
    }
  };

  // Keep existing handlers and add new ones for permissions
  const handleUpdatePermission = async (id: string, data: Partial<Permission>) => {
    try {
      setActionError(null);
      await updatePermission(id, data);
      setSelectedPermission(null);
      setShowPermissionEditor(false);
      setShowPermissionsList(true); // Return to list view after update
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update permission');
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    const dependentRoles = roles.filter(role => 
      role.permissions.includes(permission.id)
    );

    if (dependentRoles.length > 0) {
      setActionError(`Cannot delete permission: Used by ${dependentRoles.length} role(s)`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      return;
    }

    try {
      setActionError(null);
      await deletePermission(permission.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete permission');
    }
  };

  const handleSaveRole = async (data: Partial<Role>) => {
    try {
      setActionError(null);
      if (selectedRole) {
        await updateRole(selectedRole.id, {
          ...data,
          type: selectedRole.type,
          userCount: selectedRole.userCount
        });
        setSelectedRole(null);
      } else {
        await createRole({
          ...data,
          type: 'custom',
          userCount: 0,
        } as Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>);
      }
      setIsCreating(false);
      // No need to call refetch as the state is already updated in the hook
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save role');
    }
  };
  
  const handleDeleteRole = async (role: Role) => {
    if (role.type === 'system') {
      setActionError('Cannot delete system roles');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionError(null);
      await deleteRole(role.id);
      // No need to call refetch as the state is already updated in the hook
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };



  if (error) {
    return (
      <div className="p-4">
        <Alert type="error">{error.message}</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (showPermissionsList) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Permissions Management
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedPermission(null);
                setShowPermissionEditor(true);
                setShowPermissionsList(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </button>
            <button
              onClick={() => setShowPermissionsList(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Roles
            </button>
          </div>
        </div>

        {actionError && (
          <Alert type="error" className="mb-4">
            {actionError}
          </Alert>
        )}

        <Card>
          <CardContent className="py-6">
            <PermissionList
              permissions={permissions}
              roles={roles}
              onEdit={(permission) => {
                setSelectedPermission(permission);
                setShowPermissionEditor(true);
                setShowPermissionsList(false);
              }}
              onDelete={handleDeletePermission}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPermissionEditor) {
    return (
      <PermissionEditor
        permission={selectedPermission}
        existingPermissions={permissions}
        onSave={handleCreatePermission}
        onUpdate={handleUpdatePermission}
        onCancel={() => {
          setSelectedPermission(null);
          setShowPermissionEditor(false);
          setShowPermissionsList(true);
        }}
        loading={loading}
      />
    );
  }

  if (selectedRole || isCreating) {
    return (
      <RoleEditor
        role={selectedRole}
        permissions={permissions}
        onSave={handleSaveRole}
        onCancel={() => {
          setSelectedRole(null);
          setIsCreating(false);
        }}
        onCreatePermission={handleCreatePermission}
        loading={loading}
      />
    );
  }

  return (
<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Role Management
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setSelectedPermission(null);
              setShowPermissionsList(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
          >
            <Shield className="h-4 w-4 mr-2" />
            Manage Permissions
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </button>
        </div>
      </div>

      {actionError && (
        <Alert type="error" className="mb-4">
          {actionError}
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Role['status'] | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredRoles.map(role => (
              <div
                key={role.id}
                className="border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </h3>
                      {role.type === 'system' && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                          System Role
                        </span>
                      )}
                      <RoleStatusBadge status={role.status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {role.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {role.userCount} users
                      </span>
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        {role.permissions.length} permissions
                      </span>
                    </div>
                    <RolePermissionsOverview
                      permissions={role.permissions}
                      allPermissions={permissions}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedRole(role)}
                      disabled={role.type === 'system'}
                      className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      disabled={role.type === 'system'}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No roles found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PermissionList: React.FC<{
  permissions: Permission[];
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
  roles: Role[]; // Added to check dependencies
}> = ({ permissions, onEdit, onDelete, roles }) => {
  const [category, setCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => 
    Array.from(new Set(permissions.map(p => p.category))).sort(),
    [permissions]
  );

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const matchesCategory = !category || permission.category === category;
      const matchesSearch = 
        !searchTerm || 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [permissions, category, searchTerm]);

  const getDependentRoles = (permissionId: string) => {
    return roles.filter(role => role.permissions.includes(permissionId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredPermissions.map(permission => {
          const dependentRoles = getDependentRoles(permission.id);
          return (
            <div
              key={permission.id}
              className="border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {permission.name}
                    </h3>
                    {permission.type === 'system' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                        System Permission
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      permission.risk === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : permission.risk === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {permission.risk} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {permission.description}
                  </p>
                  {permission.dependencies && permission.dependencies.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Dependencies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {permission.dependencies.map(depId => {
                          const dep = permissions.find(p => p.id === depId);
                          return dep ? (
                            <span key={depId} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300">
                              {dep.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {dependentRoles.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Used in roles:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dependentRoles.map(role => (
                          <span key={role.id} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {permission.type !== 'system' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(permission)}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Edit Permission"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(permission)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete Permission"
                      disabled={dependentRoles.length > 0}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default RoleManagement;