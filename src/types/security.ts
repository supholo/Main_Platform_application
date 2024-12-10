// src/types/security.ts

export type SecurityRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SecurityIncidentType = 'mfa' | 'suspicious' | 'policy';
export type SecurityMetricType = 'users' | 'logins' | 'mfa' | 'policy';

export interface SecurityMetric {
  id: string;
  type: SecurityMetricType;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export interface BusinessMetric {
  id: string;
  title: string;
  value: string | number;
  trend: number;
  impact: 'positive' | 'negative' | 'neutral';
  type: 'data_breach' | 'uptime' | 'vulnerabilities' | 'response_time';
  timestamp: string;
}

export interface ComplianceStatus {
  id: string;
  framework: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  lastAudit: string;
  nextAudit: string;
  findings: number;
  criticalFindings: number;
}

export interface VendorRisk {
  id: string;
  vendor: string;
  risk: SecurityRiskLevel;
  issues: number;
  lastAssessment: string;
  nextAssessment: string;
  criticalServices: boolean;
}

export interface SecurityOverviewData {
  id: string;
  score: number;
  metrics: SecurityMetric[];
  incidents: SecurityIncident[];
  risks: SecurityRisk[];
  recommendations: SecurityRecommendation[];
  businessMetrics: BusinessMetric[];
  complianceStatus: ComplianceStatus[];
  vendorRisks: VendorRisk[];
  lastUpdated: string;
}

// Enhanced Access Log types
export interface ThreatIndicator {
  id: string;
  type: string;
  severity: SecurityRiskLevel;
  description: string;
  timestamp: string;
  relatedLogIds: string[];
  status: 'active' | 'resolved';
  mitigationSteps?: string[];
}

export interface AccessLogSummary {
  totalEvents: number;
  failedAttempts: number;
  suspiciousActivities: number;
  uniqueUsers: number;
  topLocations: { location: string; count: number }[];
  topActions: { action: string; count: number }[];
  riskDistribution: { risk: SecurityRiskLevel; count: number }[];
  timeRange: string;
}

export interface SecurityIncident {
  id: string;
  type: SecurityIncidentType;
  count: number;
  date: string;
}

export interface SecurityRisk {
  id: string;
  name: string;
  severity: SecurityRiskLevel;
  count: number;
  status: 'active' | 'resolved';
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  priority: SecurityRiskLevel;
  impact: SecurityRiskLevel;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SecurityOverviewData {
  score: number;
  metrics: SecurityMetric[];
  incidents: SecurityIncident[];
  risks: SecurityRisk[];
  recommendations: SecurityRecommendation[];
}

// Access Logs Types
export type AccessLogAction = 'Login' | 'Logout' | 'API Access' | 'Settings Change' | 'Password Reset';
export type AccessLogStatus = 'success' | 'failed' | 'blocked';

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AccessLogAction;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  status: AccessLogStatus;
  risk: SecurityRiskLevel;
  details: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: SecurityRiskLevel;
  timestamp: string;
  status: 'active' | 'resolved';
  relatedLogId?: string;
}