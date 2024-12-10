import { useState, useCallback, useEffect, useRef } from 'react';
import { Pipeline, Environment, PipelineRun } from '../types/cicd';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import { CICDService } from '../services/cicdService';

// Type for creating a new pipeline
type CreatePipelineData = Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt' | 'lastRun'>;

export function useCICD() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<Record<string, PipelineRun[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitializedRef = useRef(false);

  const cicdService = ApiServiceFactory.createService(CICDService);

  const loadData = useCallback(async () => {
    if (!isInitializedRef.current) {
      try {
        setLoading(true);
        setError(null);
        
        const [pipelinesData, environmentsData] = await Promise.all([
          cicdService.getPipelines(),
          cicdService.getEnvironments()
        ]);

        setPipelines(pipelinesData.data);
        setEnvironments(environmentsData.data);
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load CICD configuration'));
      } finally {
        setLoading(false);
      }
    }
  }, [cicdService]);

  const initialize = useCallback(async () => {
    try {
      if (ApiServiceFactory.getConfig().useMock) {
        await cicdService.initializeMockData();
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize CICD'));
      throw err;
    }
  }, [cicdService, loadData]);

  // Update useEffect to use initialize
  useEffect(() => {
    if (!isInitializedRef.current) {
      initialize().catch(err => {
        console.error('Failed to initialize CICD:', err);
      });
    }
  }, [initialize]);

  const loadPipelineRuns = useCallback(async (pipelineId: string) => {
    try {
      const runs = await cicdService.getPipelineRuns(pipelineId);
      setPipelineRuns(prev => ({
        ...prev,
        [pipelineId]: runs.data
      }));
      return runs.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load pipeline runs'));
      throw err;
    }
  }, [cicdService]);

  const createPipeline = useCallback(async (data: CreatePipelineData) => {
    try {
      setLoading(true);
      const response = await cicdService.createPipeline({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setPipelines(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create pipeline'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  // Rest of the code remains exactly the same...
  const updatePipeline = useCallback(async (id: string, data: Partial<Pipeline>) => {
    try {
      setLoading(true);
      const response = await cicdService.updatePipeline(id, data);
      setPipelines(prev => 
        prev.map(pipeline => pipeline.id === id ? response.data : pipeline)
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update pipeline'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  const deletePipeline = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await cicdService.deletePipeline(id);
      setPipelines(prev => prev.filter(pipeline => pipeline.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete pipeline'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  const createEnvironment = useCallback(async (data: Omit<Environment, 'id'>) => {
    try {
      setLoading(true);
      const response = await cicdService.createEnvironment(data);
      setEnvironments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create environment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  const updateEnvironment = useCallback(async (id: string, data: Partial<Environment>) => {
    try {
      setLoading(true);
      const response = await cicdService.updateEnvironment(id, data);
      setEnvironments(prev => 
        prev.map(env => env.id === id ? response.data : env)
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update environment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  const deleteEnvironment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await cicdService.deleteEnvironment(id);
      setEnvironments(prev => prev.filter(env => env.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete environment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService]);

  const triggerPipeline = useCallback(async (pipelineId: string, options: { environment: string }) => {
    try {
      setLoading(true);
      const response = await cicdService.triggerPipeline(pipelineId, options);
      await loadPipelineRuns(pipelineId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to trigger pipeline'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cicdService, loadPipelineRuns]);

  const refetch = useCallback(async () => {
    isInitializedRef.current = false;
    return loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      loadData().catch(console.error);
    }
  }, [loadData]);

  return {
    pipelines,
    environments,
    pipelineRuns,
    loading,
    error,
    loadData,
    loadPipelineRuns,
    createPipeline,
    updatePipeline,
    deletePipeline,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    triggerPipeline,
    refetch,
    initialize  // Add initialize to the return object
  };
}