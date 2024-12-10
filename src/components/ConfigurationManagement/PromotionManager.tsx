// src/components/ConfigurationManagement/PromotionManager.tsx

import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  Shield,
  AlertTriangle,
  Check,
  X,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Alert } from '../ui/alert';
import { Dialog } from '../ui/dialog';
import { 
  Configuration, 
  ConfigurationEnvironment,
  ConfigurationPromotion,
  PromotionStatus
} from '../../types/configuration';

interface PromotionManagerProps {
  configurations: Configuration[];
  promotions: ConfigurationPromotion[];
  selectedEnvironment: ConfigurationEnvironment;
  onPromote: (
    configId: string,
    sourceEnv: ConfigurationEnvironment,
    targetEnv: ConfigurationEnvironment
  ) => Promise<void>;
}

const ENVIRONMENT_ORDER: ConfigurationEnvironment[] = [
  'development',
  'qa',
  'staging',
  'production'
];

export const PromotionManager: React.FC<PromotionManagerProps> = ({
  configurations,
  promotions,
  selectedEnvironment,
  onPromote
}) => {
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  const eligibleConfigurations = useMemo(() => {
    return configurations.filter(config => {
      const currentEnvIndex = ENVIRONMENT_ORDER.indexOf(config.environment);
      return currentEnvIndex < ENVIRONMENT_ORDER.length - 1;
    });
  }, [configurations]);

  const getNextEnvironment = (currentEnv: ConfigurationEnvironment): ConfigurationEnvironment | null => {
    const currentIndex = ENVIRONMENT_ORDER.indexOf(currentEnv);
    if (currentIndex < ENVIRONMENT_ORDER.length - 1) {
      return ENVIRONMENT_ORDER[currentIndex + 1];
    }
    return null;
  };

  const validatePromotion = async (config: Configuration) => {
    setValidating(true);
    try {
      // Simulate validation checks
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const targetEnv = getNextEnvironment(config.environment);
      const results = {
        passed: true,
        checks: [
          {
            name: 'Configuration Syntax',
            status: 'passed' as const,
            message: 'All values are properly formatted'
          },
          {
            name: 'Required Values',
            status: 'passed' as const,
            message: 'All required values are present'
          },
          {
            name: 'Environment Compatibility',
            status: 'passed' as const,
            message: `Compatible with ${targetEnv} environment`
          },
          {
            name: 'Security Check',
            status: 'passed' as const,
            message: 'No security vulnerabilities detected'
          }
        ]
      };
      setValidationResults(results);
    } catch (error) {
      setValidationResults({
        passed: false,
        error: 'Failed to validate promotion'
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePromote = async (config: Configuration) => {
    const targetEnv = getNextEnvironment(config.environment);
    if (!targetEnv) return;

    try {
      await onPromote(config.id, config.environment, targetEnv);
      setShowPromoteDialog(false);
      setSelectedConfig(null);
      setValidationResults(null);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Promotions */}
      {promotions.some(p => p.status === 'inProgress') && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <PlayCircle className="h-6 w-6 text-blue-500 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">
                  Promotions in Progress
                </p>
                <p className="text-sm text-blue-700">
                  {promotions.filter(p => p.status === 'inProgress').length} configurations being promoted
                </p>
              </div>
              <div>
                <button
                  onClick={() => {/* Refresh */}}
                  className="inline-flex items-center px-3 py-1 border border-blue-400 rounded-md text-sm text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Status
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eligible Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Eligible for Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eligibleConfigurations.map((config) => {
              const nextEnv = getNextEnvironment(config.environment);
              return (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="text-lg font-medium">{config.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{config.environment}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="capitalize">{nextEnv}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedConfig(config);
                      setShowPromoteDialog(true);
                      validatePromotion(config);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Promote
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Promotion History */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">
                      {configurations.find(c => c.id === promotion.configurationId)?.name}
                    </h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      promotion.status === 'completed' ? 'bg-green-100 text-green-800' :
                      promotion.status === 'failed' ? 'bg-red-100 text-red-800' :
                      promotion.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="capitalize">{promotion.sourceEnvironment}</span>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <span className="capitalize">{promotion.targetEnvironment}</span>
                    <span className="ml-4">
                      {format(new Date(promotion.promotedAt), 'PPp')}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Promoted by {promotion.promotedBy}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      {showPromoteDialog && selectedConfig && (
        <Dialog isOpen={true} onClose={() => {
          setShowPromoteDialog(false);
          setSelectedConfig(null);
          setValidationResults(null);
        }}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold">Promote Configuration</h2>
                  <button
                    onClick={() => {
                      setShowPromoteDialog(false);
                      setSelectedConfig(null);
                      setValidationResults(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">{selectedConfig.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedConfig.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                      {selectedConfig.environment}
                    </div>
                    <ArrowRight className="h-6 w-6 mx-4 text-gray-400" />
                    <div className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-700">
                      {getNextEnvironment(selectedConfig.environment)}
                    </div>
                  </div>

                  {/* Validation Results */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Validation Checks</h4>
                    {validating ? (
                      <div className="text-center py-4">
                        <RefreshCw className="h-8 w-8 mx-auto text-indigo-500 animate-spin" />
                        <p className="mt-2 text-sm text-gray-500">Running validation checks...</p>
                      </div>
                    ) : validationResults ? (
                      <div className="space-y-2">
                        {validationResults.checks?.map((check: any, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              check.status === 'passed' ? 'bg-green-50' : 'bg-red-50'
                            }`}
                          >
                            <div className="flex items-center">
                              {check.status === 'passed' ? (
                                <Check className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                              )}
                              <div>
                                <p className={`text-sm font-medium ${
                                  check.status === 'passed' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {check.name}
                                </p>
                                <p className={`text-xs ${
                                  check.status === 'passed' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {check.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Warning for Production */}
                  {getNextEnvironment(selectedConfig.environment) === 'production' && (
                    <Alert type="warning">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>
                        You are about to promote this configuration to production.
                        This action should be carefully reviewed.
                      </span>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        setShowPromoteDialog(false);
                        setSelectedConfig(null);
                        setValidationResults(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePromote(selectedConfig)}
                      disabled={validating || !validationResults?.passed}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                        validating || !validationResults?.passed
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Promote Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};