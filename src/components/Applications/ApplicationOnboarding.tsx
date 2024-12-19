// src/components/Applications/ApplicationOnboarding.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Settings,
  BarChart,
  Bell,
  Server,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  Application,
  ApplicationEnvironment,
  ApplicationIntegration,
  CiCdConfig,
  LoggingConfig,
  MetricsConfig,
  NotificationConfig
} from '../../types/application';
import {
  BasicInformation,
  CiCdSetup,
  LoggingSetup,
  MetricsSetup,
  NotificationSetup,
  StepData
} from './OnboardingSteps';

interface OnboardingProps {
  onComplete: (application: Partial<Application>) => Promise<void>;
  onSaveProgress: (data: { step: keyof StepData; data: any }) => void;
}

const steps = [
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Set up your application details'
  },
  {
    id: 'cicd',
    title: 'CI/CD Integration',
    description: 'Configure your continuous integration and deployment'
  },
  {
    id: 'logging',
    title: 'Logging Setup',
    description: 'Configure application logging'
  },
  {
    id: 'metrics',
    title: 'Metrics & Monitoring',
    description: 'Set up application monitoring'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure alerts and notifications'
  }
] as const;

export const ApplicationOnboarding: React.FC<OnboardingProps> = ({
  onComplete,
  onSaveProgress
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StepData>({
    basics: {
      name: '',
      description: '',
      repository: '',
      environments: ['development']
    },
    cicd: {
      enabled: false,
      provider: 'github',
      repository: '',
      branch: 'main',
      triggers: {
        onPush: true,
        onPullRequest: true,
        onMerge: true,
        schedules: []
      },
      buildConfiguration: {} // Added missing property
    },
    logging: {
      enabled: false,
      provider: 'elk',
      logLevel: 'INFO',
      structuredLogging: true,
      retentionDays: 30,
      filters: [] // Added missing property
    },
    metrics: {
      enabled: false,
      provider: 'prometheus',
      scrapeInterval: 30,
      retentionDays: 90,
      dashboards: []
    },
    notifications: {
      enabled: false,
      channels: []
    }
  });

  const handleSubmit = async () => {
    try {
      // Prepare application data
      const applicationData: Partial<Application> = {
        name: formData.basics.name,
        description: formData.basics.description,
        repository: formData.basics.repository,
        environments: formData.basics.environments,
        integrations: [],
        status: 'inactive',
        version: '1.0.0',
        tags: []
      };

      // Add enabled integrations
      const integrations: ApplicationIntegration[] = [];

      if (formData.cicd.enabled) {
        integrations.push({
          type: 'cicd',
          config: formData.cicd as CiCdConfig,
          status: 'active',
          id: '',
          applicationId: '',
          createdAt: '',
          updatedAt: ''
        });
      }

      if (formData.logging.enabled) {
        integrations.push({
          type: 'logging',
          config: formData.logging as LoggingConfig,
          status: 'active',
          id: '',
          applicationId: '',
          createdAt: '',
          updatedAt: ''
        });
      }

      if (formData.metrics.enabled) {
        integrations.push({
          type: 'metrics',
          config: formData.metrics as MetricsConfig,
          status: 'active',
          id: '',
          applicationId: '',
          createdAt: '',
          updatedAt: ''
        });
      }

      if (formData.notifications.enabled) {
        integrations.push({
          type: 'notifications',
          config: formData.notifications as NotificationConfig,
          status: 'active',
          id: '',
          applicationId: '',
          createdAt: '',
          updatedAt: ''
        });
      }

      applicationData.integrations = integrations;

      await onComplete(applicationData);
      navigate('/applications');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const updateFormData = (step: keyof StepData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
    onSaveProgress({ step, data: { ...formData[step], ...data } });
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`w-3 h-3 rounded-full ${
              index === currentStep
                ? 'bg-indigo-600'
                : index < currentStep
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          {index < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInformation
            data={formData.basics}
            onChange={(data) => updateFormData('basics', data)}
          />
        );
      case 1:
        return (
          <CiCdSetup
            data={formData.cicd}
            onChange={(data) => updateFormData('cicd', data)}
          />
        );
      case 2:
        return (
          <LoggingSetup
            data={formData.logging}
            onChange={(data) => updateFormData('logging', data)}
          />
        );
      case 3:
        return (
          <MetricsSetup
            data={formData.metrics}
            onChange={(data) => updateFormData('metrics', data)}
          />
        );
      case 4:
        return (
          <NotificationSetup
            data={formData.notifications}
            onChange={(data) => updateFormData('notifications', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-xl">{steps[currentStep].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
            currentStep === 0
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Complete Setup
          </button>
        )}
      </div>
    </div>
  );
};