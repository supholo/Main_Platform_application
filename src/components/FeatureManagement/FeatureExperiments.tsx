// src/components/FeatureManagement/FeatureExperiments.tsx

import React, { useState } from 'react';
import { 
  Beaker,
  Play, 
  Pause,
  X,
  Plus,
  ChartBar,
  Calendar,
  Clock,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Dialog } from '../ui/dialog';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  Feature,
  FeatureExperiment
} from '../../types/feature';
import { format } from 'date-fns';
import { generateId } from '../../lib/utils';

interface FeatureExperimentsProps {
  experiments: FeatureExperiment[];
  features: Feature[];
  onCreate: (data: Partial<FeatureExperiment>) => Promise<FeatureExperiment | null | void>;
}

export const FeatureExperiments: React.FC<FeatureExperimentsProps> = ({
  experiments,
  features,
  onCreate
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [selectedExperiment, setSelectedExperiment] = useState<FeatureExperiment | null>(null);
  const [showResults, setShowResults] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FeatureExperiment>>({
    name: '',
    description: '',
    startDate: new Date().toISOString(),
    variants: [
      {
        id: generateId(),
        name: 'Control',
        description: 'Control group',
        allocation: 50,
        isControl: true
      },
      {
        id: generateId(),
        name: 'Variant A',
        description: 'Test variant',
        allocation: 50,
        isControl: false
      }
    ],
    metrics: [],
    status: 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedFeature) {
      newErrors.feature = 'Please select a feature';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.variants || formData.variants.length < 2) {
      newErrors.variants = 'At least two variants are required';
    }

    if (formData.variants) {
      const totalAllocation = formData.variants.reduce((sum, v) => sum + v.allocation, 0);
      if (totalAllocation !== 100) {
        newErrors.allocation = 'Total allocation must equal 100%';
      }
    }

    if (!formData.metrics || formData.metrics.length === 0) {
      newErrors.metrics = 'At least one metric is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateExperiment = async () => {
    if (!validateForm()) return;

    try {
      await onCreate({
        ...formData,
        featureId: selectedFeature
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create experiment:', error);
      setErrors({
        submit: 'Failed to create experiment. Please try again.'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString(),
      variants: [
        {
          id: generateId(),
          name: 'Control',
          description: 'Control group',
          allocation: 50,
          isControl: true
        },
        {
          id: generateId(),
          name: 'Variant A',
          description: 'Test variant',
          allocation: 50,
          isControl: false
        }
      ],
      metrics: [],
      status: 'draft'
    });
    setSelectedFeature('');
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderMetricValue = (value: number, type: string) => {
    switch (type) {
      case 'conversion':
        return `${(value * 100).toFixed(2)}%`;
      case 'duration':
        return `${value.toFixed(2)}ms`;
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Experiments</h2>
          <p className="mt-1 text-sm text-gray-500">
            Run A/B tests and experiments on your features
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </button>
      </div>

      {/* Experiment List */}
      <div className="grid grid-cols-1 gap-6">
        {experiments.map((experiment) => {
          const feature = features.find(f => f.id === experiment.featureId);
          
          return (
            <Card key={experiment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center">
                        <Beaker className="h-5 w-5 text-indigo-500 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {experiment.name}
                        </h3>
                        <Badge
                          className={`ml-2 ${getStatusColor(experiment.status)}`}
                        >
                          <span className="flex items-center">
                            {getStatusIcon(experiment.status)}
                            <span className="ml-1 capitalize">{experiment.status}</span>
                          </span>
                        </Badge>
                      </div>
                      {feature && (
                        <div className="mt-1 text-sm text-gray-500">
                          Feature: {feature.name}
                        </div>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        {experiment.description}
                      </p>
                    </div>

                    {/* Variants and Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Variants</h4>
                        <div className="space-y-2">
                          {experiment.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  {variant.name}
                                  {variant.isControl && (
                                    <Badge variant="outline" className="ml-2">
                                      Control
                                    </Badge>
                                  )}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {variant.allocation}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Metrics</h4>
                        <div className="space-y-2">
                          {experiment.metrics.map((metric) => (
                            <div
                              key={metric.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm">{metric.name}</span>
                              <Badge variant="outline">
                                {metric.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    {experiment.results && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Results</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            {experiment.variants.map((variant) => {
                              const result = experiment.results?.find(
                                r => r.variantId === variant.id
                              );
                              return (
                                <div key={variant.id} className="space-y-2">
                                  <h5 className="text-sm font-medium">
                                    {variant.name}
                                    {variant.isControl && (
                                      <Badge variant="outline" className="ml-2">
                                        Control
                                      </Badge>
                                    )}
                                  </h5>
                                  {result && (
                                    <div className="space-y-1">
                                      {Object.entries(result.metrics).map(([key, value]) => {
                                        const metric = experiment.metrics.find(m => m.id === key);
                                        return metric ? (
                                          <div
                                            key={key}
                                            className="flex justify-between text-sm"
                                          >
                                            <span>{metric.name}:</span>
                                            <span className="font-medium">
                                              {renderMetricValue(value, metric.type)}
                                            </span>
                                          </div>
                                        ) : null;
                                      })}
                                      <div className="flex justify-between text-sm">
                                        <span>Confidence:</span>
                                        <span className="font-medium">
                                          {(result.confidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Started {format(new Date(experiment.startDate), 'PP')}
                      </span>
                      {experiment.endDate && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Ended {format(new Date(experiment.endDate), 'PP')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {experiment.status === 'draft' && (
                      <button
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                    {experiment.status === 'running' && (
                      <button
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowResults(experiment.id)}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded"
                    >
                      <ChartBar className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {experiments.length === 0 && (
          <div className="text-center py-12">
            <Beaker className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No experiments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new experiment
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Experiment
            </button>
          </div>
        )}
      </div>

      {/* Create Experiment Dialog */}
      {showCreateDialog && (
        <Dialog
          isOpen={true}
          onClose={() => {
            setShowCreateDialog(false);
            resetForm();
          }}
        >
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">New Experiment</h2>
                  <button
                    onClick={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {errors.submit && (
                    <Alert type="error">{errors.submit}</Alert>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 pb-2 border-b">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feature
                        </label>
                        <select
                          value={selectedFeature}
                          onChange={(e) => setSelectedFeature(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a feature</option>
                          {features
                            .filter(f => f.type === 'experiment')
                            .map((feature) => (
                              <option key={feature.id} value={feature.id}>
                                {feature.name}
                              </option>
                            ))
                          }
                        </select>
                        {errors.feature && (
                          <p className="mt-1 text-sm text-red-600">{errors.feature}</p>
                        )}
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experiment Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter experiment name"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Describe the experiment's purpose and goals"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startDate?.slice(0, 16)}
                          onChange={(e) => setFormData({
                            ...formData,
                            startDate: new Date(e.target.value).toISOString()
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.endDate?.slice(0, 16) || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 pb-2 border-b">
                      Variants
                    </h3>
                    <div className="space-y-4">
                      {formData.variants?.map((variant, index) => (
                        <div
                          key={variant.id}
                          className="p-4 border border-gray-200 rounded-lg space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Variant Name
                              </label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => {
                                  const newVariants = [...(formData.variants || [])];
                                  newVariants[index] = { ...variant, name: e.target.value };
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Allocation %
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={variant.allocation}
                                onChange={(e) => {
                                  const newVariants = [...(formData.variants || [])];
                                  newVariants[index] = {
                                    ...variant,
                                    allocation: Number(e.target.value)
                                  };
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={variant.isControl}
                                onChange={(e) => {
                                  const newVariants = [...(formData.variants || [])];
                                  // Uncheck other control variants
                                  newVariants.forEach(v => v.isControl = false);
                                  newVariants[index] = {
                                    ...variant,
                                    isControl: e.target.checked
                                  };
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-600">Control variant</span>
                            </label>
                            
                            {!variant.isControl && formData.variants!.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newVariants = formData.variants!.filter((_, i) => i !== index);
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...(formData.variants || [])];
                          newVariants.push({
                            id: generateId(),
                            name: `Variant ${newVariants.length}`,
                            description: '',
                            allocation: 0,
                            isControl: false
                          });
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                      </button>
                    </div>
                    {errors.variants && (
                      <p className="mt-1 text-sm text-red-600">{errors.variants}</p>
                    )}
                    {errors.allocation && (
                      <p className="mt-1 text-sm text-red-600">{errors.allocation}</p>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 pb-2 border-b">
                      Metrics
                    </h3>
                    <div className="space-y-4">
                      {formData.metrics?.map((metric, index) => (
                        <div
                          key={metric.id}
                          className="p-4 border border-gray-200 rounded-lg grid grid-cols-3 gap-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Metric Name
                            </label>
                            <input
                              type="text"
                              value={metric.name}
                              onChange={(e) => {
                                const newMetrics = [...(formData.metrics || [])];
                                newMetrics[index] = { ...metric, name: e.target.value };
                                setFormData({ ...formData, metrics: newMetrics });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={metric.type}
                              onChange={(e) => {
                                const newMetrics = [...(formData.metrics || [])];
                                newMetrics[index] = {
                                  ...metric,
                                  type: e.target.value as 'conversion' | 'numeric' | 'duration'
                                };
                                setFormData({ ...formData, metrics: newMetrics });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="conversion">Conversion</option>
                              <option value="numeric">Numeric</option>
                              <option value="duration">Duration</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Goal
                            </label>
                            <input
                              type="number"
                              value={metric.goal}
                              onChange={(e) => {
                                const newMetrics = [...(formData.metrics || [])];
                                newMetrics[index] = {
                                  ...metric,
                                  goal: Number(e.target.value)
                                };
                                setFormData({ ...formData, metrics: newMetrics });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div className="col-span-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newMetrics = formData.metrics!.filter((_, i) => i !== index);
                                setFormData({ ...formData, metrics: newMetrics });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newMetrics = [...(formData.metrics || [])];
                          newMetrics.push({
                            id: generateId(),
                            name: '',
                            type: 'conversion',
                            goal: 0
                          });
                          setFormData({ ...formData, metrics: newMetrics });
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Metric
                      </button>
                    </div>
                    {errors.metrics && (
                      <p className="mt-1 text-sm text-red-600">{errors.metrics}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateDialog(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateExperiment}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Experiment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Results Dialog */}
      {showResults && (
        <Dialog
          isOpen={true}
          onClose={() => setShowResults(null)}
        >
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
                {/* Results content here */}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};