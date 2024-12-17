// src/hooks/useFeature.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { FeatureService } from '../services/featureService';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import {
  Feature,
  FeatureAuditLogs,
  FeatureTemplate,
  FeatureComparison,
  FeatureEnvironment,
  FeatureVersion,
  FeaturePromotion,
  FeatureExperiment,
  FeatureMetrics
} from '../types/feature';

export function useFeature() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [templates, setTemplates] = useState<FeatureTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<FeatureAuditLogs[]>([]);
  const [versions, setVersions] = useState<Record<string, FeatureVersion[]>>({});
  const [promotions, setPromotions] = useState<FeaturePromotion[]>([]);
  const [experiments, setExperiments] = useState<FeatureExperiment[]>([]);
  const [metrics, setMetrics] = useState<Record<string, FeatureMetrics[]>>({});
  const [environmentComparison, setEnvironmentComparison] = useState<FeatureComparison | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<FeatureEnvironment>('development');
  
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);
  const featureService = useRef(ApiServiceFactory.createService(FeatureService));
  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (loadingRef.current || !isMountedRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      if (!isInitializedRef.current && ApiServiceFactory.getConfig().useMock) {
        await featureService.current.initializeMockData();
      }

      const [
        featuresResponse,
        templatesResponse,
        auditResponse,
        experimentsResponse
      ] = await Promise.all([
        featureService.current.getFeatures(selectedEnvironment),
        featureService.current.getTemplates(),
        featureService.current.getAuditLogs(),
        featureService.current.getExperiments()
      ]);

      if (!isMountedRef.current) return;

      setFeatures(featuresResponse.data);
      setTemplates(templatesResponse.data);
      setAuditLogs(auditResponse.data);
      setExperiments(experimentsResponse.data);

      const versionsMap: Record<string, FeatureVersion[]> = {};
      const metricsMap: Record<string, FeatureMetrics[]> = {};

      await Promise.all(
        featuresResponse.data.map(async (feature: Feature) => {
          const [versionsResponse, metricsResponse] = await Promise.all([
            featureService.current.getFeatureVersions(feature.id),
            featureService.current.getMetrics(feature.id, selectedEnvironment, {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            })
          ]);

          if (isMountedRef.current) {
            versionsMap[feature.id] = versionsResponse.data;
            metricsMap[feature.id] = metricsResponse.data;
          }
        })
      );

      if (isMountedRef.current) {
        setVersions(versionsMap);
        setMetrics(metricsMap);
        setError(null);
        isInitializedRef.current = true;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load feature data'));
        console.error('Load feature data error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, [selectedEnvironment]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const createFeature = useCallback(async (data: Partial<Feature>) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.createFeature(data);
      if (isMountedRef.current) {
        await loadData();
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadData]);

  const updateFeature = useCallback(async (id: string, data: Partial<Feature>) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.updateFeature(id, data);
      if (isMountedRef.current) {
        await loadData();
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadData]);

  const deleteFeature = useCallback(async (id: string) => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await featureService.current.deleteFeature(id);
      if (isMountedRef.current) {
        await loadData();
      }
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadData]);

  const rollbackVersion = useCallback(async (featureId: string, version: number) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.rollbackVersion(featureId, version);
      if (isMountedRef.current) {
        await loadData();
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadData]);

  const promoteFeature = useCallback(async (
    featureId: string,
    sourceEnv: FeatureEnvironment,
    targetEnv: FeatureEnvironment
  ) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.promoteFeature(featureId, sourceEnv, targetEnv);
      if (isMountedRef.current) {
        setPromotions(prev => [...prev, response.data]);
        await loadData();
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadData]);

  const createExperiment = useCallback(async (data: Partial<FeatureExperiment>) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.createExperiment(data);
      if (isMountedRef.current) {
        setExperiments(prev => [...prev, response.data]);
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const compareEnvironments = useCallback(async (
    env1: FeatureEnvironment,
    env2: FeatureEnvironment
  ) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await featureService.current.compareEnvironments(env1, env2);
      if (isMountedRef.current) {
        setEnvironmentComparison(response.data);
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return;
    await loadData();
  }, [loadData]);

  return {
    features,
    templates,
    auditLogs,
    versions,
    promotions,
    experiments,
    metrics,
    environmentComparison,
    selectedEnvironment,
    loading,
    error,
    setSelectedEnvironment,
    createFeature,
    updateFeature,
    deleteFeature,
    rollbackVersion,
    promoteFeature,
    createExperiment,
    compareEnvironments,
    refetch
  };
}