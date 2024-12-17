// src/components/FeatureManagement/FeatureMetricsView.tsx

import React, { useState, useMemo } from 'react';
import { 
  BarChart as BarChartIcon,
  ArrowUp,
  ArrowDown,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Feature, FeatureEnvironment, FeatureMetrics } from '../../types/feature';
import { format } from 'date-fns';

interface FeatureMetricsViewProps {
  features: Feature[];
  metrics: Record<string, FeatureMetrics[]>;
  selectedEnvironment: FeatureEnvironment;
}

export const FeatureMetricsView: React.FC<FeatureMetricsViewProps> = ({
  features,
  metrics,
  selectedEnvironment
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(
    features[0]?.id || ''
  );
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d

  const selectedMetrics = useMemo(() => {
    return metrics[selectedFeature]?.filter(
      m => m.environment === selectedEnvironment
    ) || [];
  }, [metrics, selectedFeature, selectedEnvironment]);

  const aggregatedMetrics = useMemo(() => {
    if (!selectedMetrics.length) return null;

    const evaluations = selectedMetrics.reduce((sum, m) => sum + m.data.evaluations, 0);
    const enabled = selectedMetrics.reduce((sum, m) => sum + m.data.enabled, 0);
    const disabled = selectedMetrics.reduce((sum, m) => sum + m.data.disabled, 0);
    const errors = selectedMetrics.reduce((sum, m) => sum + m.data.errors, 0);
    const avgLatency = selectedMetrics.reduce((sum, m) => sum + m.data.latency, 0) / selectedMetrics.length;

    return {
      evaluations,
      enabled,
      disabled,
      errors,
      avgLatency,
      enabledPercentage: (enabled / evaluations) * 100
    };
  }, [selectedMetrics]);

  // Transform metrics for charts
  const chartData = useMemo(() => {
    return selectedMetrics.map(m => ({
      timestamp: format(new Date(m.timestamp), 'MMM d, HH:mm'),
      evaluations: m.data.evaluations,
      enabled: m.data.enabled,
      disabled: m.data.disabled,
      errors: m.data.errors,
      latency: m.data.latency
    }));
  }, [selectedMetrics]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.name}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Metrics Overview */}
      {aggregatedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Evaluations</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {aggregatedMetrics.evaluations.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Enabled Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {aggregatedMetrics.enabledPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center">
                  {aggregatedMetrics.enabledPercentage > 50 ? (
                    <ArrowUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Latency</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {aggregatedMetrics.avgLatency.toFixed(2)}ms
                  </p>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Error Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {((aggregatedMetrics.errors / aggregatedMetrics.evaluations) * 100).toFixed(2)}%
                  </p>
                </div>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="evaluations"
                    stroke="#6366F1"
                    name="Total Evaluations"
                  />
                  <Line
                    type="monotone"
                    dataKey="enabled"
                    stroke="#22C55E"
                    name="Enabled"
                  />
                  <Line
                    type="monotone"
                    dataKey="disabled"
                    stroke="#EF4444"
                    name="Disabled"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#8B5CF6"
                    name="Latency (ms)"
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#F59E0B"
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {!selectedMetrics.length && (
        <div className="text-center py-12">
          <BarChartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No metrics data available for the selected feature and environment
          </p>
        </div>
      )}
    </div>
  );
};