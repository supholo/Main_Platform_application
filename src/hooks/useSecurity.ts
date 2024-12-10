// src/hooks/useSecurity.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import { SecurityService } from '../services/securityService';
import { ApiServiceFactory } from '../services/core/ApiServiceFactory';
import {
  SecurityOverviewData,
  AccessLog,
  SecurityAlert,
  BusinessMetric,
  ComplianceStatus,
  VendorRisk,
  ThreatIndicator,
  AccessLogSummary
} from '../types/security';

export function useSecurity() {
  const [securityOverview, setSecurityOverview] = useState<SecurityOverviewData | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [vendorRisks, setVendorRisks] = useState<VendorRisk[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [accessLogSummary, setAccessLogSummary] = useState<AccessLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitializedRef = useRef(false);

  const securityService = ApiServiceFactory.createService(SecurityService);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        overviewResponse, 
        logsResponse, 
        alertsResponse,
        businessMetricsResponse,
        complianceResponse,
        vendorRisksResponse,
        threatIndicatorsResponse,
        logSummaryResponse
      ] = await Promise.all([
        securityService.getSecurityOverview(),
        securityService.getAccessLogs(),
        securityService.getSecurityAlerts(),
        securityService.getBusinessMetrics(),
        securityService.getComplianceStatus(),
        securityService.getVendorRisks(),
        securityService.getThreatIndicators(),
        securityService.getAccessLogSummary('24h') // Default to last 24 hours
      ]);
      
      setSecurityOverview(overviewResponse.data);
      setAccessLogs(logsResponse.data);
      setSecurityAlerts(alertsResponse.data);
      setBusinessMetrics(businessMetricsResponse.data);
      setComplianceStatus(complianceResponse.data);
      setVendorRisks(vendorRisksResponse.data);
      setThreatIndicators(threatIndicatorsResponse.data);
      setAccessLogSummary(logSummaryResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load security data'));
      console.error('Load security data error:', err);
    } finally {
      setLoading(false);
    }
  }, [securityService]);


  const initialize = useCallback(async () => {
    if (!isInitializedRef.current) {
      try {
        setLoading(true);
        if (ApiServiceFactory.getConfig().useMock) {
          await securityService.initializeMockData();
        }
        await loadData();
        isInitializedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize security data'));
        console.error('Security initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [securityService, loadData]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const refetch = useCallback(async () => {
    isInitializedRef.current = false;
    return loadData();
  }, [loadData]);

  return {
    securityOverview,
    accessLogs,
    securityAlerts,
    loading,
    error,
    refetch,
    initialize,
    businessMetrics,
    complianceStatus,
    vendorRisks,
    threatIndicators,
    accessLogSummary
  };
}