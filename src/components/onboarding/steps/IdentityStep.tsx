// src/components/onboarding/steps/IdentityStep.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Shield, Key, Lock } from 'lucide-react';

interface IdentityConfig {
  provider: 'internal' | 'oauth2' | 'saml';
  config: {
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    metadataUrl?: string;
    certificateData?: string;
  };
  settings: {
    mfaEnabled: boolean;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
    };
  };
}

interface IdentityStepProps {
  data: IdentityConfig;
  onChange: (data: IdentityConfig) => void;
  errors: Record<string, string>;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleSettingsChange = (key: string, value: boolean | number) => {
    onChange({
      ...data,
      settings: {
        ...data.settings,
        passwordPolicy: {
          ...data.settings.passwordPolicy,
          [key]: value
        }
      }
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    onChange({
      ...data,
      config: {
        ...data.config,
        [key]: value
      }
    });
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
            <Shield className="mr-2 h-5 w-5 text-indigo-500" />
            Identity Provider Configuration
          </h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Identity Provider Type
            </label>
            <select
              value={data.provider}
              onChange={(e) => onChange({ ...data, provider: e.target.value as IdentityConfig['provider'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="internal">Internal Authentication</option>
              <option value="oauth2">OAuth 2.0 / OpenID Connect</option>
              <option value="saml">SAML 2.0</option>
            </select>
            {errors.provider && (
              <Alert type="error" className="mt-1">{errors.provider}</Alert>
            )}
          </div>

          {data.provider === 'oauth2' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client ID
                </label>
                <input
                  type="text"
                  value={data.config.clientId || ''}
                  onChange={(e) => handleConfigChange('clientId', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={data.config.clientSecret || ''}
                  onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Authorization URL
                </label>
                <input
                  type="url"
                  value={data.config.authorizationUrl || ''}
                  onChange={(e) => handleConfigChange('authorizationUrl', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token URL
                </label>
                <input
                  type="url"
                  value={data.config.tokenUrl || ''}
                  onChange={(e) => handleConfigChange('tokenUrl', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          )}

          {data.provider === 'saml' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Metadata URL
                </label>
                <input
                  type="url"
                  value={data.config.metadataUrl || ''}
                  onChange={(e) => handleConfigChange('metadataUrl', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  X.509 Certificate
                </label>
                <textarea
                  value={data.config.certificateData || ''}
                  onChange={(e) => handleConfigChange('certificateData', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
            <Key className="mr-2 h-5 w-5 text-indigo-500" />
            Security Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.settings.mfaEnabled}
                  onChange={(e) => onChange({
                    ...data,
                    settings: {
                      ...data.settings,
                      mfaEnabled: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Enable Multi-Factor Authentication
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Password Policy
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="32"
                    value={data.settings.passwordPolicy.minLength}
                    onChange={(e) => handleSettingsChange('minLength', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.settings.passwordPolicy.requireNumbers}
                      onChange={(e) => handleSettingsChange('requireNumbers', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Require Numbers
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.settings.passwordPolicy.requireSymbols}
                      onChange={(e) => handleSettingsChange('requireSymbols', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Require Symbols
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.settings.passwordPolicy.requireUppercase}
                      onChange={(e) => handleSettingsChange('requireUppercase', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Require Uppercase
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};