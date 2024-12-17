// src/components/FeatureManagement/FeatureManagement.tsx

import React, { useState } from 'react';
import { 
  Flag, 
  GitBranch, 
  History,
  Shield,
  Plus,
  RefreshCw,
  Diff,
  Beaker,
  BarChart
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFeature } from '../hooks/useFeature';
import { Feature, FeatureEnvironment } from '../types/feature';

// Import child components
import { FeatureList } from '../components/FeatureManagement/FeatureList';
import { FeatureEditor } from '../components/FeatureManagement/FeatureEditor';
import { FeatureVersionHistory } from '../components/FeatureManagement/FeatureVersionHistory';
import { FeaturePromotionManager } from '../components/FeatureManagement/FeaturePromotionManager';
import { FeatureExperiments } from '../components/FeatureManagement/FeatureExperiments';
import { FeatureAuditLog } from '../components/FeatureManagement/FeatureAuditLog';
import { FeatureMetricsView } from '../components/FeatureManagement/FeatureMetricsView';
import { EnvironmentComparison } from '../components/FeatureManagement/EnvironmentComparison';

const FeatureManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('features');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const {
    features,
    templates,
    auditLogs,
    versions,
    promotions,
    experiments,
    metrics,
    environmentComparison,
    selectedEnvironment,
    loading,
    error,
    setSelectedEnvironment,
    createFeature,
    updateFeature,
    deleteFeature,
    rollbackVersion,
    promoteFeature,
    createExperiment,
    compareEnvironments,
    refetch
  } = useFeature();

  const handleEnvironmentChange = (env: FeatureEnvironment) => {
    setSelectedEnvironment(env);
  };

  const handleCreateFeature = async (data: Partial<Feature>) => {
    await createFeature(data);
    setShowEditor(false);
    setSelectedFeatureId(null);
  };

  const handleUpdateFeature = async (id: string, data: Partial<Feature>) => {
    await updateFeature(id, data);
    setShowEditor(false);
    setSelectedFeatureId(null);
  };

  const handleRollback = async (featureId: string, version: number) => {
    await rollbackVersion(featureId, version);
  };

  const handlePromote = async (
    featureId: string,
    sourceEnv: FeatureEnvironment,
    targetEnv: FeatureEnvironment
  ) => {
    await promoteFeature(featureId, sourceEnv, targetEnv);
  };

  const handleCompare = async (
    env1: FeatureEnvironment,
    env2: FeatureEnvironment
  ) => {
    await compareEnvironments(env1, env2);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Feature Management
        </h1>
        <div className="flex space-x-4">
          <select
            value={selectedEnvironment}
            onChange={(e) => handleEnvironmentChange(e.target.value as FeatureEnvironment)}
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
            New Feature
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
          <TabsTrigger value="features">
            <Flag className="h-5 w-5 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="experiments">
            <Beaker className="h-5 w-5 mr-2" />
            Experiments
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart className="h-5 w-5 mr-2" />
            Metrics
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

        <TabsContent value="features">
          <FeatureList
            features={features}
            onEdit={(id) => {
              setSelectedFeatureId(id);
              setShowEditor(true);
            }}
            onDelete={deleteFeature}
            onPromote={(id) => {
              setSelectedFeatureId(id);
              setActiveTab('promotions');
            }}
          />
        </TabsContent>

        <TabsContent value="experiments">
          <FeatureExperiments
            experiments={experiments}
            features={features}
            onCreate={createExperiment}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <FeatureMetricsView
            features={features}
            metrics={metrics}
            selectedEnvironment={selectedEnvironment}
          />
        </TabsContent>

        <TabsContent value="versions">
          <FeatureVersionHistory
            versions={versions}
            features={features}
            onRollback={handleRollback}
          />
        </TabsContent>

        <TabsContent value="promotions">
          <FeaturePromotionManager
            features={features}
            promotions={promotions}
            selectedEnvironment={selectedEnvironment}
            onPromote={handlePromote}
          />
        </TabsContent>

        <TabsContent value="audit">
          <FeatureAuditLog
            logs={auditLogs}
            features={features}
            onRefresh={refetch}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showEditor && (
        <FeatureEditor
          featureId={selectedFeatureId}
          environment={selectedEnvironment}
          onSave={async (data) => {
            if (selectedFeatureId) {
              await handleUpdateFeature(selectedFeatureId, data);
            } else {
              await handleCreateFeature(data);
            }
          }}
          onClose={() => {
            setShowEditor(false);
            setSelectedFeatureId(null);
          }}
          initialData={selectedFeatureId ? features.find(f => f.id === selectedFeatureId) : undefined}
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

export default FeatureManagement;