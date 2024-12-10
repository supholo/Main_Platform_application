// src/components/onboarding/steps/CloudConfigStep.tsx
import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Alert } from '../..//ui/alert';

interface CloudConfigData {
  provider: string;
  region: string;
  credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

interface CloudConfigStepProps {
  data: CloudConfigData;
  onChange: (data: CloudConfigData) => void;
  errors: Record<string, string>;
}

export const CloudConfigStep: React.FC<CloudConfigStepProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleCredentialChange = (key: string, value: string) => {
    onChange({
      ...data,
      credentials: {
        ...data.credentials,
        [key]: value
      }
    });
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cloud Provider
          </label>
          <select
            value={data.provider}
            onChange={(e) => onChange({ ...data, provider: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">Select Provider</option>
            <option value="aws">Amazon Web Services</option>
            <option value="azure">Microsoft Azure</option>
            <option value="gcp">Google Cloud Platform</option>
          </select>
          {errors.provider && (
            <Alert type="error" className="mt-1">{errors.provider}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Region
          </label>
          <select
            value={data.region}
            onChange={(e) => onChange({ ...data, region: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">Select Region</option>
            {data.provider === 'aws' && (
              <>
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">EU (Ireland)</option>
              </>
            )}
            {data.provider === 'azure' && (
              <>
                <option value="eastus">East US</option>
                <option value="westeurope">West Europe</option>
                <option value="southeastasia">Southeast Asia</option>
              </>
            )}
            {data.provider === 'gcp' && (
              <>
                <option value="us-central1">US Central</option>
                <option value="europe-west1">Europe West</option>
                <option value="asia-east1">Asia East</option>
              </>
            )}
          </select>
          {errors.region && (
            <Alert type="error" className="mt-1">{errors.region}</Alert>
          )}
        </div>

        {data.provider && (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Credentials
            </h4>
            
            {data.provider === 'aws' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    value={data.credentials.accessKeyId || ''}
                    onChange={(e) => handleCredentialChange('accessKeyId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  {errors['credentials.accessKeyId'] && (
                    <Alert type="error" className="mt-1">{errors['credentials.accessKeyId']}</Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    value={data.credentials.secretAccessKey || ''}
                    onChange={(e) => handleCredentialChange('secretAccessKey', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  {errors['credentials.secretAccessKey'] && (
                    <Alert type="error" className="mt-1">{errors['credentials.secretAccessKey']}</Alert>
                  )}
                </div>
              </>
            )}

            {data.provider === 'azure' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant ID
                  </label>
                  <input
                    type="text"
                    value={data.credentials.tenantId || ''}
                    onChange={(e) => handleCredentialChange('tenantId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={data.credentials.clientId || ''}
                    onChange={(e) => handleCredentialChange('clientId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={data.credentials.clientSecret || ''}
                    onChange={(e) => handleCredentialChange('clientSecret', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Continue with IdentityStep, NotificationsStep, and RolesStep...