import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Server,
  CloudCog,
  Shield,
  Bell,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { TenantDetailsStep } from "../components/onboarding/steps/TenantDetailsStep";
import { ApplicationsStep } from "../components/onboarding/steps/ApplicationsStep";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert } from "../components/ui/alert";
import { useApi } from "../hooks/useApi";
import { generateId } from "../lib/utils";
// At the top of OnboardingWizard.tsx, add import
import {
  ApplicationConfig,
  defaultApplication,
} from "../components/onboarding/steps/ApplicationsStep";
import { CloudConfigStep } from "../components/onboarding/steps/CloudConfigStep";
import { IdentityStep } from "../components/onboarding/steps/IdentityStep";
import { NotificationsStep } from "../components/onboarding/steps/NotificationStep";
import { RolesStep } from "../components/onboarding/steps/RolesStep";

const availablePermissions = [
  {
    id: 'view_dashboard',
    name: 'View Dashboard',
    description: 'Can view main dashboard',
    category: 'Dashboard'
  },
  {
    id: 'manage_applications',
    name: 'Manage Applications',
    description: 'Can create and manage applications',
    category: 'Applications'
  },
  {
    id: 'view_applications',
    name: 'View Applications',
    description: 'Can view applications',
    category: 'Applications'
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Can create and manage users',
    category: 'User Management'
  },
  {
    id: 'view_users',
    name: 'View Users',
    description: 'Can view users',
    category: 'User Management'
  },
  {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Can create and manage roles',
    category: 'Role Management'
  },
  {
    id: 'view_roles',
    name: 'View Roles',
    description: 'Can view roles',
    category: 'Role Management'
  },
  {
    id: 'manage_settings',
    name: 'Manage Settings',
    description: 'Can modify system settings',
    category: 'Settings'
  },
  {
    id: 'view_logs',
    name: 'View Logs',
    description: 'Can view system logs',
    category: 'Monitoring'
  },
  {
    id: 'manage_notifications',
    name: 'Manage Notifications',
    description: 'Can configure notifications',
    category: 'Notifications'
  }
];

