// src/components/ConfigurationManagement/EnvironmentComparison.tsx

import React, { useState, useEffect } from 'react';
import { 
  Diff,
  Plus,
  Minus,
  RefreshCw,
  ArrowRight,
  FileText,
  Download,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Dialog } from '../ui/dialog';
import { 
  ConfigurationEnvironment, 
  ConfigurationComparison 
} from '../../types/configuration';

interface EnvironmentComparisonProps {
  currentEnvironment: ConfigurationEnvironment;
  comparison: ConfigurationComparison | null;
  onCompare: (env1: ConfigurationEnvironment, env2: ConfigurationEnvironment) => Promise<void>;
  onClose: () => void;
}

export const EnvironmentComparison: React.FC<EnvironmentComparisonProps> = ({
  currentEnvironment,
  comparison,
  onCompare,
  onClose
}) => {
  const [sourceEnv, setSourceEnv] = useState<ConfigurationEnvironment>(currentEnvironment);
  const [targetEnv, setTargetEnv] = useState<ConfigurationEnvironment>('production');
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      await onCompare(sourceEnv, targetEnv);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!comparison) return;

    const content = {
      timestamp: comparison.timestamp,
      environments: {
        source: comparison.environment1,
        target: comparison.environment2
      },
      differences: comparison.differences
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `env-comparison-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
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
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
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
                  onChange={(e) => setSourceEnv(e.target.value as ConfigurationEnvironment)}
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
                  onChange={(e) => setTargetEnv(e.target.value as ConfigurationEnvironment)}
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
                      <CardTitle>Configuration Differences</CardTitle>
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
                                {diff.status === 'modified' && (
                                  <div className="mt-2 space-y-1">
                                    <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                      - {JSON.stringify(diff.value1?.value)}
                                    </div>
                                    <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                                      + {JSON.stringify(diff.value2?.value)}
                                    </div>
                                  </div>
                                )}
                                {diff.status === 'added' && (
                                  <div className="mt-1 text-sm text-green-700">
                                    Added: {JSON.stringify(diff.value2?.value)}
                                  </div>
                                )}
                                {diff.status === 'removed' && (
                                  <div className="mt-1 text-sm text-red-700">
                                    Removed: {JSON.stringify(diff.value1?.value)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Empty State */}
              {!comparison && !loading && (
                <div className="text-center py-12">
                  <Diff className="mx-auto h-12 w-12 text-gray-400" />
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