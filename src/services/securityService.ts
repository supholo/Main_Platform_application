// src/services/securityService.ts

import { BaseApiService } from "./core/BaseApiService";
import { ApiResponse } from "./core/types";
import { mockDb } from "./mockDb/MockDatabase";
import { generateId } from "../lib/utils";
import { ApiServiceFactory } from "./core/ApiServiceFactory";
import { CollectionName } from "./mockDb/types";
import {
  SecurityOverviewData,
  SecurityMetric,
  SecurityIncident,
  SecurityRisk,
  SecurityRecommendation,
  AccessLog,
  SecurityAlert,
  VendorRisk,
  ThreatIndicator,
  AccessLogSummary,
  BusinessMetric,
  ComplianceStatus,
  SecurityRiskLevel,
} from "../types/security";

export class SecurityService extends BaseApiService {
  private initialized = false;
  private readonly SECURITY_METRICS_COLLECTION =
    "securityMetrics" as CollectionName;
  private readonly ACCESS_LOGS_COLLECTION = "accessLogs" as CollectionName;
  private readonly SECURITY_ALERTS_COLLECTION =
    "securityAlerts" as CollectionName;
  private readonly BUSINESS_METRICS_COLLECTION =
    "businessMetrics" as CollectionName;
  private readonly COMPLIANCE_STATUS_COLLECTION =
    "complianceStatus" as CollectionName;
  private readonly VENDOR_RISKS_COLLECTION = "vendorRisks" as CollectionName;
  private readonly THREAT_INDICATORS_COLLECTION =
    "threatIndicators" as CollectionName;

  private async ensureCollectionsExist() {
    try {
      await mockDb.find(this.SECURITY_METRICS_COLLECTION);
      await mockDb.find(this.ACCESS_LOGS_COLLECTION);
      await mockDb.find(this.SECURITY_ALERTS_COLLECTION);
      await mockDb.find(this.BUSINESS_METRICS_COLLECTION);
      await mockDb.find(this.COMPLIANCE_STATUS_COLLECTION);
      await mockDb.find(this.VENDOR_RISKS_COLLECTION);
      await mockDb.find(this.THREAT_INDICATORS_COLLECTION);
    } catch {
      await mockDb.seed(this.SECURITY_METRICS_COLLECTION, []);
      await mockDb.seed(this.ACCESS_LOGS_COLLECTION, []);
      await mockDb.seed(this.SECURITY_ALERTS_COLLECTION, []);
      await mockDb.seed(this.BUSINESS_METRICS_COLLECTION, []);
      await mockDb.seed(this.COMPLIANCE_STATUS_COLLECTION, []);
      await mockDb.seed(this.VENDOR_RISKS_COLLECTION, []);
      await mockDb.seed(this.THREAT_INDICATORS_COLLECTION, []);
    }
  }

  async getSecurityOverview(): Promise<ApiResponse<SecurityOverviewData>> {
    if (!this.initialized && this.config.useMock) {
      await this.initializeMockData();
    }
    return this.request<SecurityOverviewData>("/security/overview");
  }

  async getAccessLogs(): Promise<ApiResponse<AccessLog[]>> {
    if (!this.initialized && this.config.useMock) {
      await this.initializeMockData();
    }
    return this.request<AccessLog[]>("/security/access-logs");
  }

  async getSecurityAlerts(): Promise<ApiResponse<SecurityAlert[]>> {
    if (!this.initialized && this.config.useMock) {
      await this.initializeMockData();
    }
    return this.request<SecurityAlert[]>("/security/alerts");
  }

  async getBusinessMetrics(): Promise<ApiResponse<BusinessMetric[]>> {
    return this.request<BusinessMetric[]>("/security/business-metrics");
  }

  async getComplianceStatus(): Promise<ApiResponse<ComplianceStatus[]>> {
    return this.request<ComplianceStatus[]>("/security/compliance");
  }

  async getVendorRisks(): Promise<ApiResponse<VendorRisk[]>> {
    return this.request<VendorRisk[]>("/security/vendor-risks");
  }

  async getThreatIndicators(): Promise<ApiResponse<ThreatIndicator[]>> {
    return this.request<ThreatIndicator[]>("/security/threats");
  }

  

  async getAccessLogSummary(
    timeRange: string
  ): Promise<ApiResponse<AccessLogSummary>> {
    return this.request<AccessLogSummary>(
      `/security/access-logs/summary?timeRange=${timeRange}`
    );
  }

