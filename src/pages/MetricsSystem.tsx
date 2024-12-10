// src/pages/MetricsSystem.tsx
import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '../components/ui/Card';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApplications, useMetrics } from '../hooks/useData';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Activity,
  RefreshCw,
  AlertTriangle,
  Server
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  icon: React.ReactElement;
  trend?: number;
  status?: 'success' | 'warning' | 'error';
}> = ({ title, value, unit, icon, trend, status = 'success' }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-lg bg-${status === 'success' ? 'green' : status === 'warning' ? 'yellow' : 'red'}-100 dark:bg-${status === 'success' ? 'green' : status === 'warning' ? 'yellow' : 'red'}-900`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${
            trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}% vs last hour
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const MetricsSystem: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(false); // Start with autoRefresh off

  const getTimeRangeParams = () => {
    const end = new Date();
    const start = new Date();
    switch (timeRange) {
      case '1h':
        start.setHours(end.getHours() - 1);
        break;
      case '24h':
        start.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
    }
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const { 
    data: applicationsResponse, 
    loading: appsLoading, 
    error: appsError 
  } = useApplications();

  const { 
    data: metricsResponse, 
    loading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useMetrics(selectedApp, getTimeRangeParams());

  // Handle application selection

  const handleAppChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedApp(newValue);
    // Turn off auto-refresh when changing applications
    setAutoRefresh(false);
  };

  const handleRefreshIntervalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = Number(event.target.value);
    setRefreshInterval(newInterval);
    // Reset autoRefresh when changing interval
    setAutoRefresh(false);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const applications = applicationsResponse?.data || [];
  const metrics = metricsResponse?.data || [];

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefresh && selectedApp && !metricsLoading) {
      intervalId = setInterval(() => {
        refetchMetrics();
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, selectedApp, refreshInterval, metricsLoading]);

  if (appsLoading || metricsLoading) return <LoadingSpinner />;
  if (appsError) return <Alert type="error">{appsError.message}</Alert>;
  if (metricsError) return <Alert type="error">{metricsError.message}</Alert>;

  const systemMetrics = {
    cpu: metrics?.map(m => m.cpu) || [],
    memory: metrics?.map(m => m.memory) || [],
    disk: metrics?.map(m => m.disk) || [],
    network: metrics?.map(m => m.network) || []
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      }
    },
  };

  const lineChartData = {
    labels: metrics?.map(m => new Date(m.timestamp).toLocaleTimeString()) || [],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: systemMetrics.cpu,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          System Metrics
        </h1>
        <div className="flex items-center space-x-4">
          <select
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value={10}>Refresh: 10s</option>
            <option value={30}>Refresh: 30s</option>
            <option value={60}>Refresh: 1m</option>
          </select>
          <button
            onClick={toggleAutoRefresh}
            className={`p-2 rounded-md ${
              autoRefresh 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Application Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Server className="h-5 w-5 text-gray-400" />
            <select
              value={selectedApp}
              onChange={handleAppChange}
              className="flex-1 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              disabled={metricsLoading}
            >
              <option value="">Select Application</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
              className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              disabled={metricsLoading}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={systemMetrics.cpu[systemMetrics.cpu.length - 1] || 0}
          unit="%"
          icon={<Cpu className="h-6 w-6 text-green-600" />}
          trend={2.5}
          status="success"
        />
        <MetricCard
          title="Memory Usage"
          value={systemMetrics.memory[systemMetrics.memory.length - 1] || 0}
          unit="%"
          icon={<MemoryStick className="h-6 w-6 text-yellow-600" />}
          trend={5.2}
          status="warning"
        />
        <MetricCard
          title="Disk Usage"
          value={systemMetrics.disk[systemMetrics.disk.length - 1] || 0}
          unit="%"
          icon={<HardDrive className="h-6 w-6 text-blue-600" />}
          trend={-1.3}
          status="success"
        />
        <MetricCard
          title="Network Traffic"
          value={systemMetrics.network[systemMetrics.network.length - 1] || 0}
          unit="MB/s"
          icon={<Activity className="h-6 w-6 text-purple-600" />}
          trend={8.7}
          status="success"
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
            <CardDescription>Percentage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={lineChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Distribution</CardTitle>
            <CardDescription>Usage by application</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar 
              data={{
                labels: applications.map(app => app.name),
                datasets: [{
                  label: 'Memory Usage (GB)',
                  data: applications.map(app => app.metrics.memory),
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  borderColor: 'rgb(99, 102, 241)',
                  borderWidth: 1
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent warnings and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                type: 'warning',
                message: 'High memory usage detected in Application Server',
                timestamp: '5 minutes ago'
              },
              {
                type: 'error',
                message: 'Database connection timeout',
                timestamp: '15 minutes ago'
              },
              {
                type: 'info',
                message: 'System backup completed successfully',
                timestamp: '1 hour ago'
              }
            ].map((alert, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 dark:bg-yellow-900/30' 
                    : alert.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/30'
                    : 'bg-blue-50 dark:bg-blue-900/30'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${
                  alert.type === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : alert.type === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsSystem;