// src/components/FeatureManagement/EnvironmentComparison.tsx

import React, { useState } from 'react';
import { 
  Diff,
  Plus,
  Minus,
  RefreshCw,
  ArrowRight,
  Download,
  X,
  Check,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Dialog } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  FeatureEnvironment, 
  FeatureComparison 
} from '../../types/feature';

interface EnvironmentComparisonProps {
  currentEnvironment: FeatureEnvironment;
  comparison: FeatureComparison | null;
  onCompare: (env1: FeatureEnvironment, env2: FeatureEnvironment) => Promise<void>;
  onClose: () => void;
}

export const EnvironmentComparison: React.FC<EnvironmentComparisonProps> = ({
  currentEnvironment,
  comparison,
  onCompare,
  onClose
}) => {
  const [sourceEnv, setSourceEnv] = useState<FeatureEnvironment>(currentEnvironment);
  const [targetEnv, setTargetEnv] = useState<FeatureEnvironment>('production');
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      await onCompare(sourceEnv, targetEnv);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!comparison) return;

    const exportData = {
      timestamp: comparison.timestamp,
      environments: {
        source: comparison.environment1,
        target: comparison.environment2
      },
      differences: comparison.differences.map(diff => ({
        key: diff.key,
        status: diff.status,
        value1: diff.value1,
        value2: diff.value2
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-comparison-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Environment Comparison</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExport}
                  disabled={!comparison}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Environment Selector */}
              <div className="flex items-center justify-center space-x-4">
                <select
                  value={sourceEnv}
                  onChange={(e) => setSourceEnv(e.target.value as FeatureEnvironment)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="development">Development</option>
                  <option value="qa">QA</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <select
                  value={targetEnv}
                  onChange={(e) => setTargetEnv(e.target.value as FeatureEnvironment)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="development">Development</option>
                  <option value="qa">QA</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Diff className="h-4 w-4 mr-2" />
                  )}
                  Compare
                </button>
              </div>

              {/* Comparison Results */}
              {comparison && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-lg font-medium text-green-600">
                            {comparison.differences.filter(d => d.status === 'added').length}
                          </div>
                          <div className="text-sm text-gray-500">Added</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-lg font-medium text-red-600">
                            {comparison.differences.filter(d => d.status === 'removed').length}
                          </div>
                          <div className="text-sm text-gray-500">Removed</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-lg font-medium text-yellow-600">
                            {comparison.differences.filter(d => d.status === 'modified').length}
                          </div>
                          <div className="text-sm text-gray-500">Modified</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Differences */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Differences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {comparison.differences.map((diff, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg ${
                              diff.status === 'added' ? 'bg-green-50' :
                              diff.status === 'removed' ? 'bg-red-50' :
                              'bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {diff.status === 'added' ? (
                                  <Plus className="h-5 w-5 text-green-500" />
                                ) : diff.status === 'removed' ? (
                                  <Minus className="h-5 w-5 text-red-500" />
                                ) : (
                                  <Diff className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium">
                                  {diff.key}
                                </div>
                                {diff.status === 'modified' && diff.value1 && diff.value2 && (
                                  <div className="mt-2 space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Configuration Changes:</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="text-xs font-medium text-gray-500 mb-1">
                                          {comparison.environment1}
                                        </h5>
                                        <div className="text-sm bg-white p-3 rounded border border-red-200">
                                          <div className="space-y-2">
                                            <div>
                                              <span className="font-medium">Enabled: </span>
                                              {diff.value1.enabled ? (
                                                <Badge variant="success">Yes</Badge>
                                              ) : (
                                                <Badge variant="secondary">No</Badge>
                                              )}
                                            </div>
                                            {diff.value1.rolloutPercentage !== undefined && (
                                              <div>
                                                <span className="font-medium">Rollout: </span>
                                                {diff.value1.rolloutPercentage}%
                                              </div>
                                            )}
                                            {diff.value1.rules && diff.value1.rules.length > 0 && (
                                              <div>
                                                <span className="font-medium">Rules: </span>
                                                {diff.value1.rules.length} configured
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-medium text-gray-500 mb-1">
                                          {comparison.environment2}
                                        </h5>
                                        <div className="text-sm bg-white p-3 rounded border border-green-200">
                                          <div className="space-y-2">
                                            <div>
                                              <span className="font-medium">Enabled: </span>
                                              {diff.value2.enabled ? (
                                                <Badge variant="success">Yes</Badge>
                                              ) : (
                                                <Badge variant="secondary">No</Badge>
                                              )}
                                            </div>
                                            {diff.value2.rolloutPercentage !== undefined && (
                                              <div>
                                                <span className="font-medium">Rollout: </span>
                                                {diff.value2.rolloutPercentage}%
                                              </div>
                                            )}
                                            {diff.value2.rules && diff.value2.rules.length > 0 && (
                                              <div>
                                                <span className="font-medium">Rules: </span>
                                                {diff.value2.rules.length} configured
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {diff.status === 'added' && diff.value2 && (
                                  <div className="mt-2">
                                    <div className="text-sm bg-white p-3 rounded border border-green-200">
                                      <div className="space-y-2">
                                        <div>
                                          <span className="font-medium">Added in {comparison.environment2}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium">Enabled: </span>
                                          {diff.value2.enabled ? (
                                            <Badge variant="success">Yes</Badge>
                                          ) : (
                                            <Badge variant="secondary">No</Badge>
                                          )}
                                        </div>
                                        {diff.value2.rolloutPercentage !== undefined && (
                                          <div>
                                            <span className="font-medium">Rollout: </span>
                                            {diff.value2.rolloutPercentage}%
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {diff.status === 'removed' && diff.value1 && (
                                  <div className="mt-2">
                                    <div className="text-sm bg-white p-3 rounded border border-red-200">
                                      <div className="space-y-2">
                                        <div>
                                          <span className="font-medium">Removed from {comparison.environment2}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium">Was enabled: </span>
                                          {diff.value1.enabled ? (
                                            <Badge variant="success">Yes</Badge>
                                          ) : (
                                            <Badge variant="secondary">No</Badge>
                                          )}
                                        </div>
                                        {diff.value1.rolloutPercentage !== undefined && (
                                          <div>
                                            <span className="font-medium">Was at rollout: </span>
                                            {diff.value1.rolloutPercentage}%
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {comparison.differences.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            <Check className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-2">No differences found between environments</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Empty State */}
              {!comparison && !loading && (
                <div className="text-center py-12">
                  <Flag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comparison data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select environments and click compare to see differences
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};