// src/components/ConfigurationManagement/ConfigurationTemplate.tsx

import React, { useState } from 'react';
import {
  FileCode,
  Plus,
  Copy,
  Edit,
  Trash2,
  Tag,
  Check,
  X,
  Eye,
  EyeOff,
  Book,
  RefreshCw,
  Filter,
  Shield,
  Lock,
  Unlock,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Dialog } from '../ui/dialog';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Configuration,
  ConfigurationTemplate,
  ConfigurationType,
  ConfigurationValue,
  ConfigurationValueType
} from '../../types/configuration';
import { generateId } from '../../lib/utils';

// Define additional types
interface SecretVisibility {
  [key: string]: boolean;
}

interface EditingTemplate extends Omit<ConfigurationTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  defaultValues: ConfigurationValue[];
}

interface ConfigurationTemplatesProps {
  templates: ConfigurationTemplate[];
  onUseTemplate: (templateId: string, data: Partial<Configuration>) => Promise<void>;
  onCreateTemplate: (template: Partial<ConfigurationTemplate>) => Promise<void>;
  onUpdateTemplate?: (id: string, template: Partial<ConfigurationTemplate>) => Promise<void>;
  onDeleteTemplate?: (id: string) => Promise<void>;
}

export const ConfigurationTemplates: React.FC<ConfigurationTemplatesProps> = ({
  templates,
  onUseTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate
}) => {
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigurationTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ConfigurationType | 'all'>('all');
  const [showSecrets, setShowSecrets] = useState<SecretVisibility>({});

  // Initialize editing template state
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate>({
    name: '',
    description: '',
    type: 'application',
    defaultValues: [],
    validationRules: {
      required: [],
      format: {},
      range: {}
    },
    metadata: {},
    version: 1
  });

  // Template actions
  const handleCreateTemplate = async () => {
    try {
      // Ensure all required fields are present
      const templateData: Partial<ConfigurationTemplate> = {
        ...editingTemplate,
        defaultValues: editingTemplate.defaultValues.map(value => ({
          ...value,
          id: value.id || generateId('val-')
        }))
      };

      await onCreateTemplate(templateData);
      setShowCreateModal(false);
      resetEditingTemplate();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUseTemplate = async (template: ConfigurationTemplate) => {
    try {
      // Ensure all values have required fields
      const configValues: ConfigurationValue[] = template.defaultValues.map(value => ({
        id: generateId('val-'),
        key: value.key,
        value: value.value,
        type: value.type,
        isEncrypted: value.isEncrypted,
        isSecret: value.isSecret
      }));

      const configData: Partial<Configuration> = {
        name: `New ${template.name}`,
        description: template.description,
        type: template.type,
        values: configValues,
        validationRules: template.validationRules,
        metadata: {
          ...template.metadata,
          template: template.id
        }
      };

      await onUseTemplate(template.id, configData);
      setShowUseModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const resetEditingTemplate = () => {
    setEditingTemplate({
      name: '',
      description: '',
      type: 'application',
      defaultValues: [],
      validationRules: {
        required: [],
        format: {},
        range: {}
      },
      metadata: {},
      version: 1
    });
  };

  // Template Card Component
  const TemplateCard: React.FC<{
    template: ConfigurationTemplate;
    onSelect: () => void;
  }> = ({ template, onSelect }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium flex items-center">
              <FileCode className="h-5 w-5 mr-2 text-indigo-500" />
              {template.name}
              <Badge variant="outline" className="ml-2">
                {template.type}
              </Badge>
            </h3>
            <p className="mt-1 text-sm text-gray-500">{template.description}</p>

            {/* Template Properties */}
            <div className="mt-4 space-y-2">
              {/* Default Values Preview */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Default Values:</p>
                <div className="flex flex-wrap gap-2">
                  {template.defaultValues.map((value, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center"
                    >
                      <span className="font-medium">{value.key}</span>
                      {!value.isSecret && (
                        <span className="ml-2 text-gray-500">
                          = {typeof value.value === 'object' 
                              ? 'JSON' 
                              : String(value.value).substring(0, 20)}
                        </span>
                      )}
                      {value.isSecret && (
                        <Shield className="h-4 w-4 ml-2 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Rules */}
              {template.validationRules?.required && template.validationRules.required.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Required Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.validationRules.required.map((field, index) => (
                      <Badge key={index} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Book className="h-4 w-4 mr-1" />
                  Version {template.version}
                </div>
                {template.updatedAt && (
                  <div>
                    Updated {format(new Date(template.updatedAt), 'PP')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onSelect}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Copy className="h-4 w-4 mr-1" />
              Use Template
            </button>
            {onUpdateTemplate && (
              <button
                onClick={() => {
                  setEditingTemplate({
                    ...template,
                    id: template.id
                  });
                  setShowCreateModal(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDeleteTemplate && (
              <button
                onClick={() => onDeleteTemplate(template.id)}
                className="p-1 text-red-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Continue with part 2...

  // Template Editor Modal
  const TemplateEditor = () => (
    <Dialog
      isOpen={showCreateModal}
      onClose={() => {
        setShowCreateModal(false);
        resetEditingTemplate();
      }}
    >
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingTemplate.id ? 'Edit Template' : 'Create Template'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetEditingTemplate();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Configuration Type
                  </label>
                  <select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
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
              </div>

              {/* Default Values */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Default Values</h3>
                  <button
                    onClick={() => {
                      const newValue: ConfigurationValue = {
                        id: generateId('val-'),
                        key: '',
                        value: '',
                        type: 'string',
                        isEncrypted: false,
                        isSecret: false
                      };
                      setEditingTemplate({
                        ...editingTemplate,
                        defaultValues: [...editingTemplate.defaultValues, newValue]
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Value
                  </button>
                </div>

                {editingTemplate.defaultValues.map((value, index) => (
                  <div key={value.id} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Key
                        </label>
                        <input
                          type="text"
                          value={value.key}
                          onChange={(e) => {
                            const newValues = [...editingTemplate.defaultValues];
                            newValues[index] = { ...value, key: e.target.value };
                            setEditingTemplate({
                              ...editingTemplate,
                              defaultValues: newValues
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Value
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type={value.isSecret && !showSecrets[value.id] ? "password" : "text"}
                            value={String(value.value)}
                            onChange={(e) => {
                              const newValues = [...editingTemplate.defaultValues];
                              newValues[index] = { ...value, value: e.target.value };
                              setEditingTemplate({
                                ...editingTemplate,
                                defaultValues: newValues
                              });
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          {value.isSecret && (
                            <button
                              type="button"
                              onClick={() => setShowSecrets(prev => ({
                                ...prev,
                                [value.id]: !prev[value.id]
                              }))}
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
                      </div>

                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          value={value.type}
                          onChange={(e) => {
                            const newValues = [...editingTemplate.defaultValues];
                            newValues[index] = { 
                              ...value, 
                              type: e.target.value as ConfigurationValueType 
                            };
                            setEditingTemplate({
                              ...editingTemplate,
                              defaultValues: newValues
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>

                      <div className="pt-6 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newValues = [...editingTemplate.defaultValues];
                            newValues[index] = { ...value, isSecret: !value.isSecret };
                            setEditingTemplate({
                              ...editingTemplate,
                              defaultValues: newValues
                            });
                          }}
                          className="p-2 rounded-md"
                        >
                          {value.isSecret ? 
                            <Lock className="h-4 w-4 text-yellow-500" /> : 
                            <Unlock className="h-4 w-4 text-gray-400" />
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newValues = editingTemplate.defaultValues.filter((_, i) => i !== index);
                            setEditingTemplate({
                              ...editingTemplate,
                              defaultValues: newValues
                            });
                          }}
                          className="p-2 rounded-md text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validation Rules</h3>

                {/* Required Fields */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTemplate.validationRules?.required?.length > 0}
                      onChange={(e) => {
                        const defaultValues = editingTemplate.defaultValues;
                        const requiredFields = e.target.checked
                          ? defaultValues.map(v => v.key).filter(Boolean)
                          : [];
                        setEditingTemplate({
                          ...editingTemplate,
                          validationRules: {
                            ...editingTemplate.validationRules,
                            required: requiredFields
                          }
                        });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Make all fields required
                    </span>
                  </label>
                </div>

                {/* Format Rules */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Format Rules</h4>
                  {editingTemplate.defaultValues.map((value) => (
                    <div key={value.id} className="ml-4 mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!editingTemplate.validationRules?.format?.[value.key]}
                          onChange={(e) => {
                            const newFormat = { 
                              ...editingTemplate.validationRules?.format 
                            };
                            if (e.target.checked) {
                              newFormat[value.key] = value.type === 'string' ? '.*' : '';
                            } else {
                              delete newFormat[value.key];
                            }
                            setEditingTemplate({
                              ...editingTemplate,
                              validationRules: {
                                ...editingTemplate.validationRules,
                                format: newFormat
                              }
                            });
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{value.key}</span>
                      </label>
                      {editingTemplate.validationRules?.format?.[value.key] && (
                        <input
                          type="text"
                          value={editingTemplate.validationRules.format[value.key]}
                          onChange={(e) => {
                            setEditingTemplate({
                              ...editingTemplate,
                              validationRules: {
                                ...editingTemplate.validationRules,
                                format: {
                                  ...editingTemplate.validationRules.format,
                                  [value.key]: e.target.value
                                }
                              }
                            });
                          }}
                          placeholder={value.type === 'string' ? 'Regex pattern' : 'Format rule'}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Range Validations */}
                {editingTemplate.defaultValues.filter(v => v.type === 'number').map((value) => (
                  <div key={value.id}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Range for {value.key}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500">Min</label>
                        <input
                          type="number"
                          value={editingTemplate.validationRules?.range?.[value.key]?.min ?? ''}
                          onChange={(e) => {
                            const minValue = e.target.value ? Number(e.target.value) : undefined;
                            setEditingTemplate({
                              ...editingTemplate,
                              validationRules: {
                                ...editingTemplate.validationRules,
                                range: {
                                  ...editingTemplate.validationRules?.range,
                                  [value.key]: {
                                    ...editingTemplate.validationRules?.range?.[value.key],
                                    min: minValue
                                  }
                                }
                              }
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Max</label>
                        <input
                          type="number"
                          value={editingTemplate.validationRules?.range?.[value.key]?.max ?? ''}
                          onChange={(e) => {
                            const maxValue = e.target.value ? Number(e.target.value) : undefined;
                            setEditingTemplate({
                              ...editingTemplate,
                              validationRules: {
                                ...editingTemplate.validationRules,
                                range: {
                                  ...editingTemplate.validationRules?.range,
                                  [value.key]: {
                                    ...editingTemplate.validationRules?.range?.[value.key],
                                    max: maxValue
                                  }
                                }
                              }
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Metadata */}
              <div>
                <h3 className="text-lg font-medium mb-4">Additional Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.metadata?.category || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        metadata: {
                          ...editingTemplate.metadata,
                          category: e.target.value
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={editingTemplate.metadata?.priority?.toString() || '0'}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        metadata: {
                          ...editingTemplate.metadata,
                          priority: Number(e.target.value)
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Fields
                    </label>
                    <textarea
                      value={editingTemplate.metadata?.customFields 
                        ? JSON.stringify(editingTemplate.metadata.customFields, null, 2)
                        : ''}
                      onChange={(e) => {
                        try {
                          const customFields = e.target.value ? JSON.parse(e.target.value) : {};
                          setEditingTemplate({
                            ...editingTemplate,
                            metadata: {
                              ...editingTemplate.metadata,
                              customFields
                            }
                          });
                        } catch (error) {
                          // Handle JSON parse error if needed
                        }
                      }}
                      placeholder="Enter JSON format custom fields"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetEditingTemplate();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                {editingTemplate.id ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Configuration Templates</h2>
          <p className="text-sm text-gray-500">
            Create and manage reusable configuration templates
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              resetEditingTemplate();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ConfigurationType | 'all')}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="application">Application</option>
          <option value="environment">Environment</option>
          <option value="feature">Feature Flag</option>
          <option value="security">Security</option>
          <option value="integration">Integration</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6">
        {templates
          .filter(template =>
            (selectedType === 'all' || template.type === selectedType) &&
            (template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             template.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => {
                setSelectedTemplate(template);
                setShowUseModal(true);
              }}
            />
          ))
        }
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileCode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new template
          </p>
          <button
            onClick={() => {
              resetEditingTemplate();
              setShowCreateModal(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <TemplateEditor />}

      {/* Use Template Modal */}
      {showUseModal && selectedTemplate && (
        <Dialog
          isOpen={showUseModal}
          onClose={() => {
            setShowUseModal(false);
            setSelectedTemplate(null);
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Use Template</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create a new configuration using this template as a starting point.
            </p>
            <button
              onClick={() => handleUseTemplate(selectedTemplate)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Create from Template
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ConfigurationTemplates;