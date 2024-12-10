// src/components/IdentityManagement/SecurityFeatures.tsx

import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Clock, MapPin} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/alert';
import {
  IdentityAuditEvent,
  IdentityComplianceReport,
  AccessReview
} from '../../types/identityAudit';
import { format } from 'date-fns';

interface AccessPolicy {
  id: string;
  name: string;
  conditions: {
    ipRanges?: string[];
    timeWindows?: Array<{
      start: string;
      end: string;
      days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[];
    }>;
    locations?: string[];
    deviceTypes?: string[];
    riskThreshold?: number;
  };
  actions: {
    requireMFA?: boolean;
    requireApproval?: boolean;
    notifyAdmins?: boolean;
    blockAccess?: boolean;
  };
}

export const AccessPolicyManager: React.FC<{
  policies: AccessPolicy[];
  onUpdatePolicy: (policy: AccessPolicy) => Promise<void>;
  onCreatePolicy: (policy: Partial<AccessPolicy>) => Promise<void>;
}> = ({ policies, onUpdatePolicy, onCreatePolicy }) => {
  const [editingPolicy, setEditingPolicy] = useState<AccessPolicy | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-indigo-500" />
          Access Policies
        </CardTitle>
        <CardDescription>
          Configure advanced access control policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {policies.map(policy => (
            <div 
              key={policy.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{policy.name}</h3>
                  <div className="mt-2 space-y-2">
                    {policy.conditions.ipRanges && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        IP Ranges: {policy.conditions.ipRanges.join(', ')}
                      </div>
                    )}
                    {policy.conditions.timeWindows && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Time Windows: {policy.conditions.timeWindows.length} configured
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditingPolicy(policy)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const DataAccessAudit: React.FC<{
  identityEvents: IdentityAuditEvent[];
  complianceReports: IdentityComplianceReport[];
  accessReviews: AccessReview[];
  onGenerateReport: () => Promise<void>;
  onInitiateReview: (userId: string) => Promise<void>;
}> = ({ 
  identityEvents, 
  complianceReports, 
  accessReviews,
  onGenerateReport,
  onInitiateReview 
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'compliance' | 'reviews'>('events');
  const [filters, setFilters] = useState({
    eventType: [] as string[],
    severity: [] as string[],
    dateRange: '7d'
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Identity Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{identityEvents.length}</div>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {identityEvents.filter(e => e.eventType === 'policy.violation').length}
            </div>
            <p className="text-sm text-gray-500">Active violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {accessReviews.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'events', label: 'Audit Events' },
            { id: 'compliance', label: 'Compliance Reports' },
            { id: 'reviews', label: 'Access Reviews' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="rounded-md border-gray-300"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom range</option>
            </select>
            {/* Add more filters */}
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {identityEvents.map(event => (
              <div
                key={event.id}
                className="p-4 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.risk.level === 'critical' ? 'bg-red-100 text-red-800' :
                        event.risk.level === 'high' ? 'bg-orange-100 text-orange-800' :
                        event.risk.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.risk.level.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{event.action}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {event.target.type}: {event.target.name}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(event.timestamp), 'PPpp')}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Actor:</span> {event.actor.name}
                  </div>
                  {event.metadata.location && (
                    <div>
                      <span className="font-medium">Location:</span> {event.metadata.location}
                    </div>
                  )}
                </div>

                {event.metadata.changes && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Changes:</span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(event.metadata.changes).map(([field, { old, new: newValue }]) => (
                        <div key={field} className="flex items-center space-x-2">
                          <span className="text-gray-500">{field}:</span>
                          <span className="line-through text-red-500">{old}</span>
                          <span>→</span>
                          <span className="text-green-500">{newValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-4">
          {/* Generate Report Button */}
          <div className="flex justify-end">
            <button
              onClick={onGenerateReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Generate New Report
            </button>
          </div>

          {/* Reports List */}
          {complianceReports.map(report => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{report.type.replace('_', ' ').toUpperCase()}</CardTitle>
                    <CardDescription>
                      Generated on {format(new Date(report.timestamp), 'PP')}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    report.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(report.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm text-gray-500">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Findings */}
                <div className="space-y-4">
                  {report.findings.map(finding => (
                    <div
                      key={finding.id}
                      className={`p-4 rounded-lg ${
                        finding.severity === 'critical' ? 'bg-red-50' :
                        finding.severity === 'high' ? 'bg-orange-50' :
                        finding.severity === 'medium' ? 'bg-yellow-50' :
                        'bg-green-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{finding.category}</h4>
                          <p className="text-sm text-gray-600">{finding.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          finding.status === 'open' ? 'bg-red-100 text-red-800' :
                          finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {finding.status.toUpperCase()}
                        </span>
                      </div>
                      {finding.recommendation && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Recommendation:</span> {finding.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {accessReviews.map(review => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{review.userName}</CardTitle>
                    <CardDescription>
                      Review initiated on {format(new Date(review.reviewDate), 'PP')}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                    review.status === 'revoked' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {review.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.type}:</span> {item.name}
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.status === 'pending' ? (
                          <>
                            <button className="text-green-600 hover:text-green-700">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-700">
                              Revoke
                            </button>
                          </>
                        ) : (
                          <span className={item.decision === 'maintain' ? 'text-green-600' : 'text-red-600'}>
                            {item.decision.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdvancedSecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    passwordPolicies: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventReuseCount: 5,
      expiryDays: 90,
      allowPassphrases: true,
      minPassphraseLength: 20
    },
    mfaPolicies: {
      requireAll: false,
      allowedMethods: ['totp', 'webauthn', 'email'],
      graceLoginCount: 3,
      rememberDeviceDays: 30
    },
    sessionPolicies: {
      maxConcurrentSessions: 3,
      absoluteTimeout: 12, // hours
      idleTimeout: 30, // minutes
      enforceUniqueDevices: true,
      requireReauthForSensitive: true
    },
    riskBasedAuth: {
      enabled: true,
      thresholds: {
        low: { score: 25, action: 'allow' },
        medium: { score: 50, action: 'mfa' },
        high: { score: 75, action: 'block' }
      },
      factors: {
        newDevice: 25,
        newLocation: 20,
        impossibleTravel: 50,
        suspiciousIp: 30,
        failedAttempts: 15
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-5 w-5 mr-2 text-indigo-500" />
          Advanced Security Settings
        </CardTitle>
        <CardDescription>
          Configure advanced security policies and risk-based authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Password Policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Password Policies</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Length
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicies.minLength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    passwordPolicies: {
                      ...prev.passwordPolicies,
                      minLength: parseInt(e.target.value)
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {/* Add more password policy controls */}
            </div>
          </div>

          {/* Risk-Based Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Risk-Based Authentication</h3>
            <Alert type="info">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk-based authentication adapts security requirements based on the calculated risk score of each login attempt.
            </Alert>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable Risk-Based Authentication</span>
                <input
                  type="checkbox"
                  checked={settings.riskBasedAuth.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    riskBasedAuth: {
                      ...prev.riskBasedAuth,
                      enabled: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              {/* Add risk threshold controls */}
            </div>
          </div>

          {/* Session Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Session Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Concurrent Sessions
                </label>
                <input
                  type="number"
                  value={settings.sessionPolicies.maxConcurrentSessions}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sessionPolicies: {
                      ...prev.sessionPolicies,
                      maxConcurrentSessions: parseInt(e.target.value)
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {/* Add more session management controls */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};