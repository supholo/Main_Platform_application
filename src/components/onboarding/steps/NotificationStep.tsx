import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Alert } from '../../ui/alert';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'sms' | 'webhook';
  enabled: boolean;
  config: {
    recipients?: string[];
    webhookUrl?: string;
    channel?: string;
    apiKey?: string;
  };
  events: string[];
}

interface NotificationsStepProps {
  channels: NotificationChannel[];
  onAddChannel: () => void;
  onUpdateChannel: (index: number, channel: NotificationChannel) => void;
  onRemoveChannel: (index: number) => void;
  errors: Record<string, string>;
}

const availableEvents = [
  { id: 'deployment', name: 'Deployment Events' },
  { id: 'security', name: 'Security Alerts' },
  { id: 'monitoring', name: 'Monitoring Alerts' },
  { id: 'user', name: 'User Activities' },
  { id: 'system', name: 'System Events' },
];

export const NotificationsStep: React.FC<NotificationsStepProps> = ({
  channels,
  onAddChannel,
  onUpdateChannel,
  onRemoveChannel,
  errors
}) => {
  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'slack':
        return <MessageSquare className="h-5 w-5" />;
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      case 'webhook':
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {channels.map((channel, index) => (
          <div
            key={channel.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {getChannelIcon(channel.type)}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Notifications
                </h3>
              </div>
              <button
                onClick={() => onRemoveChannel(index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={(e) => onUpdateChannel(index, {
                    ...channel,
                    enabled: e.target.checked
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Enable this channel
                </label>
              </div>

              {channel.enabled && (
                <>
                  {channel.type === 'email' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recipients (one email per line)
                      </label>
                      <textarea
                        value={channel.config.recipients?.join('\n') || ''}
                        onChange={(e) => onUpdateChannel(index, {
                          ...channel,
                          config: {
                            ...channel.config,
                            recipients: e.target.value.split('\n').filter(email => email.trim())
                          }
                        })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                      {errors[`channels.${index}.recipients`] && (
                        <Alert type="error" className="mt-1">{errors[`channels.${index}.recipients`]}</Alert>
                      )}
                    </div>
                  )}

                  {channel.type === 'slack' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={channel.config.webhookUrl || ''}
                          onChange={(e) => onUpdateChannel(index, {
                            ...channel,
                            config: {
                              ...channel.config,
                              webhookUrl: e.target.value
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        />
                        {errors[`channels.${index}.webhookUrl`] && (
                          <Alert type="error" className="mt-1">{errors[`channels.${index}.webhookUrl`]}</Alert>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Channel
                        </label>
                        <input
                          type="text"
                          value={channel.config.channel || ''}
                          onChange={(e) => onUpdateChannel(index, {
                            ...channel,
                            config: {
                              ...channel.config,
                              channel: e.target.value
                            }
                          })}
                          placeholder="#notifications"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                        />
                      </div>
                    </>
                  )}

                  {channel.type === 'webhook' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={channel.config.webhookUrl || ''}
                        onChange={(e) => onUpdateChannel(index, {
                          ...channel,
                          config: {
                            ...channel.config,
                            webhookUrl: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                      {errors[`channels.${index}.webhookUrl`] && (
                        <Alert type="error" className="mt-1">{errors[`channels.${index}.webhookUrl`]}</Alert>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Events
                    </label>
                    <div className="mt-2 space-y-2">
                      {availableEvents.map(event => (
                        <div key={event.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={channel.events.includes(event.id)}
                            onChange={(e) => {
                              const newEvents = e.target.checked
                                ? [...channel.events, event.id]
                                : channel.events.filter(id => id !== event.id);
                              onUpdateChannel(index, {
                                ...channel,
                                events: newEvents
                              });
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            {event.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors[`channels.${index}.events`] && (
                      <Alert type="error" className="mt-1">{errors[`channels.${index}.events`]}</Alert>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={onAddChannel}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Notification Channel
        </button>
      </CardContent>
    </Card>
  );
};