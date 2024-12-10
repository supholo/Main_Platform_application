import {
  Environment,
  Pipeline,
  PipelineRun,
  PipelineStep,
} from "../types/cicd";
import { BaseApiService } from "./core/BaseApiService";
import { ApiResponse } from "./core/types";
import { mockDb } from "./mockDb/MockDatabase";
import { generateId } from "../lib/utils";
import { ApiServiceFactory } from "./core/ApiServiceFactory";

// src/services/cicdService.ts
const generateMockPipelines = (): Pipeline[] => {
  const pipelines: Pipeline[] = [
    {
      id: "pipeline-1",
      name: "Frontend Build & Deploy",
      description: "Build and deploy frontend application",
      provider: "github",
      type: "build",
      configuration: {
        repository: "org/frontend-app",
        branch: "main",
        trigger: {
          type: "push",
          branches: ["main", "develop"],
        },
        environments: ["development", "staging", "production"],
        steps: [
          {
            id: "step-1",
            name: "Install Dependencies",
            type: "script",
            configuration: {
              script: "npm install",
            },
            order: 1,
          },
          {
            id: "step-2",
            name: "Run Tests",
            type: "test",
            configuration: {
              script: "npm test",
              artifacts: {
                paths: ["coverage/"],
              },
            },
            order: 2,
          },
          {
            id: "step-3",
            name: "Build",
            type: "script",
            configuration: {
              script: "npm run build",
              artifacts: {
                paths: ["dist/"],
              },
            },
            order: 3,
          },
          {
            id: "step-4",
            name: "Deploy",
            type: "deploy",
            configuration: {
              script: "deploy.sh",
              conditions: {
                environment: ["production"],
                requiresApproval: true,
              },
            },
            order: 4,
          },
        ],
        notifications: {
          slack: "#deployments",
          email: ["team@example.com"],
        },
      },
      status: "success",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-03-15T10:30:00Z",
      lastRun: "2024-03-15T10:30:00Z",
    },
    // Add more mock pipelines...
  ];

  return pipelines;
};

const generateMockEnvironments = (): Environment[] => {
  const environments: Environment[] = [
    {
      id: "env-1",
      name: "Development",
      type: "development",
      status: "active",
      variables: {
        API_URL: "https://api.dev.example.com",
        FEATURE_FLAGS: "debug,beta",
      },
      protection: {
        requiresApproval: false,
      },
      deployments: {
        current: {
          version: "1.2.0",
          timestamp: "2024-03-15T10:30:00Z",
          status: "stable",
        },
        history: [
          {
            version: "1.2.0",
            timestamp: "2024-03-15T10:30:00Z",
            status: "success",
          },
          {
            version: "1.1.0",
            timestamp: "2024-03-14T15:45:00Z",
            status: "success",
          },
        ],
      },
    },
    {
      id: "env-2",
      name: "Production",
      type: "production",
      status: "active",
      variables: {
        API_URL: "https://api.example.com",
        FEATURE_FLAGS: "production",
      },
      protection: {
        requiresApproval: true,
        approvers: ["team-leads"],
        restrictions: {
          branches: ["main"],
          time: {
            start: "09:00",
            end: "17:00",
            timezone: "UTC",
          },
        },
      },
      deployments: {
        current: {
          version: "1.1.0",
          timestamp: "2024-03-10T14:20:00Z",
          status: "stable",
        },
        history: [
          {
            version: "1.1.0",
            timestamp: "2024-03-10T14:20:00Z",
            status: "success",
          },
          {
            version: "1.0.0",
            timestamp: "2024-03-01T11:30:00Z",
            status: "success",
          },
        ],
      },
    },
  ];

  return environments;
};

const generateMockPipelineRun = (
  pipelineId: string,
  environment: string,
  steps: PipelineStep[]
): PipelineRun => ({
  id: generateId("run-"),
  pipelineId,
  trigger: {
    type: "manual",
    source: "api",
    user: "current-user",
  },
  status: "running",
  startTime: new Date().toISOString(),
  environment,
  steps: steps.map((step) => ({
    id: step.id,
    name: step.name,
    status: "pending",
    startTime: new Date().toISOString(),
  })),
});

export class CICDService extends BaseApiService {
  private pipelineRuns: Record<string, PipelineRun[]> = {};
  private initialized = false;
  async getPipelines(): Promise<ApiResponse<Pipeline[]>> {
    return this.request<Pipeline[]>("/pipelines");
  }

