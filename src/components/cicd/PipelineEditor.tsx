import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Save,
  X,
  GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Pipeline, PipelineStep, Environment } from '../../types/cicd';

interface PipelineEditorProps {
  pipeline?: Pipeline;
  environments: Environment[];
  onSave: (pipeline: Pipeline) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

interface FormStepType {
  value: string;
  label: string;
}

interface PipelineFormState {
  name: string;
  description: string;
  provider: string;
  type: string;
  configuration: {
    repository: string;
    branch: string;
    trigger: {
      type: string;
      branches: string[];  // Always initialized as an array
    };
    environments: string[];
    steps: Array<{
      id: string;
      name: string;
      type: string;
      configuration: {
        script?: string;
        [key: string]: any;
      };
      order: number;
    }>;
    notifications: {
      slack?: string;  // Made optional to match Pipeline type
      email: string[];  // Always initialized as an array
    };
  };
}

const initialFormState: PipelineFormState = {
  name: '',
  description: '',
  provider: 'github',
  type: 'build',
  configuration: {
    repository: '',
    branch: 'main',
    trigger: {
      type: 'push',
      branches: ['main']
    },
    environments: [],
    steps: [],
    notifications: {
      slack: '',
      email: []
    }
  }
};

const PipelineEditor: React.FC<PipelineEditorProps> = ({ 
  pipeline,
  environments,
  onSave,
  onCancel,
  isNew = false
}) => {
  // Initialize form data with proper type handling
  const [formData, setFormData] = useState<PipelineFormState>(() => {
    if (pipeline) {
      return {
        ...initialFormState,
        ...pipeline,
        configuration: {
          ...initialFormState.configuration,
          ...pipeline.configuration,
          // Ensure arrays are properly initialized
          trigger: {
            type: pipeline.configuration.trigger.type,
            branches: pipeline.configuration.trigger.branches || ['main']
          },
          environments: pipeline.configuration.environments || [],
          notifications: {
            slack: pipeline.configuration.notifications?.slack || '',
            email: pipeline.configuration.notifications?.email || []
          }
        }
      };
    }
    return initialFormState;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const stepTypes: FormStepType[] = [
    { value: 'script', label: 'Script' },
    { value: 'test', label: 'Test' },
    { value: 'build', label: 'Build' },
    { value: 'deploy', label: 'Deploy' },
    { value: 'approval', label: 'Approval' }
  ];

  const handleStepDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const steps = Array.from(formData.configuration.steps);
    const [movedStep] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, movedStep);

    const reorderedSteps = steps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        steps: reorderedSteps
      }
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        steps: [
          ...prev.configuration.steps,
          {
            id: `step-${Date.now()}`,
            name: 'New Step',
            type: 'script',
            configuration: {
              script: ''
            },
            order: prev.configuration.steps.length + 1
          }
        ]
      }
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        steps: prev.configuration.steps.filter((_, i) => i !== index)
      }
    }));
  };

  const updateStep = (index: number, updates: Partial<PipelineFormState['configuration']['steps'][0]>) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        steps: prev.configuration.steps.map((step, i) =>
          i === index ? { ...step, ...updates } : step
        )
      }
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.configuration.repository) {
      newErrors['configuration.repository'] = 'Repository is required';
    }
    if (formData.configuration.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave(formData as unknown as Pipeline);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isNew ? 'Create Pipeline' : 'Edit Pipeline'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Pipeline
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pipeline Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="build">Build</option>
              <option value="deploy">Deploy</option>
              <option value="test">Test</option>
              <option value="release">Release</option>
            </select>
          </div>
        </div>

        {/* Repository Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Repository Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  <GitBranch className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={formData.configuration.repository}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      repository: e.target.value
                    }
                  }))}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="org/repo-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Branch
              </label>
              <input
                type="text"
                value={formData.configuration.branch}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: {
                    ...prev.configuration,
                    branch: e.target.value
                  }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Pipeline Steps
            </h3>
            <button
              onClick={addStep}
              className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </button>
          </div>

          <DragDropContext onDragEnd={handleStepDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {formData.configuration.steps.map((step, index) => (
                    <Draggable
                      key={step.id}
                      draggableId={step.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical className="w-6 h-6" />
                            </div>
                            
                            <div className="flex-1 grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={step.name}
                                  onChange={(e) => updateStep(index, { name: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Type
                                </label>
                                <select
                                  value={step.type}
                                  onChange={(e) => updateStep(index, { type: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                  {stepTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => removeStep(index)}
                                className="self-end flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Step-specific configuration */}
                          <div className="mt-4 ml-12">
                            {step.type === 'script' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Script
                                </label>
                                <textarea
                                  value={step.configuration.script || ''}
                                  onChange={(e) => updateStep(index, {
                                    configuration: { script: e.target.value }
                                  })}
                                  rows={3}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Environment Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Environment Configuration
          </h3>
          <div className="space-y-2">
            {environments.map(env => (
              <label key={env.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.configuration.environments.includes(env.name)}
                  onChange={(e) => {
                    const environments = e.target.checked
                      ? [...formData.configuration.environments, env.name]
                      : formData.configuration.environments.filter(name => name !== env.name);
                    setFormData(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        environments
                      }
                    }));
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{env.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineEditor;