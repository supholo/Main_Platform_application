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
  // State for different data types
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<ConfigurationAuditLog[]>([]);
  const [versions, setVersions] = useState<Record<string, ConfigurationVersion[]>>({});
  const [promotions, setPromotions] = useState<ConfigurationPromotion[]>([]);
  const [environmentComparison, setEnvironmentComparison] = useState<ConfigurationComparison | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ConfigurationEnvironment>('development');
  
  const isInitializedRef = useRef(false);
  const configurationService = ApiServiceFactory.createService(ConfigurationService);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        configsResponse,
        templatesResponse,
        auditResponse
      ] = await Promise.all([
        configurationService.getConfigurations(selectedEnvironment),
        configurationService.getTemplates(),
        configurationService.getAuditLogs()
      ]);

      setConfigurations(configsResponse.data);
      setTemplates(templatesResponse.data);
      setAuditLogs(auditResponse.data);

      // Load versions for each configuration
      const versionsMap: Record<string, ConfigurationVersion[]> = {};
      await Promise.all(
        configsResponse.data.map(async (config) => {
          const versionsResponse = await configurationService.getConfigurationVersions(config.id);
          versionsMap[config.id] = versionsResponse.data;
        })
      );
      setVersions(versionsMap);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load configuration data'));
      console.error('Load configuration data error:', err);
    } finally {
      setLoading(false);
    }
  }, [configurationService, selectedEnvironment]);

  const initialize = useCallback(async () => {
    if (!isInitializedRef.current) {
      try {
        setLoading(true);
        if (ApiServiceFactory.getConfig().useMock) {
          await configurationService.initializeMockData();
        }
        await loadData();
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize configuration data'));
        console.error('Configuration initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [configurationService, loadData]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Configuration CRUD operations
  const createConfiguration = useCallback(async (data: Partial<Configuration>) => {
    try {
      setLoading(true);
      const response = await configurationService.createConfiguration(data);
      setConfigurations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  const updateConfiguration = useCallback(async (id: string, data: Partial<Configuration>) => {
    try {
      setLoading(true);
      const response = await configurationService.updateConfiguration(id, data);
      setConfigurations(prev => prev.map(config => 
        config.id === id ? response.data : config
      ));
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  const deleteConfiguration = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await configurationService.deleteConfiguration(id);
      setConfigurations(prev => prev.filter(config => config.id !== id));
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  // Version management
  const rollbackVersion = useCallback(async (configId: string, version: number) => {
    try {
      setLoading(true);
      const response = await configurationService.rollbackVersion(configId, version);
      setConfigurations(prev => prev.map(config =>
        config.id === configId ? response.data : config
      ));
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  // Promotion management
  const promoteConfiguration = useCallback(async (
    configId: string,
    sourceEnv: ConfigurationEnvironment,
    targetEnv: ConfigurationEnvironment
  ) => {
    try {
      setLoading(true);
      const response = await configurationService.promoteConfiguration(configId, sourceEnv, targetEnv);
      setPromotions(prev => [...prev, response.data]);
      await loadData(); // Reload to get updated configurations
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService, loadData]);

  // Environment comparison
  const compareEnvironments = useCallback(async (
    env1: ConfigurationEnvironment,
    env2: ConfigurationEnvironment
  ) => {
    try {
      setLoading(true);
      const response = await configurationService.compareEnvironments(env1, env2);
      setEnvironmentComparison(response.data);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  // Template management
  const createFromTemplate = useCallback(async (
    templateId: string,
    data: Partial<Configuration>
  ) => {
    try {
      setLoading(true);
      const response = await configurationService.createFromTemplate(templateId, data);
      setConfigurations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [configurationService]);

  const refetch = useCallback(async () => {
    isInitializedRef.current = false;
    return loadData();
  }, [loadData]);

  return {
    // Data
    configurations,
    templates,
    auditLogs,
    versions,
    promotions,
    environmentComparison,
    selectedEnvironment,
    
    // State
    loading,
    error,
    
    // Actions
    setSelectedEnvironment,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    rollbackVersion,
    promoteConfiguration,
    compareEnvironments,
    createFromTemplate,
    refetch,
    initialize
  };
}