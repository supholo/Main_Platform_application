import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Alert } from '../../ui/alert';
import { Building, Globe, Briefcase, Users, Mail } from 'lucide-react';

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
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tenant Details</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Building className="mr-2 h-5 w-5 text-indigo-500" />
              Organization Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Acme Corporation"
            />
            {errors.name && (
              <Alert type="error" className="mt-1">{errors.name}</Alert>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Globe className="mr-2 h-5 w-5 text-indigo-500" />
              Domain
            </label>
            <input
              type="text"
              value={data.domain}
              onChange={(e) => onChange({ ...data, domain: e.target.value })}
              className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="acme.com"
            />
            {errors.domain && (
              <Alert type="error" className="mt-1">{errors.domain}</Alert>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Briefcase className="mr-2 h-5 w-5 text-indigo-500" />
              Industry
            </label>
            <select
              value={data.industry}
              onChange={(e) => onChange({ ...data, industry: e.target.value })}
              className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="mr-2 h-5 w-5 text-indigo-500" />
              Organization Size
            </label>
            <select
              value={data.size}
              onChange={(e) => onChange({ ...data, size: e.target.value })}
              className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <Mail className="mr-2 h-5 w-5 text-indigo-500" />
              Contact Email
            </label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
              className="w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@acme.com"
            />
            {errors.contactEmail && (
              <Alert type="error" className="mt-1">{errors.contactEmail}</Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantDetailsStep;

