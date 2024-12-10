// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity,
  Server,
  Users,
  AlertTriangle,
  ChevronRight,
  Cpu,
  Database,
  HardDrive
} from 'lucide-react';
import { useApplications } from '../hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { Line } from 'react-chartjs-2';

// Add these interfaces at the top of Dashboard.tsx
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

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  onClick?: () => void;
}> = ({ title, value, subValue, icon, trend, onClick }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {subValue && (
            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{subValue}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const MetricsChart: React.FC<{
  data: Array<{ timestamp: string; value: number }>;
  loading: boolean;
  error: Error | null;
}> = ({ data, loading, error }) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage',
        data: data.map(d => d.value),
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'System Metrics'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return <Line data={chartData} options={options} />;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: applicationsResponse, loading, error } = useApplications();
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  // Safely access the applications array
  const applications = applicationsResponse?.data || [];

  const stats = {
    totalApps: applications.length,
    activeApps: applications.filter(app => app.status === 'running').length,
    errorApps: applications.filter(app => app.status === 'error').length,
    avgCpu: applications.length > 0 
      ? applications.reduce((acc, app) => acc + app.metrics.cpu, 0) / applications.length
      : 0,
    avgMemory: applications.length > 0 
      ? applications.reduce((acc, app) => acc + app.metrics.memory, 0) / applications.length
      : 0,
    totalRequests: applications.reduce((acc, app) => acc + app.metrics.requests, 0),
    totalErrors: applications.reduce((acc, app) => acc + app.metrics.errors, 0)
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Applications"
          value={stats.totalApps}
          icon={<Server className="h-6 w-6 text-indigo-600" />}
          onClick={() => navigate('/applications')}
        />
        <DashboardCard
          title="Active Applications"
          value={stats.activeApps}
          subValue={`${((stats.activeApps / stats.totalApps) * 100).toFixed(1)}%`}
          icon={<Activity className="h-6 w-6 text-green-600" />}
          onClick={() => navigate('/applications')}
        />
        <DashboardCard
          title="System Errors"
          value={stats.totalErrors}
          trend={{
            value: -12,
            label: 'vs last week'
          }}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          onClick={() => navigate('/audit-log')}
        />
        <DashboardCard
          title="Active Users"
          value="124"
          trend={{
            value: 8,
            label: 'vs last month'
          }}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          onClick={() => navigate('/users')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedMetric === 'cpu'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setSelectedMetric('cpu')}
                >
                  <Cpu className="h-5 w-5 inline-block mr-2" />
                  CPU
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedMetric === 'memory'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setSelectedMetric('memory')}
                >
                  <Database className="h-5 w-5 inline-block mr-2" />
                  Memory
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${
                    selectedMetric === 'disk'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setSelectedMetric('disk')}
                >
                  <HardDrive className="h-5 w-5 inline-block mr-2" />
                  Disk
                </button>
              </div>
            </div>
            <MetricsChart
              data={[]}  // Replace with actual metrics data
              loading={loading}
              error={error}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map(app => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {app.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Version {app.version}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.lastDeployment.status === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {app.lastDeployment.status}
                    </span>
                    <ChevronRight className="ml-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;