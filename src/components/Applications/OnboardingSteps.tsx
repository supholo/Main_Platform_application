// src/components/Applications/OnboardingSteps.tsx

import React from 'react';
import {
  GitBranch,
  Settings,
  Server,
  Bell,
  Lock,
  Unlock,
  Plus,
  Minus,
  Database,
  Check,
  AlertTriangle,
  Clock,
  Terminal,
  BarChart2,
  MessageSquare,
  Mail,
  Info,
  Globe
} from 'lucide-react';
import { 
  ApplicationEnvironment, 
  CiCdConfig, 
  LoggingConfig, 
  MetricsConfig, 
  NotificationConfig 
} from '../../types/application';

interface StepProps {
  data: any;
  onChange: (data: any) => void;
}

export interface StepData {
  basics: {
    name: string;
    description: string;
    repository: string;
    environments: ApplicationEnvironment[];
  };
  cicd: {
    enabled: boolean;
    provider: 'jenkins' | 'github' | 'gitlab' | 'azure';
    repository: string;
    branch: string;
    triggers: {
      onPush: boolean;
      onPullRequest: boolean;
      onMerge: boolean;
      schedules: string[];
    };
    buildConfiguration: Record<string, any>;
  };
  logging: {
    enabled: boolean;
    provider: 'elk' | 'loki' | 'cloudwatch';
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    structuredLogging: boolean;
    retentionDays: number;
    filters: string[];
  };
  metrics: {
    enabled: boolean;
    provider: 'prometheus' | 'grafana' | 'datadog';
    scrapeInterval: number;
    retentionDays: number;
    dashboards: {
      id: string;
      name: string;
      panels: any[];
    }[];
  };
  notifications: {
    enabled: boolean;
    channels: {
      type: 'slack' | 'teams' | 'email';
      endpoint: string;
      events: string[];
    }[];
  };
}

