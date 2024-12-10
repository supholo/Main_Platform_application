// src/components/IdentityManagement/AccessLogs.tsx

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  Search,
  Download,
  MapPin,
  Clock,
  Monitor,
  AlertTriangle,
  Activity,
  UserX,
  Shield,
  Users,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useSecurity } from "../../hooks/useSecurity";
import {
  AccessLog,
  SecurityAlert,
  ThreatIndicator,
  SecurityRiskLevel,
} from "../../types/security";
import LoadingSpinner from "../LoadingSpinner";
import { Alert } from "../ui/alert";

const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  colorClass: string;
}> = ({ title, value, icon: Icon, trend, colorClass }) => (
  <Card>
    <CardContent className="pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`h-5 w-5 ${colorClass} mr-2`} />
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
        {trend !== undefined && (
          <span
            className={`text-sm ${
              trend > 0
                ? "text-red-500"
                : trend < 0
                ? "text-green-500"
                : "text-gray-500"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

const ThreatIndicatorCard: React.FC<{
  threat: ThreatIndicator;
  onViewRelatedLogs?: (logIds: string[]) => void;
}> = ({ threat, onViewRelatedLogs }) => (
  <div
    className={`p-4 rounded-lg border ${
      threat.severity === "critical"
        ? "border-red-200 bg-red-50"
        : threat.severity === "high"
        ? "border-orange-200 bg-orange-50"
        : threat.severity === "medium"
        ? "border-yellow-200 bg-yellow-50"
        : "border-green-200 bg-green-50"
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-sm font-medium">{threat.type}</h4>
        <p className="mt-1 text-sm text-gray-600">{threat.description}</p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          threat.severity === "critical"
            ? "bg-red-100 text-red-800"
            : threat.severity === "high"
            ? "bg-orange-100 text-orange-800"
            : threat.severity === "medium"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {threat.severity.toUpperCase()}
      </span>
    </div>
    {threat.mitigationSteps && threat.mitigationSteps.length > 0 && (
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-700">Mitigation Steps:</p>
        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
          {threat.mitigationSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>
    )}
    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
      <span>Detected: {format(new Date(threat.timestamp), "PPp")}</span>
      {threat.relatedLogIds.length > 0 && (
        <button
          onClick={() => onViewRelatedLogs?.(threat.relatedLogIds)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          View {threat.relatedLogIds.length} related{" "}
          {threat.relatedLogIds.length === 1 ? "log" : "logs"}
        </button>
      )}
    </div>
  </div>
);

const AccessLogs: React.FC = () => {
  const {
    accessLogs,
    securityAlerts,
    threatIndicators,
    accessLogSummary,
    loading,
    error,
    refetch,
  } = useSecurity();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [highlightedLogIds, setHighlightedLogIds] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    if (!accessLogs) return [];

    return accessLogs.filter((log) => {
      const matchesSearch =
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = selectedRisk === "all" || log.risk === selectedRisk;
      const matchesType = selectedType === "all" || log.action === selectedType;
      return matchesSearch && matchesRisk && matchesType;
    });
  }, [accessLogs, searchTerm, selectedRisk, selectedType]);

  const calculatePeakHour = (logs: AccessLog[]): number => {
    // Create a map of hour -> count
    const hourCounts = logs.reduce((acc: Record<number, number>, log) => {
      const hour = new Date(log.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Find the peak hour
    let maxCount = 0;
    let peakHour = 0;

    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    return peakHour;
  };

  const handleViewRelatedLogs = (logIds: string[]) => {
    setHighlightedLogIds(logIds);
    // Scroll to the first related log
    const firstLog = document.getElementById(`log-${logIds[0]}`);
    if (firstLog) {
      firstLog.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  const handleExport = async () => {
    try {
      const csvContent = [
        [
          "Timestamp",
          "User",
          "Action",
          "Location",
          "Device",
          "Risk",
          "Status",
        ].join(","),
        ...filteredLogs.map((log) =>
          [
            format(new Date(log.timestamp), "Pp"),
            log.userEmail,
            log.action,
            log.location,
            log.device,
            log.risk,
            log.status,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `access-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export logs:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Events"
          value={accessLogSummary?.totalEvents || 0}
          icon={Activity}
          colorClass="text-blue-500"
        />
        <SummaryCard
          title="Failed Attempts"
          value={accessLogSummary?.failedAttempts || 0}
          icon={UserX}
          colorClass="text-red-500"
          trend={
            accessLogSummary?.riskDistribution?.find((r) => r.risk === "high")
              ?.count
          }
        />
        <SummaryCard
          title="Suspicious Activities"
          value={accessLogSummary?.suspiciousActivities || 0}
          icon={Shield}
          colorClass="text-yellow-500"
        />
        <SummaryCard
          title="Unique Users"
          value={accessLogSummary?.uniqueUsers || 0}
          icon={Users}
          colorClass="text-green-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Risk Levels</option>
          {accessLogSummary?.riskDistribution?.map((risk) => (
            <option key={risk.risk} value={risk.risk}>
              {risk.risk.toUpperCase()} ({risk.count})
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Actions</option>
          {accessLogSummary?.topActions?.map((action) => (
            <option key={action.action} value={action.action}>
              {action.action} ({action.count})
            </option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </button>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Advanced Filters */}
      <div>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {showAdvancedFilters
            ? "Hide Advanced Filters"
            : "Show Advanced Filters"}
        </button>

        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Locations
              </label>
              <div className="flex flex-wrap gap-2">
                {accessLogSummary?.topLocations?.map((location) => (
                  <button
                    key={location.location}
                    onClick={() => {
                      setSearchTerm(location.location);
                    }}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {location.location} ({location.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Threats */}
      {threatIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatIndicators
                .filter((threat) => threat.status === "active")
                .map((threat) => (
                  <ThreatIndicatorCard
                    key={threat.id}
                    threat={threat}
                    onViewRelatedLogs={handleViewRelatedLogs}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Device
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Risk
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              // src/components/AccessLogs.tsx
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    id={`log-${log.id}`}
                    className={`hover:bg-gray-50 ${
                      highlightedLogIds.includes(log.id) ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {format(new Date(log.timestamp), "PPp")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {log.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2 text-gray-400" />
                        {log.device}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.risk === "high"
                            ? "bg-red-100 text-red-800"
                            : log.risk === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {log.risk.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Access Patterns Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Access Patterns Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-4">Top Locations</h4>
              <div className="space-y-2">
                {accessLogSummary?.topLocations.map((location, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-grow">
                      <div className="h-2 bg-blue-100 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (location.count / accessLogSummary.totalEvents) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600 w-32 text-right">
                      {location.location} ({location.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-4">Action Types</h4>
              <div className="space-y-2">
                {accessLogSummary?.topActions.map((action, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-grow">
                      <div className="h-2 bg-green-100 rounded-full">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{
                            width: `${
                              (action.count / accessLogSummary.totalEvents) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600 w-32 text-right">
                      {action.action} ({action.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Threats Panel */}
      {threatIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Active Security Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatIndicators
                .filter((threat) => threat.status === "active")
                .map((threat) => (
                  <ThreatIndicatorCard
                    key={threat.id}
                    threat={threat}
                    onViewRelatedLogs={handleViewRelatedLogs}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-500" />
            Risk Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessLogSummary?.riskDistribution.map((risk, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    risk.risk === "critical"
                      ? "bg-red-100 text-red-800"
                      : risk.risk === "high"
                      ? "bg-orange-100 text-orange-800"
                      : risk.risk === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {risk.risk.toUpperCase()}
                </span>
                <div className="flex-grow">
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        risk.risk === "critical"
                          ? "bg-red-500"
                          : risk.risk === "high"
                          ? "bg-orange-500"
                          : risk.risk === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          (risk.count / accessLogSummary.totalEvents) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-20 text-right">
                  {risk.count} (
                  {((risk.count / accessLogSummary.totalEvents) * 100).toFixed(
                    1
                  )}
                  %)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time-based Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-500" />
            Time-based Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Peak Activity Hour</p>
                  <p className="text-2xl font-semibold mt-1">
                    {format(
                      new Date().setHours(
                        calculatePeakHour(accessLogs),
                        0,
                        0,
                        0
                      ),
                      "ha"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Failed Login Rate</p>
                  <p className="text-2xl font-semibold mt-1">
                    {(
                      ((accessLogSummary?.failedAttempts || 0) /
                        (accessLogSummary?.totalEvents || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Unique Devices</p>
                  <p className="text-2xl font-semibold mt-1">
                    {new Set(accessLogs.map((log) => log.device)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessLogs;
