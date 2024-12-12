import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Alert } from '../../ui/alert';
import { Users, Shield } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RolesStepProps {
  roles: Role[];
  availablePermissions: Permission[];
  onAddRole: () => void;
  onUpdateRole: (index: number, role: Role) => void;
  onRemoveRole: (index: number) => void;
  errors: Record<string, string>;
}

export const RolesStep: React.FC<RolesStepProps> = ({
  roles,
  availablePermissions,
  onAddRole,
  onUpdateRole,
  onRemoveRole,
  errors
}) => {
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardContent className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Users className="mr-2 h-6 w-6 text-indigo-500" />
            Role Configuration
          </h3>
          <button
            onClick={onAddRole}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Users className="mr-2 h-5 w-5" />
            Add Role
          </button>
        </div>

        <div className="space-y-6">
          {roles.map((role, roleIndex) => (
            <div
              key={role.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={role.name}
                      onChange={(e) => onUpdateRole(roleIndex, { ...role, name: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors[`roles.${roleIndex}.name`] && (
                      <Alert type="error" className="mt-1">{errors[`roles.${roleIndex}.name`]}</Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={role.description}
                      onChange={(e) => onUpdateRole(roleIndex, { ...role, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => onRemoveRole(roleIndex)}
                  className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
                  <Shield className="mr-2 h-5 w-5 text-indigo-500" />
                  Permissions
                </h4>

                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {category}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={role.permissions.includes(permission.id)}
                              onChange={(e) => {
                                const newPermissions = e.target.checked
                                  ? [...role.permissions, permission.id]
                                  : role.permissions.filter(id => id !== permission.id);
                                onUpdateRole(roleIndex, { ...role, permissions: newPermissions });
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label className="font-medium text-gray-700 dark:text-gray-300">
                              {permission.name}
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {errors[`roles.${roleIndex}.permissions`] && (
                  <Alert type="error" className="mt-1">{errors[`roles.${roleIndex}.permissions`]}</Alert>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RolesStep;

