// src/components/FeatureManagement/FeatureEditor.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Percent,
  Target
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Alert } from '../ui/alert';
import { Switch } from '../ui/switch';
import { 
  Feature, 
  FeatureEnvironment,
  FeatureType,
  FeatureValue,
  FeatureRule 
} from '../../types/feature';
import { generateId } from '../../lib/utils';

interface FeatureEditorProps {
  featureId?: string | null;
  environment: FeatureEnvironment;
  onSave: (data: Partial<Feature>) => Promise<void>;
  onClose: () => void;
  initialData?: Feature;
}

export const FeatureEditor: React.FC<FeatureEditorProps> = ({
  featureId,
  environment,
  onSave,
  onClose,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Feature>>({
    name: '',
    key: '',
    description: '',
    type: 'release',
    status: 'active',
    environment: environment, // Added environment property
    values: [],
    tags: [],
    metadata: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<FeatureValue[]>(initialData?.values || []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setValues(initialData.values);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.key?.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, and underscores';
    }

    if (values.length === 0) {
      newErrors.values = 'At least one environment configuration is required';
    }

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
        submit: 'Failed to save feature. Please try again.'
      });
    }
  };

  const addValue = () => {
    setValues([
      ...values,
      {
        id: generateId(),
        environment: environment,
        enabled: false,
        rolloutPercentage: 100,
        rules: []
      }
    ]);
  };

  const addRule = (valueIndex: number) => {
    const newValues = [...values];
    newValues[valueIndex].rules.push({
      id: generateId(),
      type: 'user',
      condition: {
        attribute: 'email',
        operator: 'equals',
        value: ''
      },
      enabled: true
    });
    setValues(newValues);
  };

  const updateValue = (index: number, updates: Partial<FeatureValue>) => {
    setValues(values.map((value, i) => 
      i === index ? { ...value, ...updates } : value
    ));
  };

  const updateRule = (valueIndex: number, ruleIndex: number, updates: Partial<FeatureRule>) => {
    const newValues = [...values];
    newValues[valueIndex].rules[ruleIndex] = {
      ...newValues[valueIndex].rules[ruleIndex],
      ...updates
    };
    setValues(newValues);
  };

  const removeRule = (valueIndex: number, ruleIndex: number) => {
    const newValues = [...values];
    newValues[valueIndex].rules.splice(ruleIndex, 1);
    setValues(newValues);
  };

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {featureId ? 'Edit Feature' : 'New Feature'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
              {errors.submit && (
                <Alert type="error">{errors.submit}</Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Feature Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                    placeholder="Enter feature name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Feature Key
                  </label>
                  <input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                    className="mt-1"
                    placeholder="feature_key"
                  />
                  {errors.key && (
                    <p className="mt-1 text-sm text-red-600">{errors.key}</p>
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FeatureType })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="release">Release Toggle</option>
                    <option value="experiment">Experiment Toggle</option>
                    <option value="operational">Operational Toggle</option>
                    <option value="permission">Permission Toggle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="mt-1"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>

              {/* Environment Values */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Environment Configuration
                  </h3>
                  <button
                    type="button"
                    onClick={addValue}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Environment
                  </button>
                </div>

                {values.map((value, valueIndex) => (
                  <div
                    key={value.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
                  >
                    {/* Environment Settings */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Environment
                        </label>
                        <select
                          value={value.environment}
                          onChange={(e) => updateValue(valueIndex, {
                            environment: e.target.value as FeatureEnvironment
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="development">Development</option>
                          <option value="qa">QA</option>
                          <option value="staging">Staging</option>
                          <option value="production">Production</option>
                        </select>
                      </div>

                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Rollout Percentage
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={value.rolloutPercentage}
                            onChange={(e) => updateValue(valueIndex, {
                              rolloutPercentage: Number(e.target.value)
                            })}
                            className="block w-full pr-12 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <Percent className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 flex items-end">
                        <label className="flex items-center space-x-2">
                          <Switch
                            checked={value.enabled}
                            onCheckedChange={(checked) => updateValue(valueIndex, { enabled: checked })}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {value.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Targeting Rules */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-900">
                          Targeting Rules
                        </h4>
                        <button
                          type="button"
                          onClick={() => addRule(valueIndex)}
                          className="inline-flex items-center px-2 py-1 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Rule
                        </button>
                      </div>

                      {value.rules.map((rule, ruleIndex) => (
                        <div
                          key={rule.id}
                          className="p-3 border border-gray-200 rounded-md bg-white space-y-3"
                        >
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-3">
                              <select
                                value={rule.type}
                                onChange={(e) => updateRule(valueIndex, ruleIndex, {
                                  type: e.target.value as 'user' | 'group' | 'environment' | 'percentage' | 'custom'
                                })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="user">User</option>
                                <option value="group">User Group</option>
                                <option value="environment">Environment</option>
                                <option value="percentage">Percentage</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>

                            <div className="col-span-3">
                              <input
                                type="text"
                                value={rule.condition.attribute || ''}
                                onChange={(e) => updateRule(valueIndex, ruleIndex, {
                                  condition: { ...rule.condition, attribute: e.target.value }
                                })}
                                placeholder="Attribute"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>

                            <div className="col-span-2">
                              <select
                                value={rule.condition.operator}
                                onChange={(e) => updateRule(valueIndex, ruleIndex, {
                                  condition: { ...rule.condition, operator: e.target.value as any }
                                })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                                <option value="startsWith">Starts With</option>
                                <option value="endsWith">Ends With</option>
                                <option value="matches">Matches</option>
                                <option value="greaterThan">Greater Than</option>
                                <option value="lessThan">Less Than</option>
                              </select>
                            </div>

                            <div className="col-span-3">
                              <input
                                type="text"
                                value={rule.condition.value || ''}
                                onChange={(e) => updateRule(valueIndex, ruleIndex, {
                                  condition: { ...rule.condition, value: e.target.value }
                                })}
                                placeholder="Value"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>

                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeRule(valueIndex, ruleIndex)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={(checked) => updateRule(valueIndex, ruleIndex, { enabled: checked })}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-500">
                              Rule {rule.enabled ? 'enabled' : 'disabled'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {value.rules.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-3">
                          No targeting rules defined
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {values.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No environments configured
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding an environment configuration
                    </p>
                    <button
                      type="button"
                      onClick={addValue}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Environment
                    </button>
                  </div>
                )}
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
                  {featureId ? 'Update Feature' : 'Create Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
};