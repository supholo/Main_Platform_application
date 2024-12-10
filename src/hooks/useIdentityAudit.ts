// src/hooks/useIdentityAudit.ts

import { useState, useCallback, useEffect } from 'react';
import { identityAuditService } from '../services/identityAuditService';
import { 
  IdentityAuditEvent, 
  IdentityComplianceReport, 
  AccessReview 
} from '../types/identityAudit';

export function useIdentityAudit() {
  const [auditEvents, setAuditEvents] = useState<IdentityAuditEvent[]>([]);
  const [complianceReports, setComplianceReports] = useState<IdentityComplianceReport[]>([]);
  const [accessReviews, setAccessReviews] = useState<AccessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAuditData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, reportsRes, reviewsRes] = await Promise.all([
        identityAuditService.getAuditEvents(),
        identityAuditService.getComplianceReports(),
        identityAuditService.getAccessReviews()
      ]);

      setAuditEvents(eventsRes.data);
      setComplianceReports(reportsRes.data);
      setAccessReviews(reviewsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load audit data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  const logAuditEvent = useCallback(async (event: Omit<IdentityAuditEvent, 'id'>) => {
    try {
      await identityAuditService.logAuditEvent(event);
      await loadAuditData();
    } catch (err) {
      console.error('Failed to log audit event:', err);
      throw err;
    }
  }, [loadAuditData]);

  const generateComplianceReport = useCallback(async (type: string) => {
    try {
      const response = await identityAuditService.generateComplianceReport(type);
      await loadAuditData();
      return response.data;
    } catch (err) {
      console.error('Failed to generate compliance report:', err);
      throw err;
    }
  }, [loadAuditData]);

  return {
    auditEvents,
    complianceReports,
    accessReviews,
    loading,
    error,
    logAuditEvent,
    generateComplianceReport,
    refetch: loadAuditData
  };
}