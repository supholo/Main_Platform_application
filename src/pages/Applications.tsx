// src/pages/Applications.tsx

import React from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApplication } from '../hooks/useApplication';
import { ApplicationList } from '../components/Applications/ApplicationList';
import { ApplicationOnboarding } from '../components/Applications/ApplicationOnboarding';
import CICDConfig from './CICDConfig';
import LoggingService from './LoggingService';
import ConfigurationManagement from './ConfigurationManagement';
import type { 
  Application, 
  ApplicationEnvironment, 
  IntegrationType, 
  CiCdConfig, 
  LoggingConfig, 
  MetricsConfig, 
  NotificationConfig 
} from '../types/application';

const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    addIntegration,
    updateIntegration,
    removeIntegration,
    refetch
  } = useApplication();

  const handleUpdateApplication = async (id: string, data: Partial<Application>): Promise<void> => {
    try {
      await updateApplication(id, data);
      await refetch();
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  };

  const handleAddIntegration = async (
    applicationId: string,
    type: IntegrationType,
    config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig
  ): Promise<void> => {
    try {
      await addIntegration(applicationId, type, config);
      await refetch();
    } catch (error) {
      console.error('Failed to add integration:', error);
      throw error;
    }
  };

  const handleUpdateIntegration = async (
    applicationId: string,
    integrationId: string,
    config: Partial<CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig>
  ): Promise<void> => {
    try {
      await updateIntegration(applicationId, integrationId, config);
      await refetch();
    } catch (error) {
      console.error('Failed to update integration:', error);
      throw error;
    }
  };

  const handleRemoveIntegration = async (
    applicationId: string,
    integrationId: string
  ): Promise<void> => {
    try {
      await removeIntegration(applicationId, integrationId);
      await refetch();
    } catch (error) {
      console.error('Failed to remove integration:', error);
      throw error;
    }
  };

  const handleCreateApplication = async (data: Partial<Application>): Promise<void> => {
    try {
      await createApplication(data);
      navigate('/applications');
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  };

  const handleDeleteApplication = async (id: string): Promise<void> => {
    try {
      await deleteApplication(id);
      await refetch();
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  };

  const handleViewDetails = (id: string): void => {
    navigate(`/applications/${id}/details`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>{error.message}</Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <ApplicationList
              applications={applications}
              onDelete={handleDeleteApplication}
              onViewDetails={handleViewDetails}
            />
          }
        />
        <Route
          path="/new"
          element={
            <ApplicationOnboarding
              onComplete={handleCreateApplication}
              onSaveProgress={(data: any) => {
                console.log('Saving progress:', data);
              }}
            />
          }
        />
        <Route
          path="/:id/*"
          element={
            <ApplicationRoutes
              applications={applications}
              onUpdateApplication={handleUpdateApplication}
              onAddIntegration={handleAddIntegration}
              onUpdateIntegration={handleUpdateIntegration}
              onRemoveIntegration={handleRemoveIntegration}
            />
          }
        />
      </Routes>
    </div>
  );
};

interface ApplicationRoutesProps {
  applications: Application[];
  onUpdateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  onAddIntegration: (
    applicationId: string,
    type: IntegrationType,
    config: CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig
  ) => Promise<void>;
  onUpdateIntegration: (
    applicationId: string,
    integrationId: string,
    config: Partial<CiCdConfig | LoggingConfig | MetricsConfig | NotificationConfig>
  ) => Promise<void>;
  onRemoveIntegration: (applicationId: string, integrationId: string) => Promise<void>;
}

const ApplicationRoutes: React.FC<ApplicationRoutesProps> = ({
  applications,
  onUpdateApplication,
  onAddIntegration,
  onUpdateIntegration,
  onRemoveIntegration
}) => {
  const { id } = useParams<{ id: string }>();
  const application = applications.find(app => app.id === id);

  if (!application) {
    return (
      <div className="p-6">
        <Alert>Application not found</Alert>
      </div>
    );
  }

  const handleIntegrationUpdate = async (
    integrationId: string,
    config: any
  ): Promise<void> => {
    await onUpdateIntegration(application.id, integrationId, config);
  };

  const handleIntegrationAdd = async (
    type: IntegrationType,
    config: any
  ): Promise<void> => {
    await onAddIntegration(application.id, type, config);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="p-6">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-semibold">{application.name}</h2>
                <p className="text-gray-500 mt-1">{application.description}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to={`/applications/${application.id}/cicd`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">CI/CD Pipeline</h3>
                    <p className="text-sm text-gray-500">Configure build and deployment settings</p>
                  </Link>
                  <Link
                    to={`/applications/${application.id}/logging`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">Logging</h3>
                    <p className="text-sm text-gray-500">View and configure application logs</p>
                  </Link>
                  <Link
                    to={`/applications/${application.id}/configuration`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">Configuration</h3>
                    <p className="text-sm text-gray-500">Manage app configuration and features</p>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        }
      />
      <Route
        path="/cicd/*"
        element={
          <CICDConfig
          />
        }
      />
      <Route
        path="/logging/*"
        element={
          <LoggingService
          />
        }
      />
      <Route
        path="/configuration/*"
        element={
          <ConfigurationManagement/>
        }
      />
    </Routes>
  );
};

export default ApplicationsPage;