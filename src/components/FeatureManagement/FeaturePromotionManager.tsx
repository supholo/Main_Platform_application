// src/components/FeatureManagement/FeaturePromotionManager.tsx

import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  ArrowRight,
  AlertTriangle,
  Check,
  X,
  PlayCircle,
  RefreshCw,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Alert } from '../ui/alert';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  Feature, 
  FeatureEnvironment,
  FeaturePromotion
} from '../../types/feature';

interface FeaturePromotionManagerProps {
  features: Feature[];
  promotions: FeaturePromotion[];
  selectedEnvironment: FeatureEnvironment;
  onPromote: (
    featureId: string,
    sourceEnv: FeatureEnvironment,
    targetEnv: FeatureEnvironment
  ) => Promise<void>;
}

const ENVIRONMENT_ORDER: FeatureEnvironment[] = [
  'development',
  'qa',
  'staging',
  'production'
];

export const FeaturePromotionManager: React.FC<FeaturePromotionManagerProps> = ({
  features,
  promotions,
  selectedEnvironment,
  onPromote
}) => {
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  const eligibleFeatures = useMemo(() => {
    return features.filter(feature => {
      const currentEnvIndex = ENVIRONMENT_ORDER.indexOf(feature.environment);
      return currentEnvIndex < ENVIRONMENT_ORDER.length - 1;
    });
  }, [features]);

  const getNextEnvironment = (currentEnv: FeatureEnvironment): FeatureEnvironment | null => {
    const currentIndex = ENVIRONMENT_ORDER.indexOf(currentEnv);
    if (currentIndex < ENVIRONMENT_ORDER.length - 1) {
      return ENVIRONMENT_ORDER[currentIndex + 1];
    }
    return null;
  };

  const validatePromotion = async (feature: Feature) => {
    setValidating(true);
    try {
      // Simulate validation checks
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const targetEnv = getNextEnvironment(feature.environment);
      const results = {
        passed: true,
        checks: [
          {
            name: 'Feature State',
            status: 'passed' as const,
            message: 'Feature configuration is valid'
          },
          {
            name: 'Dependencies',
            status: 'passed' as const,
            message: 'All dependencies are satisfied'
          },
          {
            name: 'Target Environment',
            status: 'passed' as const,
            message: `Ready for ${targetEnv} environment`
          },
          {
            name: 'Security Checks',
            status: 'passed' as const,
            message: 'All security checks passed'
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

  const handlePromote = async (feature: Feature) => {
    const targetEnv = getNextEnvironment(feature.environment);
    if (!targetEnv) return;

    try {
      await onPromote(feature.id, feature.environment, targetEnv);
      setShowPromoteDialog(false);
      setSelectedFeature(null);
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
                  {promotions.filter(p => p.status === 'inProgress').length} features being promoted
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

      {/* Eligible Features */}
      <Card>
        <CardHeader>
          <CardTitle>Eligible for Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eligibleFeatures.map((feature) => {
              const nextEnv = getNextEnvironment(feature.environment);
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="text-lg font-medium">{feature.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{feature.environment}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="capitalize">{nextEnv}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant={feature.status === 'active' ? 'success' : 'secondary'}>
                        {feature.status}
                      </Badge>
                      {feature.type && (
                        <Badge variant="outline" className="ml-2">
                          {feature.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFeature(feature);
                      setShowPromoteDialog(true);
                      validatePromotion(feature);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Promote
                  </button>
                </div>
              );
            })}

            {eligibleFeatures.length === 0 && (
              <div className="text-center py-6">
                <Flag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No features eligible for promotion
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  All features are either in production or inactive
                </p>
              </div>
            )}
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
            {promotions.map((promotion) => {
              const feature = features.find(f => f.id === promotion.featureId);
              return (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">
                        {feature?.name || 'Unknown Feature'}
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
                    {promotion.changes.length > 0 && (
                      <div className="mt-2 text-sm">
                        <details className="cursor-pointer">
                          <summary className="text-indigo-600 hover:text-indigo-700">
                            View Changes ({promotion.changes.length})
                          </summary>
                          <div className="mt-2 space-y-1 pl-4">
                            {promotion.changes.map((change, idx) => (
                              <div key={idx} className="text-gray-600">
                                <span className="font-medium">{change.key}</span>:
                                {' '}
                                <span className="text-red-600">
                                  {JSON.stringify(change.oldValue)}
                                </span>
                                {' → '}
                                <span className="text-green-600">
                                  {JSON.stringify(change.newValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Promoted by {promotion.promotedBy}
                  </div>
                </div>
              );
            })}

            {promotions.length === 0 && (
              <div className="text-center py-6">
                <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No promotion history
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  When you promote features, they'll appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      {showPromoteDialog && selectedFeature && (
        <Dialog isOpen={true} onClose={() => {
          setShowPromoteDialog(false);
          setSelectedFeature(null);
          setValidationResults(null);
        }}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold">Promote Feature</h2>
                  <button
                    onClick={() => {
                      setShowPromoteDialog(false);
                      setSelectedFeature(null);
                      setValidationResults(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Feature Info */}
                  <div>
                    <h3 className="text-lg font-medium">{selectedFeature.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedFeature.description}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline">
                        {selectedFeature.key}
                      </Badge>
                    </div>
                  </div>

                  {/* Environment Flow */}
                  <div className="flex items-center justify-center py-4">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                      {selectedFeature.environment}
                    </div>
                    <ArrowRight className="h-6 w-6 mx-4 text-gray-400" />
                    <div className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-700">
                      {getNextEnvironment(selectedFeature.environment)}
                    </div>
                  </div>

                  {/* Validation Results */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Validation Checks
                    </h4>
                    {validating ? (
                      <div className="text-center py-4">
                        <RefreshCw className="h-8 w-8 mx-auto text-indigo-500 animate-spin" />
                        <p className="mt-2 text-sm text-gray-500">
                          Running validation checks...
                        </p>
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
                  {getNextEnvironment(selectedFeature.environment) === 'production' && (
                    <Alert type="warning">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>
                        You are about to promote this feature to production.
                        This action should be carefully reviewed.
                      </span>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        setShowPromoteDialog(false);
                        setSelectedFeature(null);
                        setValidationResults(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePromote(selectedFeature)}
                      disabled={validating || !validationResults?.passed}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                        validating || !validationResults?.passed
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Promote Feature
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