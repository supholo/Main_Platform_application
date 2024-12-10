import React, { useState } from "react";
import { Shield, Plus, Trash2, Save, Clock, X } from "lucide-react";
import { Environment, EnvironmentType } from "../../types/cicd";

interface EnvironmentEditorProps {
  environment?: Environment;
  onSave: (environment: Omit<Environment, 'id'>) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}

interface EnvironmentFormData {
  name: string;
  type: EnvironmentType;
  status: "active" | "inactive" | "maintenance";
  variables: Record<string, string>;
  protection: {
    requiresApproval: boolean;
    approvers: string[];
    restrictions: {
      branches: string[];
      time: {
        start: string;
        end: string;
        timezone: string;
      };
    };
  };
}

interface EnvironmentVariable {
  key: string;
  value: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  submit?: string;
  [key: string]: string | undefined;
}

const defaultFormData: EnvironmentFormData = {
  name: "",
  type: "development",
  status: "active",
  variables: {},
  protection: {
    requiresApproval: false,
    approvers: [],
    restrictions: {
      branches: [],
      time: {
        start: "09:00",
        end: "17:00",
        timezone: "UTC",
      },
    },
  },
};

const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({
  environment,
  onSave,
  onCancel,
  isNew = false,
}) => {
  const [formData, setFormData] = useState<EnvironmentFormData>(() => {
    const initialData: EnvironmentFormData = {
      ...defaultFormData,
      ...environment,
      protection: {
        ...defaultFormData.protection,
        ...(environment?.protection || {}),
        approvers: environment?.protection?.approvers || [],
        restrictions: {
          ...defaultFormData.protection.restrictions,
          ...(environment?.protection?.restrictions || {}),
          branches: environment?.protection?.restrictions?.branches || [],
          time: {
            start:
              environment?.protection?.restrictions?.time?.start ||
              defaultFormData.protection.restrictions.time.start,
            end:
              environment?.protection?.restrictions?.time?.end ||
              defaultFormData.protection.restrictions.time.end,
            timezone:
              environment?.protection?.restrictions?.time?.timezone ||
              defaultFormData.protection.restrictions.time.timezone,
          },
        },
      },
    };
    return initialData;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [newVariable, setNewVariable] = useState<EnvironmentVariable>({
    key: "",
    value: "",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.type) newErrors.type = "Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Format the environment data before saving, excluding the id field
      const environmentData: Omit<Environment, 'id'> = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        deployments: {
          history: environment?.deployments?.history || [],
          current: environment?.deployments?.current,
          ...(environment?.deployments || {})
        },
        variables: {
          ...formData.variables
        },
        protection: {
          requiresApproval: formData.protection.requiresApproval,
          approvers: formData.protection.approvers || [],
          restrictions: {
            branches: formData.protection.restrictions.branches || [],
            time: {
              start: formData.protection.restrictions.time.start,
              end: formData.protection.restrictions.time.end,
              timezone: formData.protection.restrictions.time.timezone
            }
          }
        }
      };
  
      await onSave(environmentData);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const addVariable = () => {
    if (!newVariable.key.trim()) return;

    setFormData((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        [newVariable.key]: newVariable.value,
      },
    }));
    setNewVariable({ key: "", value: "" });
  };

  const removeVariable = (key: string) => {
    setFormData((prev) => {
      const { [key]: removed, ...rest } = prev.variables;
      return {
        ...prev,
        variables: rest,
      };
    });
  };

  const addBranchRestriction = (branch: string) => {
    if (!branch.trim()) return;

    setFormData((prev) => ({
      ...prev,
      protection: {
        ...prev.protection,
        restrictions: {
          ...prev.protection.restrictions,
          branches: [...prev.protection.restrictions.branches, branch],
        },
      },
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget;
      addBranchRestriction(input.value);
      input.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isNew ? "Create Environment" : "Edit Environment"}
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
            Save Environment
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Environment Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as EnvironmentType,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Environment Variables
          </h3>

          <div className="space-y-2">
            {Object.entries(formData.variables).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  readOnly
                  className="flex-1 rounded-md border-gray-300 bg-gray-50"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      variables: {
                        ...prev.variables,
                        [key]: e.target.value,
                      },
                    }))
                  }
                  className="flex-1 rounded-md border-gray-300"
                />
                <button
                  onClick={() => removeVariable(key)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="KEY"
                value={newVariable.key}
                onChange={(e) =>
                  setNewVariable((prev) => ({ ...prev, key: e.target.value }))
                }
                className="flex-1 rounded-md border-gray-300"
              />
              <input
                type="text"
                placeholder="Value"
                value={newVariable.value}
                onChange={(e) =>
                  setNewVariable((prev) => ({ ...prev, value: e.target.value }))
                }
                className="flex-1 rounded-md border-gray-300"
              />
              <button
                onClick={addVariable}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Protection Rules */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Protection Rules
          </h3>

          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.protection.requiresApproval}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    protection: {
                      ...prev.protection,
                      requiresApproval: e.target.checked,
                    },
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Require approval before deployment
              </span>
            </label>

            {formData.protection.requiresApproval && (
              <div className="pl-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deployment Window
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <input
                      type="time"
                      value={formData.protection.restrictions.time.start}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          protection: {
                            ...prev.protection,
                            restrictions: {
                              ...prev.protection.restrictions,
                              time: {
                                ...prev.protection.restrictions.time,
                                start: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="rounded-md border-gray-300"
                    />
                    <input
                      type="time"
                      value={formData.protection.restrictions.time.end}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          protection: {
                            ...prev.protection,
                            restrictions: {
                              ...prev.protection.restrictions,
                              time: {
                                ...prev.protection.restrictions.time,
                                end: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="rounded-md border-gray-300"
                    />
                    <select
                      value={formData.protection.restrictions.time.timezone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          protection: {
                            ...prev.protection,
                            restrictions: {
                              ...prev.protection.restrictions,
                              time: {
                                ...prev.protection.restrictions.time,
                                timezone: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="rounded-md border-gray-300"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST</option>
                      <option value="America/Los_Angeles">PST</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protected Branches
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.protection.restrictions.branches.map((branch) => (
                      <span
                        key={branch}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {branch}
                        <button
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              protection: {
                                ...prev.protection,
                                restrictions: {
                                  ...prev.protection.restrictions,
                                  branches:
                                    prev.protection.restrictions.branches.filter(
                                      (b) => b !== branch
                                    ),
                                },
                              },
                            }));
                          }}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add branch (e.g., main)"
                      className="flex-1 rounded-md border-gray-300"
                      onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          const input = e.currentTarget;
                          addBranchRestriction(input.value);
                          input.value = "";
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentEditor;
