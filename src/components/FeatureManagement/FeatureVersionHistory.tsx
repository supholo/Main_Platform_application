// src/components/FeatureManagement/FeatureVersionHistory.tsx

import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  ArrowDown, 
  ArrowUp, 
  Check,
  AlertTriangle,
  Clock,
  User,
  Diff,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Feature, 
  FeatureVersion 
} from '../../types/feature';

interface FeatureVersionHistoryProps {
  versions: Record<string, FeatureVersion[]>;
  features: Feature[];
  onRollback: (featureId: string, version: number) => Promise<void>;
}

export const FeatureVersionHistory: React.FC<FeatureVersionHistoryProps> = ({
  versions,
  features,
  onRollback
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<string | null>(null);

  const handleRollback = async (featureId: string, version: number) => {
    try {
      await onRollback(featureId, version);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  const renderDiff = (changes: FeatureVersion['changes']) => {
    return (
      <div className="space-y-2 mt-2 text-sm font-mono">
        {changes.map((change, index) => (
          <div key={index} className="space-y-1">
            <div className="font-medium text-gray-700">{change.key}</div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <div className="text-red-600 bg-red-50 p-2 rounded">
                  - {JSON.stringify(change.previousValue, null, 2)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-green-600 bg-green-50 p-2 rounded">
                  + {JSON.stringify(change.newValue, null, 2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Feature Selector */}
      <div className="flex space-x-4">
        <select
          value={selectedFeature || ''}
          onChange={(e) => setSelectedFeature(e.target.value || null)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select Feature</option>
          {features.map((feature) => (
            <option key={feature.id} value={feature.id}>
              {feature.name} ({feature.key})
            </option>
          ))}
        </select>
      </div>

      {/* Version Timeline */}
      {selectedFeature && versions[selectedFeature] && (
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200" />
          <div className="space-y-8">
            {versions[selectedFeature].map((version, index) => (
              <div key={version.id} className="relative pl-12">
                <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500" />
                <Card className={`${
                  expandedVersion === version.id ? 'ring-2 ring-indigo-500' : ''
                }`}>
                  <CardHeader className="cursor-pointer" onClick={() => {
                    setExpandedVersion(expandedVersion === version.id ? null : version.id);
                    setShowDiff(null);
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <span className="text-lg">Version {version.version}</span>
                          {version.status === 'active' && (
                            <Badge variant="success" className="ml-2">
                              Current
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="mt-1 text-sm text-gray-500">
                          {version.commitMessage}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(version.createdAt), 'PPp')}
                        </div>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {version.createdBy}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedVersion === version.id && (
                    <CardContent>
                      <div className="space-y-4">
                        {/* Version Actions */}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowDiff(showDiff === version.id ? null : version.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                          >
                            <Diff className="h-4 w-4 mr-1" />
                            {showDiff === version.id ? 'Hide Changes' : 'Show Changes'}
                          </button>
                          {index !== 0 && (
                            <button
                              onClick={() => handleRollback(selectedFeature, version.version)}
                              className="inline-flex items-center px-3 py-1 border border-indigo-600 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Rollback to this version
                            </button>
                          )}
                        </div>

                        {/* Changes Diff */}
                        {showDiff === version.id && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Changes</h4>
                            {renderDiff(version.changes)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedFeature && (!versions[selectedFeature] || versions[selectedFeature].length === 0) && (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No version history</h3>
          <p className="mt-1 text-sm text-gray-500">
            This feature hasn't been modified yet.
          </p>
        </div>
      )}

      {/* Feature Selection Prompt */}
      {!selectedFeature && (
        <div className="text-center py-12">
          <Flag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select a feature</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a feature to view its version history
          </p>
        </div>
      )}
    </div>
  );
};