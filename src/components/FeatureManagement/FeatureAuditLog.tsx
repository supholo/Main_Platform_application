// src/components/FeatureManagement/FeatureAuditLog.tsx

import React, { useState, useMemo } from "react";
import {
  History,
  Filter,
  Download,
  Search,
  User,
  Clock,
  Activity,
  Shield,
  Flag,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/badge";
import {
  Feature,
  FeatureAuditLogs
} from "../../types/feature";

interface FeatureAuditLogProps {
  logs: FeatureAuditLogs[];
  features: Feature[];
  onRefresh?: () => Promise<void>;
}

export const FeatureAuditLog: React.FC<FeatureAuditLogProps> = ({
  logs,
  features,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.details?.changes?.some(
          (change) =>
            change.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (change.oldValue
              ? String(change.oldValue)
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              : false) ||
            (change.newValue
              ? String(change.newValue)
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              : false)
        ) ??
          false) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction =
        selectedAction === "all" || log.action === selectedAction;

      const timeRangeMap: Record<string, number> = {
        "24h": 24,
        "7d": 24 * 7,
        "30d": 24 * 30,
        all: Infinity,
      };

      const logTime = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      const timeInHours = timeRangeMap[timeRange] ?? Infinity;
      const matchesTime = (now - logTime) / (1000 * 60 * 60) <= timeInHours;

      return matchesSearch && matchesAction && matchesTime;
    });
  }, [logs, searchTerm, selectedAction, timeRange]);

  const exportLogs = () => {
    const exportData = filteredLogs.map((log) => ({
      timestamp: format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      action: log.action,
      performedBy: log.performedBy,
      feature: features.find((f) => f.id === log.featureId)?.name,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-audit-log-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4" />;
      case 'updated':
        return <RefreshCw className="h-4 w-4" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4" />;
      case 'promoted':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'rolled_back':
        return <History className="h-4 w-4" />;
      case 'accessed':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Audit Log</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search changes..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Action Type
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="promoted">Promoted</option>
                  <option value="rolled_back">Rolled Back</option>
                  <option value="accessed">Accessed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Timeline */}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-gray-200" />
        <div className="space-y-8">
          {filteredLogs.map((log) => {
            const feature = features.find(f => f.id === log.featureId);
            return (
              <div key={log.id} className="relative pl-16">
                <div className="absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action === 'created' ? 'bg-green-100 text-green-800' :
                              log.action === 'deleted' ? 'bg-red-100 text-red-800' :
                              log.action === 'promoted' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getActionIcon(log.action)}
                              <span className="ml-1 capitalize">
                                {log.action.replace('_', ' ')}
                              </span>
                            </span>
                            {feature && (
                              <span className="ml-2 text-sm text-gray-500">
                                {feature.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {log.performedBy}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(log.timestamp), 'PPp')}
                          </div>
                        </div>
                      </div>

                      {/* Changes */}
                      {log.details?.changes && log.details.changes.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {log.details.changes.map((change, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{change.key}:</span>
                              <div className="ml-4 space-y-1">
                                {change.oldValue !== undefined && (
                                  <div className="text-red-600">
                                    - {String(change.oldValue)}
                                  </div>
                                )}
                                {change.newValue !== undefined && (
                                  <div className="text-green-600">
                                    + {String(change.newValue)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div>IP: {log.ipAddress}</div>
                          <div>User Agent: {log.userAgent}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No matching logs found for the current filters
          </p>
        </div>
      )}
    </div>
  );
};