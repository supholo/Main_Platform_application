import React, { useState } from 'react';
import { Key, Plus, Copy, AlertTriangle, Check, X, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/alert';
import { ApiKey, User } from '../../services/identityService';

interface ApiKeyManagerProps {
  user: User;
  onCreateKey: (data: { name: string; scopes: string[]; expires: string }) => Promise<void>;
  onRevokeKey: (keyId: string) => Promise<void>;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  user,
  onCreateKey,
  onRevokeKey
}) => {
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    scopes: [] as string[],
    expires: ''
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const availableScopes = [
    { value: 'read:users', label: 'Read Users' },
    { value: 'write:users', label: 'Modify Users' },
    { value: 'read:roles', label: 'Read Roles' },
    { value: 'write:roles', label: 'Modify Roles' },
    { value: 'read:logs', label: 'Read Audit Logs' }
  ];

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateKey(newKeyData);
      setShowNewKeyForm(false);
      setNewKeyData({ name: '', scopes: [], expires: '' });
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleScopeToggle = (scope: string) => {
    setNewKeyData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API access keys for this user</CardDescription>
          </div>
          <button
            onClick={() => setShowNewKeyForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Key
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {showNewKeyForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Development API Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Scopes
                </label>
                <div className="mt-2 space-y-2">
                  {availableScopes.map(scope => (
                    <label key={scope.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyData.scopes.includes(scope.value)}
                        onChange={() => handleScopeToggle(scope.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {scope.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={newKeyData.expires}
                  onChange={(e) => setNewKeyData(prev => ({ ...prev, expires: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewKeyForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {user.apiAccess?.keys.map(key => (
            <div
              key={key.id}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {key.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(key.created).toLocaleDateString()}
                  </p>
                  {key.lastUsed && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last used: {new Date(key.lastUsed).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    {copiedKey === key.key ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => onRevokeKey(key.id)}
                    className="p-2 text-red-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {key.scopes.map(scope => (
                    <span
                      key={scope}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {key.status === 'active' && new Date(key.expires) < new Date() && (
                <Alert type="warning" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="ml-2">This key has expired</span>
                </Alert>
              )}
            </div>
          ))}

          {(!user.apiAccess?.keys || user.apiAccess.keys.length === 0) && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys have been created yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};