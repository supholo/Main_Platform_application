// src/components/Applications/ApplicationList.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Settings,
  GitBranch,
  Terminal,
  BarChart2,
  ArrowUpRight,
  AlertTriangle,
  Check,
  Clock,
  Menu,
  CheckSquare,
  XSquare,
  Trash2
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../ui/Card';
import { Application, ApplicationStatus } from '../../types/application';

interface ApplicationListProps {
  applications: Application[];
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onDelete,
  onViewDetails
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'maintenance':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'cicd':
        return <GitBranch className="h-4 w-4" />;
      case 'logging':
        return <Terminal className="h-4 w-4" />;
      case 'metrics':
        return <BarChart2 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your applications and their integrations
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/applications/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {app.description}
                  </p>
                </div>
                <div className="relative">
                  <Menu className="h-5 w-5 text-gray-400 cursor-pointer" />
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="py-1">
                      <button
                        onClick={() => onViewDetails(app.id)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => onDelete(app.id)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Status */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Integrations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {app.integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        integration.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {getIntegrationIcon(integration.type)}
                      <span className="ml-1">
                        {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Status */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {app.environments.map((env) => (
                    <span
                      key={env}
                      className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {env}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => onViewDetails(app.id)}
                  className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </button>
                <button
                  onClick={() => navigate(`/applications/${app.id}/dashboard`)}
                  className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No applications found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new application
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/applications/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};