interface OnboardingState {
  tenant: {
    name: string;
    domain: string;
    industry: string;
    size: string;
    contactEmail: string;
  };
  applications: ApplicationConfig[];
  cloudConfig: {
    provider: string;
    region: string;
    credentials: {
      accessKeyId?: string;
      secretAccessKey?: string;
      tenantId?: string;
      clientId?: string;
      clientSecret?: string;
    };
  };
  identity: {
    provider: "internal" | "oauth2" | "saml";
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
  };
  notifications: {
    channels: Array<{
      id: string;
      type: "email" | "slack" | "sms" | "webhook";
      enabled: boolean;
      config: {
        recipients?: string[];
        webhookUrl?: string;
        channel?: string;
        apiKey?: string;
      };
      events: string[];
    }>;
  };
  roles: Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
  }>;
}

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<OnboardingState>({
    tenant: {
      name: "",
      domain: "",
      industry: "",
      size: "",
      contactEmail: "",
    },
    applications: [],
    cloudConfig: {
      provider: "",
      region: "",
      credentials: {},
    },
    identity: {
      provider: "internal",
      config: {},
      settings: {
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: true,
          requireUppercase: true,
        },
      },
    },
    notifications: {
      channels: [],
    },
    roles: [],
  });

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {}
  );

  const steps = [
    { number: 1, title: "Organization Details", icon: Building2 },
    { number: 2, title: "Applications", icon: Server },
    { number: 3, title: "Cloud Configuration", icon: CloudCog },
    { number: 4, title: "Identity Setup", icon: Shield },
    { number: 5, title: "Notifications", icon: Bell },
    { number: 6, title: "Role Management", icon: Users },
  ];

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, Record<string, string>> = {};

      switch (step) {
        case 1:
          if (!state.tenant.name) {
            newErrors.tenant = {
              ...newErrors.tenant,
              name: "Organization name is required",
            };
          }
          if (!state.tenant.domain) {
            newErrors.tenant = {
              ...newErrors.tenant,
              domain: "Domain is required",
            };
          }
          if (!state.tenant.contactEmail) {
            newErrors.tenant = {
              ...newErrors.tenant,
              contactEmail: "Contact email is required",
            };
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
              state.tenant.contactEmail
            )
          ) {
            newErrors.tenant = {
              ...newErrors.tenant,
              contactEmail: "Invalid email address",
            };
          }
          break;

        case 2:
          if (state.applications.length > 0) {
            state.applications.forEach((app, index) => {
              if (!app.name) {
                newErrors.applications = {
                  ...newErrors.applications,
                  [`${index}.name`]: "Application name is required",
                };
              }
              if (!app.type) {
                newErrors.applications = {
                  ...newErrors.applications,
                  [`${index}.type`]: "Application type is required",
                };
              }
              if (!app.environment) {
                newErrors.applications = {
                  ...newErrors.applications,
                  [`${index}.environment`]: "Environment is required",
                };
              }
            });
          }
          break;

        case 3:
          if (!state.cloudConfig.provider) {
            newErrors.cloudConfig = {
              ...newErrors.cloudConfig,
              provider: "Cloud provider is required",
            };
          }
          if (!state.cloudConfig.region) {
            newErrors.cloudConfig = {
              ...newErrors.cloudConfig,
              region: "Region is required",
            };
          }
          break;

        case 3:
          if (!state.cloudConfig.provider) {
            newErrors.cloudConfig = {
              ...newErrors.cloudConfig,
              provider: "Cloud provider is required",
            };
          }
          if (!state.cloudConfig.region) {
            newErrors.cloudConfig = {
              ...newErrors.cloudConfig,
              region: "Region is required",
            };
          }
          break;

        case 4:
          if (!state.identity.provider) {
            newErrors.identity = {
              ...newErrors.identity,
              provider: "Identity provider is required",
            };
          }
          break;

        case 5:
          if (state.notifications.channels.length > 0) {
            state.notifications.channels.forEach((channel, index) => {
              if (!channel.type) {
                newErrors.notifications = {
                  ...newErrors.notifications,
                  [`channels.${index}.type`]: "Channel type is required",
                };
              }
              if (channel.enabled && channel.events.length === 0) {
                newErrors.notifications = {
                  ...newErrors.notifications,
                  [`channels.${index}.events`]:
                    "At least one event must be selected",
                };
              }
            });
          }
          break;

        case 6:
          if (state.roles?.length === 0) {
            newErrors.roles = {
              base: "At least one role must be created",
            };
          }
          if (state.roles?.length > 0) {
            state.roles.forEach((role, index) => {
              if (!role.name) {
                newErrors.roles = {
                  ...newErrors.roles,
                  [`${index}.name`]: "Role name is required",
                };
              }
              if (role.permissions.length === 0) {
                newErrors.roles = {
                  ...newErrors.roles,
                  [`${index}.permissions`]:
                    "At least one permission must be selected",
                };
              }
            });
          }
          break;

        // Add validation for other steps...
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [state]
  );

  const handleNext = useCallback(async () => {
    if (validateStep(currentStep)) {
      if (currentStep === steps.length) {
        try {
          setLoading(true);
          setError(null);
  
          // Submit tenant details
          const { data: tenantResponse } = await api.createTenant(state.tenant);
  
          if (!tenantResponse.id) {
            throw new Error('Failed to create tenant');
          }
  
          // Submit all other configurations
          await Promise.all([
            ...(state.applications.length > 0
              ? state.applications.map(app =>
                  api.createApplication({ ...app, tenantId: tenantResponse.id })
                )
              : []),
            api.saveCloudConfiguration({
              tenantId: tenantResponse.id,
              ...state.cloudConfig,
            }),
            api.configureIdentityProvider({
              tenantId: tenantResponse.id,
              ...state.identity,
            }),
            api.configureNotifications({
              tenantId: tenantResponse.id,
              channels: state.notifications.channels,
            }),
            ...(state.roles.length > 0
              ? state.roles.map(role =>
                  api.createRole({
                    ...role,
                    tenantId: tenantResponse.id,
                  })
                )
              : [])
          ]);
  
          // Store tenant ID
          localStorage.setItem('currentTenantId', tenantResponse.id);
  
          // Navigate to dashboard
          navigate('/', {
            replace: true,
            state: { tenantId: tenantResponse.id }
          });
  
        } catch (err) {
          console.error('Onboarding error:', err);
          setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, state, steps.length, validateStep, api, navigate]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleAddApplication = useCallback(() => {
    setState((prev) => ({
      ...prev,
      applications: [
        ...prev.applications,
        {
          ...defaultApplication, // Use the defaultApplication from ApplicationsStep
          id: generateId("app-"),
        },
      ],
    }));
  }, []);

  const handleUpdateApplication = useCallback(
    (index: number, data: ApplicationConfig) => {
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((app, i) =>
          i === index ? data : app
        ),
      }));
    },
    []
  );

  const handleRemoveApplication = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index),
    }));
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TenantDetailsStep
            data={state.tenant}
            onChange={(data) => setState((prev) => ({ ...prev, tenant: data }))}
            errors={errors.tenant || {}}
          />
        );

      case 2:
        return (
          <ApplicationsStep
            applications={state.applications}
            onAdd={handleAddApplication}
            onUpdate={handleUpdateApplication}
            onRemove={handleRemoveApplication}
            errors={errors.applications || {}}
          />
        );

      case 3:
        return (
          <CloudConfigStep
            data={state.cloudConfig}
            onChange={(data) =>
              setState((prev) => ({ ...prev, cloudConfig: data }))
            }
            errors={errors.cloudConfig || {}}
          />
        );

      case 4:
        return (
          <IdentityStep
            data={state.identity}
            onChange={(data) =>
              setState((prev) => ({ ...prev, identity: data }))
            }
            errors={errors.identity || {}}
          />
        );

      case 5:
        return (
          <NotificationsStep
            channels={state.notifications.channels}
            onAddChannel={() =>
              setState((prev) => ({
                ...prev,
                notifications: {
                  channels: [
                    ...prev.notifications.channels,
                    {
                      id: generateId("channel-"),
                      type: "email",
                      enabled: true,
                      config: {},
                      events: [],
                    },
                  ],
                },
              }))
            }
            onUpdateChannel={(index, channel) =>
              setState((prev) => ({
                ...prev,
                notifications: {
                  channels: prev.notifications.channels.map((c, i) =>
                    i === index ? channel : c
                  ),
                },
              }))
            }
            onRemoveChannel={(index) =>
              setState((prev) => ({
                ...prev,
                notifications: {
                  channels: prev.notifications.channels.filter(
                    (_, i) => i !== index
                  ),
                },
              }))
            }
            errors={errors.notifications || {}}
          />
        );

        case 6:
          return (
            <RolesStep
              roles={state.roles || []}
              availablePermissions={availablePermissions} // Pass the permissions array here
              onAddRole={() =>
                setState((prev) => ({
                  ...prev,
                  roles: [
                    ...(prev.roles || []),
                    {
                      id: generateId("role-"),
                      name: "",
                      description: "",
                      permissions: [],
                    },
                  ],
                }))
              }
              onUpdateRole={(index, role) =>
                setState((prev) => ({
                  ...prev,
                  roles: (prev.roles || []).map((r, i) =>
                    i === index ? role : r
                  ),
                }))
              }
              onRemoveRole={(index) =>
                setState((prev) => ({
                  ...prev,
                  roles: (prev.roles || []).filter((_, i) => i !== index),
                }))
              }
              errors={errors.roles || {}}
            />
          );

      // Add other steps...

      default:
        return null;
    }
  };

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!state.tenant.name && !!state.tenant.domain && !!state.tenant.contactEmail;
      case 2:
        return state.applications.every(app => app.name && app.type && app.environment);
      case 3:
        return !!state.cloudConfig.provider && !!state.cloudConfig.region;
      case 4:
        return !!state.identity.provider;
      case 5:
        return state.notifications.channels.every(channel => 
          !channel.enabled || (channel.events && channel.events.length > 0)
        );
      case 6:
        return state.roles.length > 0 && state.roles.every(role => 
          role.name.length > 0
        );
      default:
        return false;
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Your New Workspace
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <nav className="mb-8">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <li
                  key={step.number}
                  className={`flex items-center ${
                    index < steps.length - 1 ? "w-full" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full
                      ${
                        currentStep >= step.number
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 ml-3 border-t-2
                        ${
                          currentStep > step.number
                            ? "border-indigo-600"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {renderStepContent()}

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
              >
                <ChevronLeft className="-ml-1 mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !isStepComplete(currentStep)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  "Processing..."
                ) : currentStep === steps.length ? (
                  <>
                    Complete Setup
                    <Check className="ml-2 -mr-1 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="ml-2 -mr-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
