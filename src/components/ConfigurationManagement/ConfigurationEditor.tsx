// src/components/ConfigurationManagement/ConfigurationEditor.tsx

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Alert } from '../ui/alert';
import { 
  Configuration, 
  ConfigurationValue,
  ConfigurationEnvironment,
  ValidationResult,
  DependencyType,
  ConfigurationStatus,
  ConfigurationType
} from '../../types/configuration';
import { generateId } from '../../lib/utils';

interface ConfigurationEditorProps {
  configId?: string;
  environment: ConfigurationEnvironment;
  onSave: (data: Partial<Configuration>) => Promise<void>;
  onClose: () => void;
  initialData?: Configuration;
}

export const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({
  configId,
  environment,
  onSave,
  onClose,
  initialData
}) => {
    const [formData, setFormData] = useState<Partial<Configuration>>({
        name: '',
        description: '',
        type: 'application',
        values: [],
        status: 'active',
        validationRules: {
          required: [],
          format: {},
          range: {}
        },
        dependencies: [],
        metadata: {}
      });

  const [values, setValues] = useState<ConfigurationValue[]>(
    initialData?.values || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (values.length === 0) {
      newErrors.values = 'At least one configuration value is required';
    }

    values.forEach((value, index) => {
      if (!value.key.trim()) {
        newErrors[`value-${index}-key`] = 'Key is required';
      }
      if (value.value === undefined || value.value === '') {
        newErrors[`value-${index}-value`] = 'Value is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSave({
        ...formData,
        values,
        environment
      });
      onClose();
    } catch (error) {
      setErrors({
        submit: 'Failed to save configuration. Please try again.'
      });
    }
  };

  const addValue = () => {
    setValues([
      ...values,
      {
        id: `temp-${Date.now()}`,
        key: '',
        value: '',
        type: 'string',
        isEncrypted: false,
        isSecret: false
      }
    ]);
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, updates: Partial<ConfigurationValue>) => {
    setValues(values.map((value, i) => 
      i === index ? { ...value, ...updates } : value
    ));
  };

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {configId ? 'Edit Configuration' : 'New Configuration'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errors.submit && (
                <Alert type="error">{errors.submit}</Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
  value={formData.type}
  onChange={(e) => setFormData({ 
    ...formData, 
    type: e.target.value as ConfigurationType 
  })}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="application">Application</option>
  <option value="environment">Environment</option>
  <option value="feature">Feature Flag</option>
  <option value="security">Security</option>
  <option value="integration">Integration</option>
</select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim())
                    })}
                    placeholder="Enter tags separated by commas"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Configuration Values */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Configuration Values</h3>
                  <button
                    type="button"
                    onClick={addValue}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Value
                  </button>
                </div>

                {values.map((value, index) => (
                  <div 
                    key={value.id} 
                    className="p-4 border rounded-lg bg-gray-50 space-y-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Key
                        </label>
                        <input
                          type="text"
                          value={value.key}
                          onChange={(e) => updateValue(index, { key: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors[`value-${index}-key`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`value-${index}-key`]}
                          </p>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Value
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type={value.isSecret && !showSecrets[value.id] ? "password" : "text"}
                            value={value.value as string}
                            onChange={(e) => updateValue(index, { value: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                          />
                          {value.isSecret && (
                            <button
                              type="button"
                              onClick={() => setShowSecrets({
                                ...showSecrets,
                                [value.id]: !showSecrets[value.id]
                              })}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showSecrets[value.id] ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                        {errors[`value-${index}-value`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`value-${index}-value`]}
                          </p>
                        )}
                      </div>

                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
  value={formData.status || 'active'}
  onChange={(e) => setFormData({ 
    ...formData, 
    status: e.target.value as ConfigurationStatus 
  })}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="pending">Pending</option>
  <option value="archived">Archived</option>
</select>
                      </div>

                      <div className="pt-6 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => updateValue(index, { isSecret: !value.isSecret })}
                          className={`p-2 rounded-md ${
                            value.isSecret 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {value.isSecret ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeValue(index)}
                          className="p-2 rounded-md bg-red-100 text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Value Metadata */}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value.isEncrypted}
                          onChange={(e) => updateValue(index, { isEncrypted: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        />
                        Encrypt Value
                      </label>
                    </div>
                  </div>
                ))}
                
                {errors.values && (
                  <p className="mt-1 text-sm text-red-600">{errors.values}</p>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
  value={formData.status || 'active'}
  onChange={(e) => setFormData({ 
    ...formData, 
    status: e.target.value as ConfigurationStatus 
  })}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="pending">Pending</option>
  <option value="archived">Archived</option>
</select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Validation Rules
                  </label>
                  <div className="mt-2 space-y-2">
                  <label className="flex items-center">
  <input
    type="checkbox"
    checked={Boolean(formData.validationRules?.required?.length)}
    onChange={(e) => {
      const defaultValues = formData.values || [];
      setFormData({
        ...formData,
        validationRules: {
          ...formData.validationRules,
          required: e.target.checked ? defaultValues.map(v => v.key).filter(Boolean) : []
        }
      });
    }}
    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
  />
  <span className="ml-2 text-sm text-gray-700">
    Make all fields required
  </span>
</label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!formData.validationRules?.format}
                        onChange={(e) => setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            format: e.target.checked ? {} : undefined
                          }
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                      />
                      Enable format validation
                    </label>
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dependencies
                  </label>
                  <div className="mt-2 space-y-2">
                    {formData.dependencies?.map((dep, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
  value={dep.type}
  onChange={(e) => {
    const newDeps = [...(formData.dependencies || [])];
    newDeps[index] = { 
      ...dep, 
      type: e.target.value as DependencyType 
    };
    setFormData({ ...formData, dependencies: newDeps });
  }}
  className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
>
  <option value="requires">Requires</option>
  <option value="conflicts">Conflicts</option>
  <option value="recommends">Recommends</option>
</select>
                        <input
                          type="text"
                          value={dep.dependsOn}
                          onChange={(e) => {
                            const newDeps = [...(formData.dependencies || [])];
                            newDeps[index] = { ...dep, dependsOn: e.target.value };
                            setFormData({ ...formData, dependencies: newDeps });
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Configuration ID or name"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDeps = formData.dependencies?.filter((_, i) => i !== index);
                            setFormData({ ...formData, dependencies: newDeps });
                          }}
                          className="p-2 rounded-md text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        dependencies: [
                          ...(formData.dependencies || []),
                          { id: generateId(), configurationId: '', dependsOn: '', type: 'requires' }
                        ]
                      })}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Add Dependency
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  {configId ? 'Update Configuration' : 'Create Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
};