  async getPipeline(id: string): Promise<ApiResponse<Pipeline>> {
    return this.request<Pipeline>(`/pipelines/${id}`);
  }

  async createPipeline(
    data: Omit<Pipeline, "id">
  ): Promise<ApiResponse<Pipeline>> {
    return this.request<Pipeline>("/pipelines", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePipeline(
    id: string,
    data: Partial<Pipeline>
  ): Promise<ApiResponse<Pipeline>> {
    return this.request<Pipeline>(`/pipelines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePipeline(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/pipelines/${id}`, {
      method: "DELETE",
    });
  }

  async getEnvironments(): Promise<ApiResponse<Environment[]>> {
    return this.request<Environment[]>("/environments");
  }

  async createEnvironment(
    data: Omit<Environment, "id">
  ): Promise<ApiResponse<Environment>> {
    return this.request<Environment>("/environments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEnvironment(
    id: string,
    data: Partial<Environment>
  ): Promise<ApiResponse<Environment>> {
    return this.request<Environment>(`/environments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEnvironment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/environments/${id}`, {
      method: "DELETE",
    });
  }

  async getPipelineRuns(
    pipelineId: string
  ): Promise<ApiResponse<PipelineRun[]>> {
    return this.request<PipelineRun[]>(`/pipelines/${pipelineId}/runs`);
  }

  async triggerPipeline(
    pipelineId: string,
    options: { environment: string }
  ): Promise<ApiResponse<PipelineRun>> {
    return this.request<PipelineRun>(`/pipelines/${pipelineId}/trigger`, {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  protected async getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Helper function to safely parse JSON
    const parseData = (data: any) => {
      if (!data) return data;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    };

    const parsedData = parseData(data);

    switch (true) {
      case endpoint === "/pipelines" && method === "GET":
        const pipelines = await mockDb.find<Pipeline>("pipelines");
        return { data: pipelines as T };

      case endpoint === "/pipelines" && method === "POST":
        const newPipeline: Pipeline = {
          id: generateId("pipeline-"),
          ...parsedData,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const createdPipeline = await mockDb.create<Pipeline>(
          "pipelines",
          newPipeline
        );
        return { data: createdPipeline as T };

      case endpoint.match(/^\/pipelines\/[^/]+$/) && method === "PUT":
        const pipelineId = endpoint.split("/")[2];
        const existingPipeline = await mockDb.findById<Pipeline>(
          "pipelines",
          pipelineId
        );
        if (!existingPipeline) throw new Error("Pipeline not found");
        const updatedPipeline = await mockDb.update<Pipeline>(
          "pipelines",
          pipelineId,
          {
            ...existingPipeline,
            ...parsedData,
            updatedAt: new Date().toISOString(),
          }
        );
        return { data: updatedPipeline as T };

      case endpoint.match(/^\/pipelines\/[^/]+$/) && method === "DELETE":
        const deletePipelineId = endpoint.split("/")[2];
        await mockDb.delete("pipelines", deletePipelineId);
        delete this.pipelineRuns[deletePipelineId];
        return { data: undefined as T };

      case endpoint === "/environments" && method === "GET":
        const environments = await mockDb.find<Environment>("environments");
        return { data: environments as T };

        case endpoint === '/environments' && method === 'POST':
          const envData = parseData(data);
          const newEnvironment: Environment = {
            id: generateId('env-'),
            name: envData.name,
            type: envData.type,
            status: 'active',
            variables: envData.variables || {},
            protection: {
              requiresApproval: envData.protection?.requiresApproval || false,
              approvers: envData.protection?.approvers || [],
              restrictions: {
                branches: envData.protection?.restrictions?.branches || [],
                time: {
                  start: envData.protection?.restrictions?.time?.start || '09:00',
                  end: envData.protection?.restrictions?.time?.end || '17:00',
                  timezone: envData.protection?.restrictions?.time?.timezone || 'UTC'
                }
              }
            },
            deployments: {
              history: [],
              ...(envData.deployments || {})
            }
          };
        
          const createdEnvironment = await mockDb.create<Environment>('environments', newEnvironment);
          return { data: createdEnvironment as T };

      case endpoint.match(/^\/environments\/[^/]+$/) && method === "PUT":
        const envId = endpoint.split("/")[2];
        const existingEnv = await mockDb.findById<Environment>(
          "environments",
          envId
        );
        if (!existingEnv) throw new Error("Environment not found");

        const envUpdates = parseData(data);
        const updatedEnv = await mockDb.update<Environment>(
          "environments",
          envId,
          {
            ...existingEnv,
            ...envUpdates,
            protection: {
              ...existingEnv.protection,
              ...envUpdates.protection,
            },
            deployments: {
              ...existingEnv.deployments,
              ...envUpdates.deployments,
            },
            variables: {
              ...existingEnv.variables,
              ...envUpdates.variables,
            },
          }
        );
        return { data: updatedEnv as T };

      case endpoint.match(/^\/environments\/[^/]+$/) && method === "DELETE":
        const deleteEnvId = endpoint.split("/")[2];
        await mockDb.delete("environments", deleteEnvId);
        return { data: undefined as T };

      // Pipeline runs endpoints
      case endpoint.match(/^\/pipelines\/[^/]+\/runs$/) && method === "GET":
        const runsForPipeline = this.pipelineRuns[endpoint.split("/")[2]] || [];
        return { data: runsForPipeline as T };

      case endpoint.match(/^\/pipelines\/[^/]+\/trigger$/) && method === "POST":
        const triggerPipelineId = endpoint.split("/")[2];
        const pipeline = await mockDb.findById<Pipeline>(
          "pipelines",
          triggerPipelineId
        );
        if (!pipeline) throw new Error("Pipeline not found");

        const options = parseData(data);

        // Validate required fields
        if (!options.environment) {
          throw new Error("Environment is required to trigger pipeline");
        }

        const newRun = generateMockPipelineRun(
          triggerPipelineId,
          options.environment,
          pipeline.configuration.steps
        );

        if (!this.pipelineRuns[triggerPipelineId]) {
          this.pipelineRuns[triggerPipelineId] = [];
        }
        this.pipelineRuns[triggerPipelineId].unshift(newRun);

        // Start pipeline simulation
        this.simulatePipelineRun(triggerPipelineId, newRun.id).catch(
          console.error
        );

        return { data: newRun as T };

        if (!this.pipelineRuns[triggerPipelineId]) {
          this.pipelineRuns[triggerPipelineId] = [];
        }
        this.pipelineRuns[triggerPipelineId].unshift(newRun);

        // Start pipeline simulation
        this.simulatePipelineRun(triggerPipelineId, newRun.id);

        return { data: newRun as T };

      default:
        throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
    }
  }

  private async simulatePipelineRun(pipelineId: string, runId: string) {
    const getRun = () =>
      this.pipelineRuns[pipelineId]?.find((r) => r.id === runId);
    const updateRun = (updates: Partial<PipelineRun>) => {
      const index = this.pipelineRuns[pipelineId]?.findIndex(
        (r) => r.id === runId
      );
      if (index !== undefined && index !== -1) {
        this.pipelineRuns[pipelineId][index] = {
          ...this.pipelineRuns[pipelineId][index],
          ...updates,
        };
      }
    };

    const run = getRun();
    if (!run) return;

    for (const step of run.steps) {
      // Update step status to running
      step.status = "running";
      updateRun({ steps: [...run.steps] });

      // Simulate step execution time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 80% chance of success
      step.status = Math.random() < 0.8 ? "success" : "failed";
      step.duration = Math.floor(Math.random() * 10) + 5;
      updateRun({ steps: [...run.steps] });

      if (step.status === "failed") {
        updateRun({
          status: "failed",
          duration: run.steps
            .filter((s) => s.duration)
            .reduce((total, s) => total + (s.duration || 0), 0),
        });
        return;
      }
    }

    // All steps completed successfully
    updateRun({
      status: "success",
      duration: run.steps
        .filter((s) => s.duration)
        .reduce((total, s) => total + (s.duration || 0), 0),
    });
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        // Initialize collections if they don't exist
        const existingPipelines = await mockDb.find<Pipeline>('pipelines');
        const existingEnvironments = await mockDb.find<Environment>('environments');

        if (existingPipelines.length === 0) {
          await mockDb.seed('pipelines', generateMockPipelines());
        }
        if (existingEnvironments.length === 0) {
          await mockDb.seed('environments', generateMockEnvironments());
        }
        
        this.initialized = true;
        console.log('CICD mock data initialized successfully');
      } catch (error) {
        console.error('Failed to initialize CICD mock data:', error);
        throw error;
      }
    }
  }
}

export const cicdService = ApiServiceFactory.createService(CICDService);
