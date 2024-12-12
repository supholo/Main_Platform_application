import React, { useState } from 'react';
import { Server, GitBranch, Globe, Database, Plus, Trash2, AlertCircle, CheckCircle2, XCircle, Link, Settings, Loader2, Box, Monitor, Cloud } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
  CardAction 
} from '../../ui/Card';
import { Alert } from '../../ui/alert';

export interface ApplicationConfig {
  id: string;
  name: string;
  type: 'microservice' | 'webapp' | 'api' | 'database';
  repository: string;
  branch: string;
  environment: 'development' | 'staging' | 'production';
  deploymentStrategy: 'rolling' | 'blue-green' | 'canary';
  healthCheck: {
    endpoint: string;
    interval: number;
    timeout: number;
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetCPUUtilization: number;
  };
  dependencies?: string[];
  secrets?: string[];
  environmentVariables: Record<string, string>;
  status: 'configuring' | 'validating' | 'ready' | 'error';
  validationMessage?: string;
}

interface ApplicationsStepProps {
  applications: ApplicationConfig[];
  onAdd: () => void;
  onUpdate: (index: number, data: ApplicationConfig) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
}

export const defaultApplication: Omit<ApplicationConfig, 'id'> = {
  name: '',
  type: 'microservice',
  repository: '',
  branch: 'main',
  environment: 'development',
  deploymentStrategy: 'rolling',
  healthCheck: {
    endpoint: '/health',
    interval: 30,
    timeout: 5
  },
  scaling: {
    minInstances: 1,
    maxInstances: 3,
    targetCPUUtilization: 70
  },
  environmentVariables: {},
  status: 'configuring'
};

export const ApplicationsStep: React.FC<ApplicationsStepProps> = ({
  applications,
  onAdd,
  onUpdate,
  onRemove,
  errors
}) => {
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddApplication = () => {
    onAdd();
  };

  const handleRemoveApplication = (id: string) => {
    const index = applications.findIndex(app => app.id === id);
    if (index !== -1) {
      onRemove(index);
    }
  };

  const handleUpdateApplication = (id: string, updates: Partial<ApplicationConfig>) => {
    const index = applications.findIndex(app => app.id === id);
    if (index !== -1) {
      onUpdate(index, { ...applications[index], ...updates });
    }
  };

  const validateApplication = async (app: ApplicationConfig): Promise<boolean> => {
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic validation
    if (!app.name.trim()) {
      handleUpdateApplication(app.id, {
        status: 'error',
        validationMessage: 'Application name is required'
      });
      return false;
    }

    if (!app.repository.trim()) {
      handleUpdateApplication(app.id, {
        status: 'error',
        validationMessage: 'Repository URL is required'
      });
      return false;
    }

    // Simulate repository validation
    if (!app.repository.startsWith('https://')) {
      handleUpdateApplication(app.id, {
        status: 'error',
        validationMessage: 'Invalid repository URL'
      });
      return false;
    }

    handleUpdateApplication(app.id, { status: 'ready', validationMessage: undefined });
    return true;
  };

  const handleValidateAll = async () => {
    setValidating(true);
    setValidationError(null);

    try {
      const validationResults = await Promise.all(
        applications.map(app => validateApplication(app))
      );

      const isValid = validationResults.every(Boolean);
      // Placeholder for onValidationComplete function
      // onValidationComplete(isValid);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const getStatusIcon = (status: ApplicationConfig['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'validating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Application Configuration
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add and configure your applications for monitoring
          </p>
        </div>
        <button
          onClick={handleAddApplication}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </button>
      </div>

      {validationError && (
        <Alert type="error">
          {validationError}
        </Alert>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Server className="h-6 w-6 text-indigo-500" />
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {app.name || 'New Application'}
                  </CardTitle>
                  {getStatusIcon(app.status)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveApplication(app.id)}
                    className="p-2 text-red-400 hover:text-red-500 dark:text-red-300 dark:hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {app.validationMessage && (
                <Alert type="error" className="mt-2">
                  {app.validationMessage}
                </Alert>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={app.name}
                      onChange={e => handleUpdateApplication(app.id, { name: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., User Service"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Type
                    </label>
                    <select
                      value={app.type}
                      onChange={e => handleUpdateApplication(app.id, { type: e.target.value as ApplicationConfig['type'] })}
                      className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="microservice">Microservice</option>
                      <option value="webapp">Web Application</option>
                      <option value="api">API Service</option>
                      <option value="database">Database</option>
                    </select>
                  </div>
                </div>

                {/* Repository Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repository URL
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 sm:text-sm">
                        <GitBranch className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={app.repository}
                        onChange={e => handleUpdateApplication(app.id, { repository: e.target.value })}
                        className="flex-1 w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://github.com/org/repo"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={app.branch}
                      onChange={e => handleUpdateApplication(app.id, { branch: e.target.value })}
                      className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="main"
                    />
                  </div>
                </div>

                {/* Advanced Configuration (shown when expanded) */}
                {expandedApp === app.id && (
                  <div className="mt-6 space-y-6 border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Environment
                        </label>
                        <select
                          value={app.environment}
                          onChange={e => handleUpdateApplication(app.id, { environment: e.target.value as ApplicationConfig['environment'] })}
                          className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="development">Development</option>
                          <option value="staging">Staging</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Deployment Strategy
                        </label>
                        <select
                          value={app.deploymentStrategy}
                          onChange={e => handleUpdateApplication(app.id, { deploymentStrategy: e.target.value as ApplicationConfig['deploymentStrategy'] })}
                          className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="rolling">Rolling Update</option>
                          <option value="blue-green">Blue/Green</option>
                          <option value="canary">Canary</option>
                        </select>
                      </div>
                    </div>

                    {/* Health Check Configuration */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Health Check
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Endpoint
                          </label>
                          <input
                            type="text"
                            value={app.healthCheck.endpoint}
                            onChange={e => handleUpdateApplication(app.id, {
                              healthCheck: { ...app.healthCheck, endpoint: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Interval (seconds)
                          </label>
                          <input
                            type="number"
                            value={app.healthCheck.interval}
                            onChange={e => handleUpdateApplication(app.id, {
                              healthCheck: { ...app.healthCheck, interval: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Timeout (seconds)
                          </label>
                          <input
                            type="number"
                            value={app.healthCheck.timeout}
                            onChange={e => handleUpdateApplication(app.id, {
                              healthCheck: { ...app.healthCheck, timeout: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scaling Configuration */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Auto Scaling
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Min Instances
                          </label>
                          <input
                            type="number"
                            value={app.scaling.minInstances}
                            onChange={e => handleUpdateApplication(app.id, {
                              scaling: { ...app.scaling, minInstances: parseInt(e.target.value) }
                            })}
                            min={1}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Max Instances
                          </label>
                          <input
                            type="number"
                            value={app.scaling.maxInstances}
                            onChange={e => handleUpdateApplication(app.id, {
                              scaling: { ...app.scaling, maxInstances: parseInt(e.target.value) }
                            })}
                            min={1}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Target CPU %
                          </label>
                          <input
                            type="number"
                            value={app.scaling.targetCPUUtilization}
                            onChange={e => handleUpdateApplication(app.id, {
                              scaling: { ...app.scaling, targetCPUUtilization: parseInt(e.target.value) }
                            })}
                            min={1}
                            max={100}
                            className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Environment Variables */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Environment Variables
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(app.environmentVariables).map(([key, value], index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={key}
                              onChange={e => {
                                const newVars = { ...app.environmentVariables };
                                delete newVars[key];
                                newVars[e.target.value] = value;
                                handleUpdateApplication(app.id, { environmentVariables: newVars });
                              }}
                              placeholder="KEY"
                              className="flex-1 px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={e => {
                                handleUpdateApplication(app.id, {
                                  environmentVariables: {
                                    ...app.environmentVariables,
                                    [key]: e.target.value
                                  }
                                });
                              }}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                              onClick={() => {
                                const newVars = { ...app.environmentVariables };
                                delete newVars[key];
                                handleUpdateApplication(app.id, { environmentVariables: newVars });
                              }}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            handleUpdateApplication(app.id, {
                              environmentVariables: {
                                ...app.environmentVariables,
                                '': ''
                              }
                            });
                          }}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variable
                        </button>
                      </div>
                    </div>

                    {/* Dependencies */}
                    {applications.length > 1 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Dependencies
                        </h4>
                        <div className="space-y-2">
                          {applications
                            .filter(a => a.id !== app.id)
                            .map(dependency => (
                              <label
                                key={dependency.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={app.dependencies?.includes(dependency.id) || false}
                                  onChange={e => {
                                    const newDeps = e.target.checked
                                      ? [...(app.dependencies || []), dependency.id]
                                      : (app.dependencies || []).filter(id => id !== dependency.id);
                                    handleUpdateApplication(app.id, { dependencies: newDeps });
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {dependency.name || 'Unnamed Application'}
                                </span>
                              </label>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {app.status === 'ready' ? (
                    <span className="text-green-500">Configuration validated</span>
                  ) : app.status === 'error' ? (
                    <span className="text-red-500">Configuration error</span>
                  ) : (
                    'Configure application settings above'
                  )}
                </div>
                <button
                  onClick={() => validateApplication(app)}
                  disabled={app.status === 'validating'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {app.status === 'validating' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating
                    </>
                  ) : (
                    'Validate'
                  )}
                </button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <Server className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first application
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddApplication}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </button>
          </div>
        </div>
      )}

      {applications.length > 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleAddApplication}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another
          </button>
          <button
            onClick={handleValidateAll}
            disabled={validating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {validating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating All
              </>
            ) : (
              'Validate All'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationsStep;

