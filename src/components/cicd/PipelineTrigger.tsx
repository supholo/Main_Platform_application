import React, { useState } from 'react';
import { Play, AlertCircle, X, Plus, Info } from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  type: string;
  configuration: {
    variables?: string[];
    [key: string]: any;
  };
}

interface Pipeline {
  id: string;
  name: string;
  configuration: {
    steps: PipelineStep[];
    [key: string]: any;
  };
}

interface Environment {
  id: string;
  name: string;
  protection?: {
    requiresApproval?: boolean;
    approvers?: string[];
  };
}

interface PipelineTriggerProps {
  pipeline: Pipeline;
  environments: Environment[];
  onTrigger: (options: { environment: string; variables: Record<string, string> }) => Promise<void>;
  onClose: () => void;
}

interface CustomVariable {
  key: string;
  value: string;
}

const PipelineTrigger: React.FC<PipelineTriggerProps> = ({
  pipeline,
  environments,
  onTrigger,
  onClose
}) => {
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState<CustomVariable>({ key: '', value: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEnv) {
      setError('Please select an environment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine predefined and custom variables
      const allVariables = {
        ...variables,
        ...Object.fromEntries(customVariables.map(v => [v.key, v.value]))
      };

      await onTrigger({
        environment: selectedEnv,
        variables: allVariables
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCustomVariable = () => {
    if (!newVariable.key.trim()) return;
    
    setCustomVariables(prev => [...prev, { ...newVariable }]);
    setNewVariable({ key: '', value: '' });
  };

  const removeCustomVariable = (index: number) => {
    setCustomVariables(prev => prev.filter((_, i) => i !== index));
  };

  const selectedEnvironment = environments.find(env => env.name === selectedEnv);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Trigger Pipeline: {pipeline.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure and start a new pipeline run
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Environment Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Environment
            </label>
            <select
              value={selectedEnv}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEnv(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select Environment</option>
              {environments.map((env) => (
                <option 
                  key={env.id} 
                  value={env.name}
                  disabled={env.protection?.requiresApproval && !env.protection?.approvers?.includes('current-user')}
                >
                  {env.name} {env.protection?.requiresApproval && '(Requires Approval)'}
                </option>
              ))}
            </select>
          </div>

          {selectedEnvironment?.protection?.requiresApproval && (
            <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <Info className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-200">
                <p className="font-medium">Approval Required</p>
                <p className="mt-1">
                  Deployments to this environment require approval from designated approvers.
                  The pipeline will be queued for review.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Variables */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pipeline Variables
            </label>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure variables used in pipeline steps
            </p>
          </div>

          {/* Required Variables */}
          {pipeline.configuration.steps.map((step) => (
            step.configuration.variables?.map((variable: string) => (
              <div key={`${step.id}-${variable}`} className="flex gap-2">
                <input
                  type="text"
                  value={variable}
                  readOnly
                  className="flex-1 rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={variables[variable] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariables(prev => ({
                    ...prev,
                    [variable]: e.target.value
                  }))}
                  placeholder="Variable value"
                  className="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            ))
          ))}

          {/* Custom Variables */}
          <div className="space-y-2">
            {customVariables.map((variable, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={variable.key}
                  readOnly
                  className="flex-1 rounded-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = [...customVariables];
                    updated[index].value = e.target.value;
                    setCustomVariables(updated);
                  }}
                  className="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeCustomVariable(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add Custom Variable */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariable.key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                placeholder="Variable name"
                className="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                value={newVariable.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Variable value"
                className="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={addCustomVariable}
                disabled={!newVariable.key.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900/50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedEnv}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Triggering...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Trigger Pipeline
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PipelineTrigger;