  protected async getMockResponse<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (true) {
      case endpoint === "/security/business-metrics":
        const businessmetrics = await mockDb.find(
          this.BUSINESS_METRICS_COLLECTION
        );
        return { data: businessmetrics as T };

      case endpoint === "/security/compliance":
        const compliance = await mockDb.find(this.COMPLIANCE_STATUS_COLLECTION);
        return { data: compliance as T };

      case endpoint === "/security/vendor-risks":
        const risks = await mockDb.find(this.VENDOR_RISKS_COLLECTION);
        return { data: risks as T };

      case endpoint === "/security/threats":
        const threats = await mockDb.find(this.THREAT_INDICATORS_COLLECTION);
        return { data: threats as T };

      case endpoint.startsWith("/security/access-logs/summary"): {
        const logsResult = await mockDb.find(this.ACCESS_LOGS_COLLECTION);
        const accessLogs = logsResult as unknown as AccessLog[];

        // Calculate summary based on actual logs
        const summary: AccessLogSummary = {
          totalEvents: accessLogs.length,
          failedAttempts: accessLogs.filter((log) => log.status === "failed")
            .length,
          suspiciousActivities: accessLogs.filter((log) => log.risk === "high")
            .length,
          uniqueUsers: new Set(accessLogs.map((log) => log.userEmail)).size,
          topLocations: this.calculateTopLocations(accessLogs),
          topActions: this.calculateTopActions(accessLogs),
          riskDistribution: this.calculateRiskDistribution(accessLogs),
          timeRange:
            new URLSearchParams(endpoint.split("?")[1]).get("timeRange") ||
            "24h",
        };

        return { data: summary as T };
      }

      case endpoint === "/security/overview" && method === "GET":
        const metrics = await mockDb.find(this.SECURITY_METRICS_COLLECTION);
        return {
          data: {
            score: 85,
            metrics,
            incidents: [], // Get from mock DB
            risks: [], // Get from mock DB
            recommendations: [], // Get from mock DB
          } as T,
        };

      case endpoint === "/security/access-logs" && method === "GET":
        const logs = await mockDb.find(this.ACCESS_LOGS_COLLECTION);
        return { data: logs as T };

      case endpoint === "/security/alerts" && method === "GET":
        const alerts = await mockDb.find(this.SECURITY_ALERTS_COLLECTION);
        return { data: alerts as T };

      default:
        throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
    }
  }

  private calculateTopLocations(
    logs: AccessLog[]
  ): { location: string; count: number }[] {
    const locationCounts = logs.reduce((acc, log) => {
      acc[log.location] = (acc[log.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateTopActions(
    logs: AccessLog[]
  ): { action: string; count: number }[] {
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateRiskDistribution(
    logs: AccessLog[]
  ): { risk: SecurityRiskLevel; count: number }[] {
    const riskCounts = logs.reduce((acc, log) => {
      acc[log.risk] = (acc[log.risk] || 0) + 1;
      return acc;
    }, {} as Record<SecurityRiskLevel, number>);

    return Object.entries(riskCounts)
      .map(([risk, count]) => ({
        risk: risk as SecurityRiskLevel,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async initializeMockData(): Promise<void> {
    if (this.config.useMock && !this.initialized) {
      try {
        await this.ensureCollectionsExist();

        // Initialize with mock data if collections are empty
        const existingMetrics = await mockDb.find(
          this.SECURITY_METRICS_COLLECTION
        );
        const existingLogs = await mockDb.find(this.ACCESS_LOGS_COLLECTION);
        const existingAlerts = await mockDb.find(
          this.SECURITY_ALERTS_COLLECTION
        );
        const existingBusinessMetrics = (await mockDb.find(
          this.BUSINESS_METRICS_COLLECTION
        )) as unknown as BusinessMetric[];
        const existingComplianceStatus = (await mockDb.find(
          this.COMPLIANCE_STATUS_COLLECTION
        )) as unknown as ComplianceStatus[];
        const existingVendorRisks = (await mockDb.find(
          this.VENDOR_RISKS_COLLECTION
        )) as unknown as VendorRisk[];
        const existingThreats = (await mockDb.find(
          this.THREAT_INDICATORS_COLLECTION
        )) as unknown as ThreatIndicator[];

        if (existingMetrics.length === 0) {
          const mockMetrics: SecurityMetric[] = [
            {
              id: generateId("metric-"),
              type: "users",
              value: 243,
              change: 12,
              trend: "up",
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId("metric-"),
              type: "logins",
              value: 18,
              change: -25,
              trend: "down",
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId("metric-"),
              type: "mfa",
              value: 92,
              change: 5,
              trend: "up",
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId("metric-"),
              type: "policy",
              value: 95,
              change: 2,
              trend: "up",
              timestamp: new Date().toISOString(),
            },
          ];
          await mockDb.seed(this.SECURITY_METRICS_COLLECTION, mockMetrics);
        }

        if (existingLogs.length === 0) {
          const mockLogs: AccessLog[] = [
            {
              id: generateId("log-"),
              userId: "user-1",
              userEmail: "john@example.com",
              action: "Login",
              timestamp: new Date().toISOString(),
              ip: "192.168.1.100",
              location: "New York, US",
              device: "Chrome / Windows",
              status: "success",
              risk: "low",
              details: "Successfully authenticated with MFA",
            },
            {
              id: generateId("log-"),
              userId: "user-2",
              userEmail: "alice@example.com",
              action: "API Access",
              timestamp: new Date().toISOString(),
              ip: "10.0.0.50",
              location: "London, UK",
              device: "PostmanRuntime",
              status: "failed",
              risk: "high",
              details: "Invalid API key presented",
            },
            {
              id: generateId("log-"),
              userId: "user-3",
              userEmail: "bob@example.com",
              action: "Password Reset",
              timestamp: new Date().toISOString(),
              ip: "192.168.1.150",
              location: "San Francisco, US",
              device: "Firefox / MacOS",
              status: "success",
              risk: "medium",
              details: "Password reset request completed",
            },
          ];
          await mockDb.seed(this.ACCESS_LOGS_COLLECTION, mockLogs);
        }

        if (existingAlerts.length === 0) {
          const mockAlerts: SecurityAlert[] = [
            {
              id: generateId("alert-"),
              title: "Suspicious Login Pattern Detected",
              description:
                "Multiple failed login attempts from unusual location",
              severity: "high",
              timestamp: new Date().toISOString(),
              status: "active",
            },
            {
              id: generateId("alert-"),
              title: "New Device Access",
              description: "First-time access from unrecognized device",
              severity: "medium",
              timestamp: new Date().toISOString(),
              status: "active",
            },
            {
              id: generateId("alert-"),
              title: "MFA Configuration Change",
              description: "MFA settings modified for multiple users",
              severity: "medium",
              timestamp: new Date().toISOString(),
              status: "active",
            },
          ];
          await mockDb.seed(this.SECURITY_ALERTS_COLLECTION, mockAlerts);
        }

        if (existingBusinessMetrics.length === 0) {
          const mockBusinessMetrics: BusinessMetric[] = [
            {
              id: generateId("bmetric-"),
              title: "Data Breach Risk",
              value: "Low",
              trend: -5,
              impact: "positive",
              type: "data_breach",
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId("bmetric-"),
              title: "System Uptime",
              value: "99.99%",
              trend: 0.1,
              impact: "positive",
              type: "uptime",
              timestamp: new Date().toISOString(),
            },
            {
              id: generateId("bmetric-"),
              title: "Critical Vulnerabilities",
              value: "2",
              trend: -30,
              impact: "positive",
              type: "vulnerabilities",
              timestamp: new Date().toISOString(),
            },
          ];
          await mockDb.seed(
            this.BUSINESS_METRICS_COLLECTION,
            mockBusinessMetrics
          );
        }

        if (existingComplianceStatus.length === 0) {
          const mockCompliance: ComplianceStatus[] = [
            {
              id: generateId("comp-"),
              framework: "SOC 2",
              status: "compliant",
              lastAudit: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000
              ).toISOString(),
              nextAudit: new Date(
                Date.now() + 75 * 24 * 60 * 60 * 1000
              ).toISOString(),
              findings: 2,
              criticalFindings: 0,
            },
            {
              id: generateId("comp-"),
              framework: "ISO 27001",
              status: "compliant",
              lastAudit: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              nextAudit: new Date(
                Date.now() + 60 * 24 * 60 * 60 * 1000
              ).toISOString(),
              findings: 3,
              criticalFindings: 0,
            },
          ];
          await mockDb.seed(this.COMPLIANCE_STATUS_COLLECTION, mockCompliance);
        }

        if (existingVendorRisks.length === 0) {
          const mockVendorRisks: VendorRisk[] = [
            {
              id: generateId("vrisk-"),
              vendor: "Cloud Provider",
              risk: "low",
              issues: 0,
              lastAssessment: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000
              ).toISOString(),
              nextAssessment: new Date(
                Date.now() + 15 * 24 * 60 * 60 * 1000
              ).toISOString(),
              criticalServices: true,
            },
            {
              id: generateId("vrisk-"),
              vendor: "Payment Processor",
              risk: "medium",
              issues: 2,
              lastAssessment: new Date(
                Date.now() - 20 * 24 * 60 * 60 * 1000
              ).toISOString(),
              nextAssessment: new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
              ).toISOString(),
              criticalServices: true,
            },
          ];
          await mockDb.seed(this.VENDOR_RISKS_COLLECTION, mockVendorRisks);
        }

        if (existingThreats.length === 0) {
          const mockThreats: ThreatIndicator[] = [
            {
              id: generateId("threat-"),
              type: "Brute Force Attempt",
              severity: "high",
              description: "Multiple failed login attempts detected",
              timestamp: new Date().toISOString(),
              relatedLogIds: ["log-1", "log-2"],
              status: "active",
              mitigationSteps: [
                "Enable account lockout",
                "Review source IPs",
                "Update password policy",
              ],
            },
            {
              id: generateId("threat-"),
              type: "Suspicious API Usage",
              severity: "medium",
              description: "Unusual API access pattern detected",
              timestamp: new Date().toISOString(),
              relatedLogIds: ["log-3"],
              status: "active",
              mitigationSteps: [
                "Review API access logs",
                "Verify API key permissions",
                "Update rate limiting rules",
              ],
            },
          ];
          await mockDb.seed(this.THREAT_INDICATORS_COLLECTION, mockThreats);
        }

        this.initialized = true;
        console.log("Security mock data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize security mock data:", error);
        throw error;
      }
    }
  }
}

export const securityService = ApiServiceFactory.createService(SecurityService);