export const BasicInformation: React.FC<StepProps> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Application Name
      </label>
      <input
        type="text"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="My Application"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        rows={3}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="Describe your application..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Repository URL
      </label>
      <input
        type="text"
        value={data.repository}
        onChange={(e) => onChange({ ...data, repository: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="https://github.com/username/repo"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Environments
      </label>
      <div className="mt-2 space-y-2">
        {(['development', 'qa', 'staging', 'production'] as ApplicationEnvironment[]).map((env) => (
          <label key={env} className="inline-flex items-center mr-6">
            <input
              type="checkbox"
              checked={data.environments.includes(env)}
              onChange={(e) => {
                const environments = e.target.checked
                  ? [...data.environments, env]
                  : data.environments.filter((e: string) => e !== env);
                onChange({ ...data, environments });
              }}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600 capitalize">{env}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export const CiCdSetup: React.FC<StepProps> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3">
        <label className="font-medium text-gray-700">Enable CI/CD Integration</label>
        <p className="text-sm text-gray-500">
          Configure continuous integration and deployment pipelines
        </p>
      </div>
    </div>

    {data.enabled && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select
            value={data.provider}
            onChange={(e) => onChange({ ...data, provider: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="github">GitHub Actions</option>
            <option value="gitlab">GitLab CI</option>
            <option value="jenkins">Jenkins</option>
            <option value="azure">Azure DevOps</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repository Branch
          </label>
          <input
            type="text"
            value={data.branch}
            onChange={(e) => onChange({ ...data, branch: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="main"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Build Triggers
          </label>
          <div className="mt-2 space-y-2">
            {Object.entries(data.triggers).map(([key, value]) => (
              key !== 'schedules' && (
                <label key={key} className="inline-flex items-center mr-6">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => onChange({
                      ...data,
                      triggers: {
                        ...data.triggers,
                        [key]: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              )
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Build Configuration
          </label>
          <textarea
            value={JSON.stringify(data.buildConfiguration, null, 2)}
            onChange={(e) => {
              try {
                const buildConfiguration = JSON.parse(e.target.value);
                onChange({ ...data, buildConfiguration });
              } catch (error) {
                // Handle invalid JSON
              }
            }}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
            placeholder="Enter JSON configuration..."
          />
        </div>
      </>
    )}
  </div>
);

export const LoggingSetup: React.FC<StepProps> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3">
        <label className="font-medium text-gray-700">Enable Logging Integration</label>
        <p className="text-sm text-gray-500">
          Configure application logging and monitoring
        </p>
      </div>
    </div>

    {data.enabled && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select
            value={data.provider}
            onChange={(e) => onChange({ ...data, provider: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="elk">ELK Stack</option>
            <option value="loki">Loki</option>
            <option value="cloudwatch">CloudWatch</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Log Level</label>
          <select
            value={data.logLevel}
            onChange={(e) => onChange({ ...data, logLevel: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.structuredLogging}
              onChange={(e) => onChange({ ...data, structuredLogging: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">Enable Structured Logging</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Log Retention (days)
          </label>
          <input
            type="number"
            value={data.retentionDays}
            onChange={(e) => onChange({ ...data, retentionDays: parseInt(e.target.value) })}
            min="1"
            max="365"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Log Filters
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.filters.map((filter: string, index: number) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <span className="text-sm text-gray-700">{filter}</span>
                <button
                  onClick={() => onChange({
                    ...data,
                    filters: data.filters.filter((_: string, i: number) => i !== index)
                  })}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const filter = prompt('Enter filter pattern:');
                if (filter) {
                  onChange({
                    ...data,
                    filters: [...data.filters, filter]
                  });
                }
              }}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Filter
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

export const MetricsSetup: React.FC<StepProps> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3">
        <label className="font-medium text-gray-700">Enable Metrics Integration</label>
        <p className="text-sm text-gray-500">
          Configure application metrics and monitoring
        </p>
      </div>
    </div>

    {data.enabled && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select
            value={data.provider}
            onChange={(e) => onChange({ ...data, provider: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="prometheus">Prometheus</option>
            <option value="grafana">Grafana</option>
            <option value="datadog">Datadog</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Scrape Interval (seconds)
          </label>
          <input
            type="number"
            value={data.scrapeInterval}
            onChange={(e) => onChange({ ...data, scrapeInterval: parseInt(e.target.value) })}
            // Continuation of MetricsSetup from where it was cut off...

            min="10"
            max="300"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            How often to collect metrics from your application
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Metrics Retention (days)
          </label>
          <input
            type="number"
            value={data.retentionDays}
            onChange={(e) => onChange({ ...data, retentionDays: parseInt(e.target.value) })}
            min="1"
            max="365"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Default Dashboards
            </label>
            <button
              onClick={() => onChange({
                ...data,
                dashboards: [
                  ...data.dashboards,
                  {
                    id: `dashboard-${Date.now()}`,
                    name: 'New Dashboard',
                    panels: []
                  }
                ]
              })}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Dashboard
            </button>
          </div>

          {data.dashboards.map((dashboard: any, dashIndex: number) => (
            <div key={dashboard.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={dashboard.name}
                  onChange={(e) => {
                    const newDashboards = [...data.dashboards];
                    newDashboards[dashIndex] = {
                      ...dashboard,
                      name: e.target.value
                    };
                    onChange({ ...data, dashboards: newDashboards });
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Dashboard Name"
                />
                <button
                  onClick={() => {
                    const newDashboards = data.dashboards.filter((_: unknown, i: number) => i !== dashIndex);
                    onChange({ ...data, dashboards: newDashboards });
                  }}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {dashboard.panels.map((panel: any, panelIndex: number) => (
                  <div key={panel.id || panelIndex} className="flex items-center space-x-2">
                    <BarChart2 className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={panel.name}
                      onChange={(e) => {
                        const newDashboards = [...data.dashboards];
                        newDashboards[dashIndex].panels[panelIndex].name = e.target.value;
                        onChange({ ...data, dashboards: newDashboards });
                      }}
                      className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Panel Name"
                    />
                    <select
                      value={panel.type}
                      onChange={(e) => {
                        const newDashboards = [...data.dashboards];
                        newDashboards[dashIndex].panels[panelIndex].type = e.target.value;
                        onChange({ ...data, dashboards: newDashboards });
                      }}
                      className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="gauge">Gauge</option>
                      <option value="stat">Stat</option>
                    </select>
                    <button
                      onClick={() => {
                        const newDashboards = [...data.dashboards];
                        newDashboards[dashIndex].panels = dashboard.panels.filter(
                          (_: any, i: number) => i !== panelIndex
                        );
                        onChange({ ...data, dashboards: newDashboards });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newDashboards = [...data.dashboards];
                    newDashboards[dashIndex].panels.push({
                      id: `panel-${Date.now()}`,
                      name: 'New Panel',
                      type: 'line'
                    });
                    onChange({ ...data, dashboards: newDashboards });
                  }}
                  className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Panel
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

export const NotificationSetup: React.FC<StepProps> = ({ data, onChange }) => (
  <div className="space-y-6">
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => onChange({ ...data, enabled: e.target.checked })}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3">
        <label className="font-medium text-gray-700">Enable Notifications</label>
        <p className="text-sm text-gray-500">
          Configure alerts and notifications for your application
        </p>
      </div>
    </div>

    {data.enabled && (
      <div className="space-y-4">
        {data.channels.map((channel: any, index: number) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {channel.type === 'slack' && <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />}
                {channel.type === 'teams' && <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />}
                {channel.type === 'email' && <Mail className="h-5 w-5 text-gray-400 mr-2" />}
                <h4 className="text-sm font-medium text-gray-700">
                  Notification Channel #{index + 1}
                </h4>
              </div>
              <button
                onClick={() => {
                  const channels = [...data.channels];
                  channels.splice(index, 1);
                  onChange({ ...data, channels });
                }}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Channel Type
                </label>
                <select
                  value={channel.type}
                  onChange={(e) => {
                    const channels = [...data.channels];
                    channels[index] = { 
                      type: e.target.value as 'slack' | 'teams' | 'email',
                      endpoint: '',
                      events: channel.events
                    };
                    onChange({ ...data, channels });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {channel.type === 'email' ? 'Email Recipients' : 'Webhook URL'}
                </label>
                <input
                  type={channel.type === 'email' ? 'text' : 'url'}
                  value={channel.endpoint}
                  onChange={(e) => {
                    const channels = [...data.channels];
                    channels[index] = { ...channel, endpoint: e.target.value };
                    onChange({ ...data, channels });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={
                    channel.type === 'email' ? 'Enter comma-separated email addresses' :
                    `Enter ${channel.type === 'slack' ? 'Slack' : 'Teams'} webhook URL`
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notify On
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    'deployment_started',
                    'deployment_success',
                    'deployment_failed',
                    'build_failed',
                    'high_error_rate',
                    'performance_alert'
                  ].map((event) => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={channel.events.includes(event)}
                        onChange={(e) => {
                          const channels = [...data.channels];
                          const events = e.target.checked
                            ? [...channel.events, event]
                            : channel.events.filter((e: string) => e !== event);
                          channels[index] = { ...channel, events };
                          onChange({ ...data, channels });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {event.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({
            ...data,
            channels: [
              ...data.channels,
              { type: 'slack' as const, endpoint: '', events: [] }
            ]
          })}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </button>
      </div>
    )}
  </div>
);