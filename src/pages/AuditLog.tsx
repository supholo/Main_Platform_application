// src/pages/AuditLog.tsx
import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuditLogs } from '../hooks/useData';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert } from '../components/ui/alert';
import { formatDate } from '../lib/utils';

interface AuditLogFilters {
  startDate: string;
  endDate: string;
  searchTerm: string;
  severity: string[];
  resource: string[];
}

const AuditLog: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({
    startDate: '',
    endDate: '',
    searchTerm: '',
    severity: [],
    resource: []
  });

  interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: {
      name: string;
      email: string;
    };
    action: string;
    resource: string;
    status: 'success' | 'error';
    details: string;
  }

  const { data: auditResponse, loading, error, refetch } = useAuditLogs(filters);
  
  // Safely access the data array
  const logs: AuditLogEntry[] = auditResponse?.data || [];
  

  const updateFilter = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key: 'severity' | 'resource', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const handleExport = () => {
    if (!logs.length) return;
    
    const csv = logs.map(log => ({
      timestamp: log.timestamp,
      actor: log.actor.name,
      action: log.action,
      resource: log.resource,
      status: log.status,
      details: log.details
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csv[0]).join(",") + "\n"
      + csv.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-log-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Audit Log
        </h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Range
                </span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                  className="block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                  className="block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Tag className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Severity
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['info', 'warning', 'error'].map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleFilter('severity', severity)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      filters.severity.includes(severity)
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Resources
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['user', 'application', 'deployment', 'system'].map(resource => (
                  <button
                    key={resource}
                    onClick={() => toggleFilter('resource', resource)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      filters.resource.includes(resource)
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {resource}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <Alert type="error">{error.message}</Alert>
          ) : logs.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resource
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.actor.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.actor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;