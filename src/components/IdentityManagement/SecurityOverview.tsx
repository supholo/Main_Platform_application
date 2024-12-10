import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { 
  Shield, AlertTriangle, Users, Key, Lock, UserCheck,
  Activity, Database, Zap, FileWarning, PieChart, ExternalLink 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSecurity } from '../../hooks/useSecurity';
import { SecurityRisk, SecurityRecommendation, SecurityMetric, BusinessMetric, ComplianceStatus, VendorRisk } from '../../types/security';
import { Alert } from '../ui/alert';
import LoadingSpinner from '../LoadingSpinner';

const SecurityMetricCard: React.FC<{
  metric: SecurityMetric;
  icon: React.ElementType;
}> = ({ metric, icon: Icon }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div className="rounded-full p-2 bg-indigo-100 dark:bg-indigo-900">
          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          metric.trend === 'up' 
            ? metric.type === 'users' || metric.type === 'mfa' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            : metric.type === 'users' || metric.type === 'mfa'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
        }`}>
          {metric.change > 0 ? '+' : ''}{metric.change}% vs last month
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {metric.type.charAt(0).toUpperCase() + metric.type.slice(1)}
        </h3>
        <p className="mt-2 text-3xl font-semibold">
          {metric.type === 'mfa' || metric.type === 'policy' 
            ? `${metric.value}%` 
            : metric.value}
        </p>
      </div>
    </CardContent>
  </Card>
);

const BusinessMetricCard: React.FC<{ metric: BusinessMetric }> = ({ metric }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {metric.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          metric.impact === 'positive' ? 'bg-green-100 text-green-800' :
          metric.impact === 'negative' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {metric.trend > 0 ? '+' : ''}{metric.trend}%
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold">
        {metric.value}
      </p>
    </CardContent>
  </Card>
);

const ComplianceStatusCard: React.FC<{ status: ComplianceStatus }> = ({ status }) => (
  <div className="flex justify-between items-center py-3">
    <div>
      <span className="font-medium">{status.framework}</span>
      <div className="text-sm text-gray-500">
        {status.findings} findings ({status.criticalFindings} critical)
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status.status === 'compliant' ? 'bg-green-100 text-green-800' :
        status.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status.status.replace('_', ' ').toUpperCase()}
      </span>
      <div className="text-sm text-gray-500">
        <div>Last: {new Date(status.lastAudit).toLocaleDateString()}</div>
        <div>Next: {new Date(status.nextAudit).toLocaleDateString()}</div>
      </div>
    </div>
  </div>
);

const VendorRiskCard: React.FC<{ vendor: VendorRisk }> = ({ vendor }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center space-x-2">
      <span className={`h-2 w-2 rounded-full ${
        vendor.risk === 'critical' ? 'bg-red-500' :
        vendor.risk === 'high' ? 'bg-orange-500' :
        vendor.risk === 'medium' ? 'bg-yellow-500' :
        'bg-green-500'
      }`} />
      <div>
        <span className="font-medium">{vendor.vendor}</span>
        {vendor.criticalServices && (
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Critical
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-500">
        {vendor.issues} {vendor.issues === 1 ? 'issue' : 'issues'}
      </span>
      <span className="text-sm text-gray-500">
        Last assessed: {new Date(vendor.lastAssessment).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const RiskItem: React.FC<{ risk: SecurityRisk }> = ({ risk }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <span className={`h-2 w-2 rounded-full mr-2 ${
        risk.severity === 'high' ? 'bg-red-500' :
        risk.severity === 'medium' ? 'bg-yellow-500' :
        'bg-green-500'
      }`} />
      <span className="text-sm">{risk.name}</span>
    </div>
    <span className="text-sm font-medium">{risk.count}</span>
  </div>
);

const RecommendationItem: React.FC<{ recommendation: SecurityRecommendation }> = ({ recommendation }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium">{recommendation.title}</p>
      <p className="text-xs text-gray-500">Priority: {recommendation.priority}</p>
    </div>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      recommendation.impact === 'critical' ? 'bg-red-100 text-red-800' :
      recommendation.impact === 'high' ? 'bg-orange-100 text-orange-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      {recommendation.impact}
    </span>
  </div>
);

const SecurityOverview: React.FC = () => {
  const { 
    securityOverview,
    businessMetrics,
    complianceStatus,
    vendorRisks,
    loading,
    error,
    refetch
  } = useSecurity();

  const [timeRange, setTimeRange] = useState('30d');

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;
  if (!securityOverview) return <Alert type="error">No security data available</Alert>;

  const metricIcons = {
    users: Users,
    logins: AlertTriangle,
    mfa: Key,
    policy: Shield
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-white">
            <div>
              <p className="text-lg font-medium opacity-90">Security Score</p>
              <h2 className="text-4xl font-bold mt-2">{securityOverview.score}/100</h2>
              <p className="mt-2 opacity-80">
                {securityOverview.score >= 80 ? 'Good' : 
                 securityOverview.score >= 60 ? 'Fair' : 'Poor'} security posture
              </p>
            </div>
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityOverview.metrics.map((metric) => (
          <SecurityMetricCard
            key={metric.id}
            metric={metric}
            icon={metricIcons[metric.type]}
          />
        ))}
      </div>

      {/* Business Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-500" />
            Business Impact Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {businessMetrics.map((metric) => (
              <BusinessMetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Incidents Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Security Incidents Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={securityOverview.incidents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mfa" stroke="#6366F1" name="MFA Issues" />
                <Line type="monotone" dataKey="suspicious" stroke="#EF4444" name="Suspicious Activity" />
                <Line type="monotone" dataKey="policy" stroke="#F59E0B" name="Policy Violations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-500" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {complianceStatus.map((status) => (
              <ComplianceStatusCard key={status.id} status={status} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Risk Assessment cards */}
      </div>

      {/* Vendor Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2 text-blue-500" />
            Third-Party Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {vendorRisks.map((vendor) => (
              <VendorRiskCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityOverview;