// src/components/onboarding/steps/TenantDetailsStep.tsx
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Alert } from '../../ui/alert';

interface TenantDetailsFormData {
  name: string;
  domain: string;
  industry: string;
  size: string;
  contactEmail: string;
}

interface TenantDetailsStepProps {
  data: TenantDetailsFormData;
  onChange: (data: TenantDetailsFormData) => void;
  errors: Partial<Record<keyof TenantDetailsFormData, string>>;
}

export const TenantDetailsStep: React.FC<TenantDetailsStepProps> = ({ data, onChange, errors }) => {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Organization Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            placeholder="Acme Corporation"
          />
          {errors.name && (
            <Alert type="error" className="mt-1">{errors.name}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Domain
          </label>
          <input
            type="text"
            value={data.domain}
            onChange={(e) => onChange({ ...data, domain: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            placeholder="acme.com"
          />
          {errors.domain && (
            <Alert type="error" className="mt-1">{errors.domain}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Industry
          </label>
          <select
            value={data.industry}
            onChange={(e) => onChange({ ...data, industry: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">Select Industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
          {errors.industry && (
            <Alert type="error" className="mt-1">{errors.industry}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Organization Size
          </label>
          <select
            value={data.size}
            onChange={(e) => onChange({ ...data, size: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501+">501+ employees</option>
          </select>
          {errors.size && (
            <Alert type="error" className="mt-1">{errors.size}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Email
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            placeholder="admin@acme.com"
          />
          {errors.contactEmail && (
            <Alert type="error" className="mt-1">{errors.contactEmail}</Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/onboarding/steps/ApplicationsStep.tsx
interface ApplicationFormData {
  id: string;
  name: string;
  type: string;
  repository: string;
  environment: string;
}

interface ApplicationsStepProps {
  applications: ApplicationFormData[];
  onAdd: () => void;
  onUpdate: (index: number, data: ApplicationFormData) => void;
  onRemove: (index: number) => void;
  errors: Record<number, Partial<Record<keyof ApplicationFormData, string>>>;
}

export const ApplicationsStep: React.FC<ApplicationsStepProps> = ({
  applications,
  onAdd,
  onUpdate,
  onRemove,
  errors
}) => {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {applications.map((app, index) => (
          <div key={app.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Application {index + 1}
              </h3>
              <button
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Name
                </label>
                <input
                  type="text"
                  value={app.name}
                  onChange={(e) => onUpdate(index, { ...app, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                {errors[index]?.name && (
                  <Alert type="error" className="mt-1">{errors[index].name}</Alert>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Type
                </label>
                <select
                  value={app.type}
                  onChange={(e) => onUpdate(index, { ...app, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="microservice">Microservice</option>
                  <option value="webapp">Web Application</option>
                  <option value="api">API Service</option>
                </select>
                {errors[index]?.type && (
                  <Alert type="error" className="mt-1">{errors[index].type}</Alert>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={app.repository}
                  onChange={(e) => onUpdate(index, { ...app, repository: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                {errors[index]?.repository && (
                  <Alert type="error" className="mt-1">{errors[index].repository}</Alert>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Environment
                </label>
                <select
                  value={app.environment}
                  onChange={(e) => onUpdate(index, { ...app, environment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                >
                  <option value="">Select Environment</option>
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
                {errors[index]?.environment && (
                  <Alert type="error" className="mt-1">{errors[index].environment}</Alert>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Application
        </button>
      </CardContent>
    </Card>
  );
};

// Add more step components...