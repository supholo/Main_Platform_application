// src/hooks/useConfiguration.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { ConfigurationService } from '../services/configurationService';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import {
  Configuration,
  ConfigurationAuditLog,
  ConfigurationTemplate,
  ConfigurationComparison,
  ConfigurationEnvironment,
  ValidationResult,
  ConfigurationVersion,
  ConfigurationPromotion
} from '../types/configuration';

export function useConfiguration() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<ConfigurationAuditLog[]>([]);
  const [versions, setVersions] = useState<Record<string, ConfigurationVersion[]>>({});
  const [promotions, setPromotions] = useState<ConfigurationPromotion[]>([]);
  const [environmentComparison, setEnvironmentComparison] = useState<ConfigurationComparison | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ConfigurationEnvironment>('development');
  
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);
  const configurationService = useRef(ApiServiceFactory.createService(ConfigurationService));
  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (loadingRef.current || !isMountedRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      if (!isInitializedRef.current && ApiServiceFactory.getConfig().useMock) {
        await configurationService.current.initializeMockData();
      }

      const [
        configsResponse,
        templatesResponse,
        auditResponse
      ] = await Promise.all([
        configurationService.current.getConfigurations(selectedEnvironment),
        configurationService.current.getTemplates(),
        configurationService.current.getAuditLogs()
      ]);

      if (!isMountedRef.current) return;

      setConfigurations(configsResponse.data);
      setTemplates(templatesResponse.data);
      setAuditLogs(auditResponse.data);

      const versionsMap: Record<string, ConfigurationVersion[]> = {};
      await Promise.all(
        configsResponse.data.map(async (config) => {
          const versionsResponse = await configurationService.current.getConfigurationVersions(config.id);
          if (isMountedRef.current) {
            versionsMap[config.id] = versionsResponse.data;
          }
        })
      );

      if (isMountedRef.current) {
        setVersions(versionsMap);
        setError(null);
        isInitializedRef.current = true;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load configuration data'));
        console.error('Load configuration data error:', err);
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

  useEffect(() => {
    if (isInitializedRef.current) {
      loadData();
    }
  }, [selectedEnvironment, loadData]);

  const createConfiguration = useCallback(async (data: Partial<Configuration>) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.createConfiguration(data);
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

  const updateConfiguration = useCallback(async (id: string, data: Partial<Configuration>) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.updateConfiguration(id, data);
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

  const deleteConfiguration = useCallback(async (id: string) => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await configurationService.current.deleteConfiguration(id);
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

  const rollbackVersion = useCallback(async (configId: string, version: number) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.rollbackVersion(configId, version);
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

  const promoteConfiguration = useCallback(async (
    configId: string,
    sourceEnv: ConfigurationEnvironment,
    targetEnv: ConfigurationEnvironment
  ) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.promoteConfiguration(configId, sourceEnv, targetEnv);
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

  const compareEnvironments = useCallback(async (
    env1: ConfigurationEnvironment,
    env2: ConfigurationEnvironment
  ) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.compareEnvironments(env1, env2);
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

  const createFromTemplate = useCallback(async (
    templateId: string,
    data: Partial<Configuration>
  ) => {
    if (!isMountedRef.current) return null;
    try {
      setLoading(true);
      const response = await configurationService.current.createFromTemplate(templateId, data);
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

  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return;
    await loadData();
  }, [loadData]);

  return {
    configurations,
    templates,
    auditLogs,
    versions,
    promotions,
    environmentComparison,
    selectedEnvironment,
    loading,
    error,
    setSelectedEnvironment,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    rollbackVersion,
    promoteConfiguration,
    compareEnvironments,
    createFromTemplate,
    refetch
  };
}