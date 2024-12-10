// src/hooks/useData.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useTenant } from '../contexts/TenantContext';

interface UseDataOptions<T> {
  initialData?: T;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useData<T>(
  fetchFn: () => Promise<T>,
  options: UseDataOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, options.onSuccess, options.onError]);

  useEffect(() => {
    fetchData();
  }, options.dependencies || []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Add the Application interface
interface Application {
  id: string;
  name: string;
  status: 'running' | 'error' | 'stopped';
  version: string;
  metrics: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
  lastDeployment: {
    status: 'success' | 'failed';
    timestamp: string;
    version: string;
  };
}

interface ApplicationsResponse {
  data: Application[];
}

// src/hooks/useApplications.ts
export function useApplications() {
  const { currentTenant } = useTenant();

  return useData<ApplicationsResponse>(
    () => api.getApplications(),
    {
      dependencies: [currentTenant?.id],
      initialData: { data: [] }
    }
  );
}

// src/hooks/useMetrics.ts
export function useMetrics(applicationId: string, timeRange: { start: string; end: string }) {
  const { currentTenant } = useTenant();

  return useData<{ data: any[] }>(
    async () => {
      if (!applicationId) {
        return { data: [] };
      }
      // Add slight delay to prevent rapid re-fetches
      await new Promise(resolve => setTimeout(resolve, 100));
      return api.getMetrics(applicationId, timeRange);
    },
    {
      dependencies: [currentTenant?.id, applicationId, timeRange.start, timeRange.end],
      initialData: { data: [] }
    }
  );
}

// src/hooks/useAuditLogs.ts
export function useAuditLogs(filters: any = {}) {
  const { currentTenant } = useTenant();

  return useData(
    () => api.getAuditLogs(filters),
    {
      dependencies: [currentTenant?.id, JSON.stringify(filters)],
      initialData: []
    }
  );
}

// src/hooks/useRoles.ts
export function useRoles() {
  const { currentTenant } = useTenant();

  return useData(
    () => api.getRoles(),
    {
      dependencies: [currentTenant?.id],
      initialData: []
    }
  );
}

// src/hooks/useNotifications.ts
export function useNotifications() {
  const { currentTenant } = useTenant();

  return useData(
    () => api.getNotificationChannels(),
    {
      dependencies: [currentTenant?.id],
      initialData: []
    }
  );
}