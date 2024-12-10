// src/hooks/useApi.ts
import { useCallback } from 'react';
import { api } from '../services/api';
import { useTenant } from '../contexts/TenantContext';
import { getErrorMessage } from '../lib/utils';

export function useApi() {
  const { currentTenant } = useTenant();

  const makeRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    errorMessage = 'API request failed',
    skipTenantCheck = false // Add this parameter for onboarding
  ): Promise<T> => {
    if (!skipTenantCheck && !currentTenant?.id) {
      throw new Error('No tenant selected');
    }

    try {
      if (currentTenant?.id) {
        api.setTenantId(currentTenant.id);
      }
      return await requestFn();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      throw new Error(getErrorMessage(error));
    }
  }, [currentTenant]);

  return {
    // Existing methods
    getTenant: () => makeRequest(() => api.getTenant()),
    getApplications: () => makeRequest(() => api.getApplications()),
    getMetrics: (applicationId: string, timeRange: { start: string; end: string }) =>
      makeRequest(() => api.getMetrics(applicationId, timeRange)),
    getAuditLogs: (filters: { startDate?: string; endDate?: string; type?: string }) =>
      makeRequest(() => api.getAuditLogs(filters)),
    getCloudConfiguration: () => makeRequest(() => api.getCloudConfiguration()),
    getIdentityProvider: () => makeRequest(() => api.getIdentityProvider()),
    getRoles: () => makeRequest(() => api.getRoles()),
    getNotificationConfigs: () => makeRequest(() => api.getNotificationConfigs()),

    // Add onboarding methods
    createTenant: (data: any) => 
      makeRequest(() => api.createTenant(data), 'Failed to create tenant', true),
    createApplication: (data: any) => 
      makeRequest(() => api.createApplication(data), 'Failed to create application', true),
    saveCloudConfiguration: (data: any) => 
      makeRequest(() => api.saveCloudConfiguration(data), 'Failed to save cloud configuration', true),
    configureIdentityProvider: (data: any) => 
      makeRequest(() => api.configureIdentityProvider(data), 'Failed to configure identity provider', true),
    configureNotifications: (data: any) => 
      makeRequest(() => api.configureNotifications(data), 'Failed to configure notifications', true),
    createRole: (data: any) => 
      makeRequest(() => api.createRole(data), 'Failed to create role', true),
  };
}