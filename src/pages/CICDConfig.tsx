import React, { useState, useEffect } from "react";
import {
  GitBranch,
  GitPullRequest,
  Play,
  Settings,
  Clock,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  Package,
  Server,
  Shield,
  Plus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "../components/ui/Card";
import { Alert } from "../components/ui/alert";
import LoadingSpinner from "../components/LoadingSpinner";
import { Pipeline, Environment, PipelineRun } from "../types/cicd";
import PipelineEditor from "../components/cicd/PipelineEditor";
import EnvironmentEditor from "../components/cicd/EnvironmentEditor";
import PipelineRunDetails from "../components/cicd/PipelineRunDetails";
import PipelineTrigger from "../components/cicd/PipelineTrigger";
import { useCICD } from "../hooks/useCICD";

const CICDConfig: React.FC = () => {
  // Existing state
  const {
    pipelines,
    environments,
    pipelineRuns,
    loading,
    error,
    createPipeline,
    updatePipeline,
    createEnvironment,
    updateEnvironment,
    triggerPipeline,
    loadPipelineRuns,
    refetch,
  } = useCICD();

  // New state for modals
  const [isConfiguringPipeline, setIsConfiguringPipeline] = useState(false);
  const [isConfiguringEnvironment, setIsConfiguringEnvironment] =
    useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(
    null
  );
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Environment | null>(null);
  const [showPipelineRun, setShowPipelineRun] = useState<{
    pipelineId: string;
    runId: string;
  } | null>(null);
  const [showTriggerModal, setShowTriggerModal] = useState<Pipeline | null>(
    null
  );

  const handleCreatePipeline = async (data: Omit<Pipeline, "id">) => {
    try {
      await createPipeline(data);
      setIsConfiguringPipeline(false);
      await refetch(); // Ensure we get the latest data
    } catch (error) {
      console.error("Failed to create pipeline:", error);
      throw error;
    }
  };

  const handleUpdatePipeline = async (id: string, data: Partial<Pipeline>) => {
    try {
      await updatePipeline(id, data);
      setSelectedPipeline(null);
      await refetch(); // Ensure we get the latest data
    } catch (error) {
      console.error("Failed to update pipeline:", error);
      throw error;
    }
  };

  const handleCreateEnvironment = async (data: Omit<Environment, "id">) => {
    try {
      await createEnvironment(data);
      setIsConfiguringEnvironment(false);
      await refetch(); // Ensure we get the latest data
    } catch (error) {
      console.error("Failed to create environment:", error);
      throw error;
    }
  };

  const handleUpdateEnvironment = async (
    id: string,
    data: Partial<Environment>
  ) => {
    try {
      await updateEnvironment(id, data);
      setSelectedEnvironment(null);
      await refetch(); // Ensure we get the latest data
    } catch (error) {
      console.error("Failed to update environment:", error);
      throw error;
    }
  };

  const handleTriggerPipeline = async (
    pipeline: Pipeline,
    options: { environment: string }
  ) => {
    try {
      await triggerPipeline(pipeline.id, options);
      setShowTriggerModal(null);
      await loadPipelineRuns(pipeline.id);
      await refetch(); // Ensure we get the latest data
    } catch (error) {
      console.error("Failed to trigger pipeline:", error);
      throw error;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "success":
        return "text-green-500 dark:text-green-400";
      case "failed":
        return "text-red-500 dark:text-red-400";
      case "running":
        return "text-blue-500 dark:text-blue-400";
      case "cancelled":
        return "text-gray-500 dark:text-gray-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "failed":
        return <X className="h-5 w-5 text-red-500" />;
      case "running":
        return <Play className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "cancelled":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          CI/CD Configuration
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsConfiguringEnvironment(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          >
            <Server className="h-4 w-4 mr-2" />
            Add Environment
          </button>
          <button
            onClick={() => setIsConfiguringPipeline(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </button>
        </div>
      </div>

      {/* Existing Environment Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Deployment environments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((env) => (
              <div
                key={env.id}
                className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedEnvironment(env)}
              >
                {/* Existing environment card content */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {env.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {env.type}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      env.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {env.status}
                  </span>
                </div>

                {env.deployments.current && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Current Version
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {env.deployments.current.version}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Last Deployed
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(
                          env.deployments.current.timestamp
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`font-medium ${
                          env.deployments.current.status === "stable"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {env.deployments.current.status}
                      </span>
                    </div>
                  </div>
                )}

                {env.protection.requiresApproval && (
                  <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <Shield className="h-4 w-4 mr-1" />
                    Requires approval
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Pipelines Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pipelines</CardTitle>
          <CardDescription>Build and deployment pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
              >
                {/* Existing pipeline content */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {pipeline.name}
                      </h3>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          pipeline.status
                        )}`}
                      >
                        {getStatusIcon(pipeline.status)}
                        <span className="ml-1">{pipeline.status}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {pipeline.description}
                    </p>

                    {/* Pipeline actions */}
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => setShowTriggerModal(pipeline)}
                        className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Trigger
                      </button>
                      <button
                        onClick={() => setSelectedPipeline(pipeline)}
                        className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Components */}
      {isConfiguringPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <PipelineEditor
              onSave={handleCreatePipeline}
              onCancel={() => setIsConfiguringPipeline(false)}
              environments={environments}
              isNew
            />
          </div>
        </div>
      )}

      {selectedPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <PipelineEditor
              pipeline={selectedPipeline}
              onSave={(data) => handleUpdatePipeline(selectedPipeline.id, data)}
              onCancel={() => setSelectedPipeline(null)}
              environments={environments}
            />
          </div>
        </div>
      )}

      {isConfiguringEnvironment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <EnvironmentEditor
              onSave={handleCreateEnvironment}
              onCancel={() => setIsConfiguringEnvironment(false)}
              isNew
            />
          </div>
        </div>
      )}

      {selectedEnvironment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <EnvironmentEditor
              environment={selectedEnvironment}
              onSave={(data) =>
                handleUpdateEnvironment(selectedEnvironment.id, data)
              }
              onCancel={() => setSelectedEnvironment(null)}
            />
          </div>
        </div>
      )}

      {showPipelineRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <PipelineRunDetails
              pipelineId={showPipelineRun.pipelineId}
              runId={showPipelineRun.runId}
              onClose={() => setShowPipelineRun(null)}
              onRetry={async () => {
                const pipeline = pipelines.find(
                  (p) => p.id === showPipelineRun.pipelineId
                );
                if (pipeline) {
                  await handleTriggerPipeline(pipeline, {
                    environment: pipeline.configuration.environments[0],
                  });
                }
              }}
            />
          </div>
        </div>
      )}

      {showTriggerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <PipelineTrigger
              pipeline={showTriggerModal}
              environments={environments}
              onTrigger={(options) =>
                handleTriggerPipeline(showTriggerModal, options)
              }
              onClose={() => setShowTriggerModal(null)}
            />
          </div>
        </div>
      )}

      {/* Pipeline Runs Overview */}
      {selectedPipeline && pipelineRuns[selectedPipeline.id] && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pipeline Runs - {selectedPipeline.name}</CardTitle>
                <CardDescription>
                  Recent pipeline executions and their status
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedPipeline(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineRuns[selectedPipeline.id].map((run) => (
                <div
                  key={run.id}
                  className="border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                  onClick={() =>
                    setShowPipelineRun({
                      pipelineId: selectedPipeline.id,
                      runId: run.id,
                    })
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(run.status)}
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Run #{run.id}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Started {new Date(run.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Duration:{" "}
                      {run.duration ? `${run.duration}s` : "In progress"}
                    </div>
                  </div>

                  {/* Run Steps Summary */}
                  <div className="mt-4 space-y-2">
                    {run.steps.map((step) => (
                      <div key={step.id} className="flex items-center text-sm">
                        {getStatusIcon(step.status)}
                        <div className="ml-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {step.name}
                          </span>
                          {step.duration && (
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                              ({step.duration}s)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Environment Info */}
                  {run.environment && (
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Server className="h-4 w-4 mr-1" />
                      Environment: {run.environment}
                    </div>
                  )}

                  {/* Commit Info if available */}
                  {run.commit && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <GitBranch className="h-4 w-4 mr-1" />
                        {run.commit.hash.substring(0, 7)} - {run.commit.message}
                      </div>
                      <div className="ml-5 text-xs">by {run.commit.author}</div>
                    </div>
                  )}
                </div>
              ))}

              {pipelineRuns[selectedPipeline.id].length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pipeline runs yet</p>
                  <button
                    onClick={() => setShowTriggerModal(selectedPipeline)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Trigger First Run
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Protection Details */}
      {selectedEnvironment && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  Environment Details - {selectedEnvironment.name}
                </CardTitle>
                <CardDescription>
                  Protection rules and deployment history
                </CardDescription>
              </div>
              <button
                onClick={() => setSelectedEnvironment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Protection Rules */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Protection Rules
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Approval Required:{" "}
                      {selectedEnvironment.protection.requiresApproval
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>
                  {selectedEnvironment.protection.approvers && (
                    <div className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Approvers:{" "}
                      {selectedEnvironment.protection.approvers.join(", ")}
                    </div>
                  )}
                  {selectedEnvironment.protection.restrictions?.branches && (
                    <div className="ml-6">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Protected Branches:
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedEnvironment.protection.restrictions.branches.map(
                          (branch) => (
                            <span
                              key={branch}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            >
                              {branch}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {selectedEnvironment.protection.restrictions?.time && (
                    <div className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Deployment Window:{" "}
                      {selectedEnvironment.protection.restrictions.time.start} -{" "}
                      {selectedEnvironment.protection.restrictions.time.end}{" "}
                      {
                        selectedEnvironment.protection.restrictions.time
                          .timezone
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Deployment History */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Deployment History
                </h4>
                <div className="space-y-2">
                  {selectedEnvironment.deployments.history.map(
                    (deployment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center">
                          {getStatusIcon(deployment.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Version {deployment.version}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(deployment.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deployment.status === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {deployment.status}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CICDConfig;
