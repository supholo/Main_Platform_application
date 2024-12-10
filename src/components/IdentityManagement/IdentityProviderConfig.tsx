import React, { useState } from 'react';
import { Shield, Settings, AlertTriangle, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/alert';
import { IdentityProvider } from '../../services/identityService';

interface IdentityProviderConfigProps {
  provider: IdentityProvider;
  onUpdate: (data: Partial<IdentityProvider>) => Promise<void>;
}

export const IdentityProviderConfig: React.FC<IdentityProviderConfigProps> = ({
  provider,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(provider);

  const handleSave = async () => {
    try {
      await onUpdate(config);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Identity Provider Configuration</CardTitle>
            <CardDescription>Configure external identity provider settings</CardDescription>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider Type
              </label>
              <select
                value={config.type}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  type: e.target.value as IdentityProvider['type']
                }))}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="internal">Internal Authentication</option>
                <option value="oauth2">OAuth 2.0 / OpenID Connect</option>
                <option value="saml">SAML 2.0</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={config.status}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  status: e.target.value as 'active' | 'inactive'
                }))}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {config.type === 'oauth2' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={config.config.clientId || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, clientId: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={config.config.clientSecret || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, clientSecret: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Authorization URL
                  </label>
                  <input
                    type="url"
                    value={config.config.authorizationUrl || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, authorizationUrl: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Token URL
                  </label>
                  <input
                    type="url"
                    value={config.config.tokenUrl || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, authorizationUrl: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Info URL
                  </label>
                  <input
                    type="url"
                    value={config.config.userInfoUrl || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, userInfoUrl: e.target.value }
                    }))}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Callback URL
                  </label>
                  <div className="flex items-center mt-1">
                    <input
                      type="url"
                      value={config.config.callbackUrl || ''}
                      readOnly
                      className="flex-1 rounded-md border-gray-300 bg-gray-50"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(config.config.callbackUrl || '')}
                      className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure this URL in your OAuth provider's settings
                  </p>
                </div>
              </div>
            </div>
          )}

          {config.type === 'saml' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SAML Metadata
                </label>
                <textarea
                  value={config.config.samlMetadata || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    config: { ...prev.config, samlMetadata: e.target.value }
                  }))}
                  disabled={!isEditing}
                  rows={8}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="Paste your SAML metadata XML here..."
                />
              </div>

              <Alert type="info">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Service Provider Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                      <p>Entity ID: {window.location.origin}</p>
                      <p>ACS URL: {window.location.origin}/auth/saml/callback</p>
                      <p>
                        Download SP Metadata:
                        <button className="ml-2 text-blue-600 hover:text-blue-500 underline">
                          metadata.xml
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};