// src/components/role/PermissionEditor.tsx
import React, { useState, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Lock,
  Trash2,
  Info 
} from 'lucide-react';
import { Permission } from '../../types/role';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Alert } from '../ui/alert';
import LoadingSpinner from '../LoadingSpinner';

interface PermissionEditorProps {
  permission?: Permission | null; // Changed from Permission | undefined
  existingPermissions: Permission[];
  onSave: (data: Omit<Permission, 'id'>) => Promise<void>;
  onUpdate?: (id: string, data: Partial<Permission>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export const PermissionEditor: React.FC<PermissionEditorProps> = ({
  permission,
  existingPermissions,
  onSave,
  onUpdate,
  onDelete,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState<Omit<Permission, 'id'>>({
    name: permission?.name || '',
    description: permission?.description || '',
    category: permission?.category || '',
    type: permission?.type || 'custom',
    risk: permission?.risk || 'low',
    dependencies: permission?.dependencies || [],
    scope: permission?.scope || []
  });
  const [error, setError] = useState<string | null>(null);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      throw new Error('Permission name is required');
    }
    if (!formData.category.trim()) {
      throw new Error('Category is required');
    }
    
    // Check for circular dependencies
    const checkCircularDependency = (
      permId: string, 
      checked: Set<string> = new Set()
    ): boolean => {
      if (checked.has(permId)) return true;
      checked.add(permId);
      
      const permission = existingPermissions.find(p => p.id === permId);
      return permission?.dependencies?.some(depId => 
        checkCircularDependency(depId, new Set(checked))
      ) || false;
    };

    const wouldCreateCircular = formData.dependencies?.some(depId =>
      checkCircularDependency(depId)
    );

    if (wouldCreateCircular) {
      throw new Error('Circular dependency detected in permissions');
    }

    // Validate risk level based on dependencies
    const highRiskDeps = formData.dependencies?.filter(depId => {
      const dep = existingPermissions.find(p => p.id === depId);
      return dep?.risk === 'high';
    });

    if (highRiskDeps?.length && formData.risk !== 'high') {
      throw new Error('Permission must be high risk when depending on high risk permissions');
    }
  }, [formData, existingPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      validateForm();

      if (permission && onUpdate) {
        await onUpdate(permission.id, formData);
      } else {
        await onSave(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permission');
    }
  };

  const handleDelete = async () => {
    if (!permission || !onDelete) return;

    // Check if any roles or permissions depend on this one
    const dependentPermissions = existingPermissions.filter(p => 
      p.dependencies?.includes(permission.id)
    );

    if (dependentPermissions.length > 0) {
      setError(`Cannot delete permission: ${dependentPermissions.length} other permission(s) depend on it`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the permission "${permission.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await onDelete(permission.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete permission');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            <CardTitle>
              {permission ? 'Edit Permission' : 'Create New Permission'}
            </CardTitle>
          </div>
          {permission?.type === 'system' && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
              System Permission
            </span>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          {permission?.type === 'system' && (
            <Alert type="warning">
              <AlertTriangle className="h-4 w-4 mr-2" />
              System permissions can only be viewed, not modified
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., View Reports"
                disabled={permission?.type === 'system'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Describe what this permission allows"
                disabled={permission?.type === 'system'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Reports Management"
                  disabled={permission?.type === 'system'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Level
                </label>
                <select
                  value={formData.risk}
                  onChange={e => setFormData(prev => ({ ...prev, risk: e.target.value as Permission['risk'] }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={permission?.type === 'system'}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dependencies
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 dark:border-gray-600">
                {existingPermissions
                  .filter(p => p.id !== permission?.id)
                  .map(p => (
                    <div key={p.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.dependencies?.includes(p.id)}
                        onChange={(e) => {
                          const deps = formData.dependencies || [];
                          setFormData(prev => ({
                            ...prev,
                            dependencies: e.target.checked
                              ? [...deps, p.id]
                              : deps.filter(id => id !== p.id)
                          }));
                        }}
                        className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={permission?.type === 'system'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.risk === 'high' && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{p.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {permission && onDelete && permission.type !== 'system' && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Permission
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            {permission?.type !== 'system' && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Saving...
                  </span>
                ) : (
                  'Save Permission'
                )}
              </button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};