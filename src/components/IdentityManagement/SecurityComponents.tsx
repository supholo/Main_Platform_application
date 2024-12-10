// src/components/IdentityManagement/SecurityComponents.tsx
import React, { useState } from 'react';
import { Shield, Key, AlertTriangle, Clock, Activity, Copy, X, Plus, Loader2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { User } from '../../services/identityService';

// Risk Score Calculator Component
export const UserRiskScore: React.FC<{ user: User }> = ({ user }) => {
  const calculateRiskScore = (user: User) => {
    let score = 100; // Start with perfect score
    const factors = [
      { condition: !user.mfaEnabled, deduction: 30, reason: 'No MFA enabled' },
      { condition: user.apiAccess?.keys.length > 3, deduction: 15, reason: 'Multiple API keys' },
      { condition: user.status === 'inactive', deduction: 20, reason: 'Inactive account' },
      // Add more risk factors
    ];

    const risksFound = factors
      .filter(f => f.condition)
      .map(f => ({ deduction: f.deduction, reason: f.reason }));

    return {
      score: Math.max(0, score - risksFound.reduce((acc, r) => acc + r.deduction, 0)),
      risks: risksFound
    };
  };

  const { score, risks } = calculateRiskScore(user);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className={`h-5 w-5 mr-2 ${
            score > 70 ? 'text-green-500' : 
            score > 40 ? 'text-yellow-500' : 
            'text-red-500'
          }`} />
          Security Score: {score}/100
        </CardTitle>
      </CardHeader>
      <CardContent>
        {risks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Risk Factors:</p>
            {risks.map((risk, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                {risk.reason} (-{risk.deduction})
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Session Activity Monitor
export const SessionMonitor: React.FC<{
  sessions: Array<{
    id: string;
    deviceInfo: string;
    location: string;
    lastActivity: string;
    isActive: boolean;
  }>
}> = ({ sessions }) => (
  <Card>
    <CardHeader>
      <CardTitle>Active Sessions</CardTitle>
      <CardDescription>Monitor and manage active user sessions</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Activity className={`h-5 w-5 ${session.isActive ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium">{session.deviceInfo}</p>
                <p className="text-xs text-gray-500">{session.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(session.lastActivity).toLocaleString()}
              </span>
              <button className="text-red-600 text-sm hover:text-red-700">
                Terminate
              </button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Advanced API Key Management
export const ApiKeyManager: React.FC<{
  user: User;
  onCreateKey: (data: { name: string; scopes: string[]; expires: string }) => Promise<void>;
  onRevokeKey: (keyId: string) => Promise<void>;
  onClose: () => void;
}> = ({ user, onCreateKey, onRevokeKey, onClose }) => {
  const [newKey, setNewKey] = useState({
    name: '',
    expires: '',
    scopes: [] as string[],
  });

  const availableScopes = [
    { value: 'read:profile', label: 'Read Profile', description: 'View user profile information' },
    { value: 'write:profile', label: 'Write Profile', description: 'Modify user profile information' },
    { value: 'read:data', label: 'Read Data', description: 'Access user data' },
    { value: 'write:data', label: 'Write Data', description: 'Modify user data' },
    // Add more scopes as needed
  ];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.name || !newKey.expires || newKey.scopes.length === 0) {
      // Show validation error
      return;
    }

    setLoading(true);
    try {
      await onCreateKey(newKey);
      setShowCreateForm(false);
      setNewKey({ name: '', expires: '', scopes: [] });
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setLoading(true);
      try {
        await onRevokeKey(keyId);
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">API Key Management</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        {!showCreateForm ? (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New API Key
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Key Name
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Development API Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                value={newKey.expires}
                onChange={(e) => setNewKey({ ...newKey, expires: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scopes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-4 border rounded-md">
                {availableScopes.map(scope => (
                  <div key={scope.value} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={newKey.scopes.includes(scope.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKey({
                            ...newKey,
                            scopes: [...newKey.scopes, scope.value]
                          });
                        } else {
                          setNewKey({
                            ...newKey,
                            scopes: newKey.scopes.filter(s => s !== scope.value)
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{scope.label}</p>
                      <p className="text-xs text-gray-500">{scope.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Create Key
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {user.apiAccess?.keys.map(key => (
            <div
              key={key.id}
              className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {key.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(key.created).toLocaleDateString()}
                  </p>
                  {key.lastUsed && (
                    <p className="text-sm text-gray-500">
                      Last used: {new Date(key.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {key.scopes.map(scope => (
                      <span
                        key={scope}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {key.status === 'active' ? (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      Revoke
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Revoked
                    </span>
                  )}
                </div>
              </div>
              
              {key.status === 'active' && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">API Key</p>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {key.key}
                      </code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(key.key);
                        // Show copy success message
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Expires: {new Date(key.expires).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}

          {(!user.apiAccess?.keys || user.apiAccess.keys.length === 0) && (
            <div className="text-center py-6 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys have been created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};