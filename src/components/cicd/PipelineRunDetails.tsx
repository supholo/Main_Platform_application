import React, { useState, useEffect, useRef } from 'react';
import { 
  Play,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { formatDistance } from 'date-fns';

interface PipelineStep {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration?: number;
  logs?: string[];
}

interface PipelineArtifact {
  name: string;
  size: number;
  path?: string;
}

interface PipelineRun {
  id: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  startTime: string;
  duration?: number;
  steps: PipelineStep[];
  artifacts?: PipelineArtifact[];
}

interface PipelineRunDetailsProps {
  pipelineId: string;
  runId: string;
  onClose: () => void;
  onRetry: () => Promise<void>;
}

const PipelineRunDetails: React.FC<PipelineRunDetailsProps> = ({
  pipelineId,
  runId,
  onClose,
  onRetry
}) => {
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logView, setLogView] = useState<'pretty' | 'raw'>('pretty');
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRunDetails();
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [pipelineId, runId]);

  useEffect(() => {
    if (autoRefresh && run?.status === 'running') {
      refreshInterval.current = setInterval(loadRunDetails, 5000);
    }
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, run?.status]);

  const loadRunDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pipelines/${pipelineId}/runs/${runId}`);
      const data = await response.json();
      setRun(data);
      setError(null);
    } catch (err) {
      setError('Failed to load run details');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <X className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Play className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: PipelineStep['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 dark:text-red-200">{error}</span>
        </div>
      </div>
    );
  }

  if (!run) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Rest of the JSX remains the same, but now TypeScript knows about all the types */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pipeline Run #{runId}
            </h2>
            <div className="mt-1 flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(run.status)}`}>
                {getStatusIcon(run.status)}
                <span className="ml-1">{run.status}</span>
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Started {formatDistance(new Date(run.startTime), new Date(), { addSuffix: true })}
              </span>
              {run.duration && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Duration: {run.duration}s
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-md ${
                autoRefresh 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {run.steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative flex items-start ${
                index !== run.steps.length - 1 ? 'pb-4' : ''
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full">
                {getStatusIcon(step.status)}
              </div>
              <div className="ml-4 flex-1">
                <button
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {step.duration ? `${step.duration}s` : 'In progress...'}
                    </p>
                  </div>
                  {step.logs && step.logs.length > 0 && (
                    <ChevronRight className={`h-5 w-5 transform transition-transform ${
                      selectedStep === step.id ? 'rotate-90' : ''
                    }`} />
                  )}
                </button>

                {selectedStep === step.id && step.logs && step.logs.length > 0 && (
                  <div className="mt-4">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setLogView('pretty')}
                            className={`px-2 py-1 rounded text-xs ${
                              logView === 'pretty' 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Pretty
                          </button>
                          <button
                            onClick={() => setLogView('raw')}
                            className={`px-2 py-1 rounded text-xs ${
                              logView === 'raw' 
                                ? 'bg-gray-700 text-white' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Raw
                          </button>
                        </div>
                        <button
                          onClick={() => {/* Download logs */}}
                          className="text-gray-400 hover:text-white"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                        {step.logs.join('\n')}
                      </pre>
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artifacts */}
      {run.artifacts && run.artifacts.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Artifacts
          </h3>
          <div className="space-y-2">
            {run.artifacts.map((artifact) => (
              <div
                key={artifact.name}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {artifact.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({Math.round(artifact.size / 1024)}KB)
                  </span>
                </div>
                <button
                  onClick={() => {/* Download artifact */}}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineRunDetails;