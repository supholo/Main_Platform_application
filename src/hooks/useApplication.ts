// src/hooks/useApplication.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { ApplicationService } from '../services/applicationService';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import {
  Application,
  ApplicationIntegration,
  ApplicationOnboarding,
  IntegrationType,
  CiCdConfig,
  LoggingConfig,
  MetricsConfig,
  NotificationConfig
} from '../types/application';

export function useApplication() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [integrations, setIntegrations] = useState<Record<string, ApplicationIntegration[]>>({});
  const [onboardingStatus, setOnboardingStatus] = useState<Record<string, ApplicationOnboarding>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isInitializedRef = useRef(false);
  const loadingRef = useRef(false);
  const applicationService = useRef(ApiServiceFactory.createService(ApplicationService));
  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    if (loadingRef.current || !isMountedRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      if (!isInitializedRef.current && ApiServiceFactory.getConfig().useMock) {
        await applicationService.current.initializeMockData();
      }

      const appsResponse = await applicationService.current.getApplications();
      
      if (!isMountedRef.current) return;

      // Load integrations and onboarding status for each application
      const integrationsMap: Record<string, ApplicationIntegration[]> = {};
      const onboardingMap: Record<string, ApplicationOnboarding> = {};

      await Promise.all(
        appsResponse.data.map(async (app) => {
          const [integrationsResponse, onboardingResponse] = await Promise.all([
            applicationService.current.getIntegrations(app.id),
            applicationService.current.getOnboardingStatus(app.id)
          ]);

          if (isMountedRef.current) {
            integrationsMap[app.id] = integrationsResponse.data;
            onboardingMap[app.id] = onboardingResponse.data;
          }
        })
      );

      if (isMountedRef.current) {
        setApplications(appsResponse.data);
        setIntegrations(integrationsMap);
        setOnboardingStatus(onboardingMap);
        setError(null);
        isInitializedRef.current = true;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load application data'));
        console.error('Load application data error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const createApplication = useCallback(async (data: Partial<Application>): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.createApplication(data);
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

  const updateApplication = useCallback(async (id: string, data: Partial<Application>): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.updateApplication(id, data);
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

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.deleteApplication(id);
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

  const addIntegration = useCallback(async (
    applicationId: string,
    type: IntegrationType,
    config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig
  ): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.addIntegration(applicationId, type, config);
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

  const updateIntegration = useCallback(async (
    applicationId: string,
    integrationId: string,
    config: Partial<CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig>
  ): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.updateIntegration(applicationId, integrationId, config);
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

  const removeIntegration = useCallback(async (applicationId: string, integrationId: string): Promise<void> => {
    if (!isMountedRef.current) return;
    try {
      setLoading(true);
      await applicationService.current.removeIntegration(applicationId, integrationId);
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

  return {
    applications,
    integrations,
    onboardingStatus,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    addIntegration,
    updateIntegration,
    removeIntegration,
    refetch: loadData
  };
}