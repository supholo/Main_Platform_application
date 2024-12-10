// src/components/ConfigurationManagement/ConfigurationManagement.tsx

import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  GitBranch, 
  History,
  Shield, 
  Zap,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Diff,
  FileCode,
  Archive
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../components/ui/Card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useConfiguration } from '../hooks/useConfiguration';
import { Configuration, ConfigurationEnvironment, ConfigurationTemplate } from '../types/configuration';

// Import sub-components (we'll create these next)
import { ConfigurationsList } from '../components/ConfigurationManagement/ConfigurationsList';
import { ConfigurationEditor } from '../components/ConfigurationManagement/ConfigurationEditor';
import { VersionHistory } from '../components/ConfigurationManagement/VersionHistory';
import { PromotionManager } from '../components/ConfigurationManagement/PromotionManager';
import { EnvironmentComparison } from '../components/ConfigurationManagement/EnvironmentComparison';
import { ConfigurationTemplates } from '../components/ConfigurationManagement/ConfigurationTemplates';
import { AuditLog } from '../components/ConfigurationManagement/AuditLog';

const ConfigurationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('configurations');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const {
    configurations,
    templates,
    auditLogs,
    versions,
    promotions,
    environmentComparison,
    selectedEnvironment,
    loading,
    error,
    setSelectedEnvironment,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    rollbackVersion,
    promoteConfiguration,
    compareEnvironments,
    createFromTemplate,
    refetch
  } = useConfiguration();

  const handleEnvironmentChange = (env: ConfigurationEnvironment) => {
    setSelectedEnvironment(env);
  };

  const handleRollback = async (configId: string, version: number) => {
    await rollbackVersion(configId, version);
  };

  const handleUseTemplate = async (templateId: string, data: Partial<Configuration>) => {
    await createFromTemplate(templateId, data);
  };

  const handleCreateTemplate = async (template: Partial<ConfigurationTemplate>) => {
    // Implement template creation logic here
    // This should match your API or data management logic
    console.log('Creating template:', template);
  };

  // Handler for updating template
  const handleUpdateTemplate = async (id: string, template: Partial<ConfigurationTemplate>) => {
    // Implement template update logic here
    console.log('Updating template:', id, template);
  };

  // Handler for deleting template
  const handleDeleteTemplate = async (id: string) => {
    // Implement template deletion logic here
    console.log('Deleting template:', id);
  };

  const handlePromote = async (
    configId: string,
    sourceEnv: ConfigurationEnvironment,
    targetEnv: ConfigurationEnvironment
  ) => {
    await promoteConfiguration(configId, sourceEnv, targetEnv);
  };

  const handleCompare = async (
    env1: ConfigurationEnvironment,
    env2: ConfigurationEnvironment
  ) => {
    await compareEnvironments(env1, env2);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Configuration Management
        </h1>
        <div className="flex space-x-4">
          <select
            value={selectedEnvironment}
            onChange={(e) => handleEnvironmentChange(e.target.value as ConfigurationEnvironment)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="qa">QA</option>
            <option value="production">Production</option>
          </select>
          <button
            onClick={() => setShowEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Configuration
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Diff className="h-4 w-4 mr-2" />
            Compare Environments
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configurations">
            <Settings className="h-5 w-5 mr-2" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileCode className="h-5 w-5 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="h-5 w-5 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <GitBranch className="h-5 w-5 mr-2" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="h-5 w-5 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurations">
          <ConfigurationsList
            configurations={configurations}
            onEdit={(id) => {
              setSelectedConfigId(id);
              setShowEditor(true);
            }}
            onDelete={deleteConfiguration}
            onPromote={(id) => {
              setSelectedConfigId(id);
              setActiveTab('promotions');
            }}
          />
        </TabsContent>

        <TabsContent value="templates">
          <ConfigurationTemplates
            templates={templates}
            onUseTemplate={handleUseTemplate}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        </TabsContent>

        <TabsContent value="versions">
          <VersionHistory
            versions={versions}
            configurations={configurations}
            onRollback={handleRollback}
          />
        </TabsContent>

        <TabsContent value="promotions">
          <PromotionManager
            configurations={configurations}
            promotions={promotions}
            selectedEnvironment={selectedEnvironment}
            onPromote={handlePromote}
          />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog
            logs={auditLogs}
            configurations={configurations}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showEditor && (
        <ConfigurationEditor
          configId={selectedConfigId || undefined}
          environment={selectedEnvironment}
          onSave={async (data) => {
            if (selectedConfigId) {
              await updateConfiguration(selectedConfigId, data);
            } else {
              await createConfiguration(data);
            }
            setShowEditor(false);
            setSelectedConfigId(null);
          }}
          onClose={() => {
            setShowEditor(false);
            setSelectedConfigId(null);
          }}
          initialData={selectedConfigId ? configurations.find(c => c.id === selectedConfigId) : undefined}
        />
      )}

      {showComparison && (
        <EnvironmentComparison
          currentEnvironment={selectedEnvironment}
          comparison={environmentComparison}
          onCompare={handleCompare}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default ConfigurationManagement;