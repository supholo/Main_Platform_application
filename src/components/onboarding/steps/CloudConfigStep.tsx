import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Alert } from '../../ui/alert';
import { Cloud, Server, Key } from 'lucide-react';

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

  const regions = {
    aws: ['us-east-1', 'us-west-2', 'eu-west-1'],
    azure: ['eastus', 'westeurope', 'southeastasia'],
    gcp: ['us-central1', 'europe-west1', 'asia-east1']
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardContent className="space-y-8 p-6">
        <div className="space-y-6">
          <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Cloud className="mr-2 h-6 w-6 text-indigo-500" />
            Cloud Provider Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cloud Provider
              </label>
              <select
                value={data.provider}
                onChange={(e) => onChange({ ...data, provider: e.target.value })}
                className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Provider</option>
                <option value="aws">Amazon Web Services</option>
                <option value="azure">Microsoft Azure</option>
                <option value="gcp">Google Cloud Platform</option>
              </select>
              {errors.provider && (
                <Alert type="error" className="mt-2">{errors.provider}</Alert>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Region
              </label>
              <select
                value={data.region}
                onChange={(e) => onChange({ ...data, region: e.target.value })}
                className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Region</option>
                {data.provider && regions[data.provider as keyof typeof regions]?.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && (
                <Alert type="error" className="mt-2">{errors.region}</Alert>
              )}
            </div>
          </div>
        </div>

        {data.provider && (
          <div className="space-y-6 border-t pt-6">
            <h4 className="flex items-center text-lg font-medium text-gray-900 dark:text-white">
              <Key className="mr-2 h-5 w-5 text-indigo-500" />
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
                    className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors['credentials.accessKeyId'] && (
                    <Alert type="error" className="mt-2">{errors['credentials.accessKeyId']}</Alert>
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
                    className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors['credentials.secretAccessKey'] && (
                    <Alert type="error" className="mt-2">{errors['credentials.secretAccessKey']}</Alert>
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
                    className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {data.provider === 'gcp' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service Account Key (JSON)
                </label>
                <textarea
                  value={data.credentials.clientSecret || ''}
                  onChange={(e) => handleCredentialChange('clientSecret', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CloudConfigStep;

