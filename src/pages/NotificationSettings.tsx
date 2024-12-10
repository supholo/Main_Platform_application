// src/pages/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus,
  Settings,
  AlertTriangle,
  Calendar,
  Check,
  X,
  Clock,
  Mail,
  MessageSquare,
  Globe,
  Activity
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  CardAction 
} from '../components/ui/Card';
import { Alert } from '../components/ui/alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  NotificationRule, 
  NotificationEvent,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus 
} from '../types/notifications';
import { notificationService } from '../services/notificationService';

const NotificationSettings: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, eventsData] = await Promise.all([
        notificationService.getRules(),
        notificationService.getEvents()
      ]);
      setRules(rulesData);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'slack':
        return <MessageSquare className="h-5 w-5" />;
      case 'webhook':
        return <Globe className="h-5 w-5" />;
      case 'inapp':
        return <Bell className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getPriorityStyle = (priority: NotificationPriority): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTestRule = async (rule: NotificationRule) => {
    try {
      setLoading(true);
      await notificationService.testRule(rule);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test notification rule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Notification Settings
        </h1>
        <button
          onClick={() => {
            setSelectedRule(null);
            setIsEditing(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Rules</CardTitle>
          <CardDescription>Configure when and how to send notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="border rounded-lg p-4 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getChannelIcon(rule.channel)}
                      <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        getPriorityStyle(rule.priority)
                      }`}>
                        {rule.priority}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        rule.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {rule.status}
                      </span>
                    </div>

                    {rule.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {rule.description}
                      </p>
                    )}

                    {/* Rule Details */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <strong>Events:</strong>{' '}
                          {rule.conditions.events.join(', ')}
                        </div>
                        {rule.conditions.filters && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>Filters:</strong>{' '}
                            {Object.entries(rule.conditions.filters)
                              .map(([key, value]) => `${key}: ${value.join(', ')}`)
                              .join(' | ')}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <strong>Channel Config:</strong>{' '}
                          {rule.channel === 'email' && rule.config.email?.recipients.length + ' recipients'}
                          {rule.channel === 'slack' && rule.config.slack?.channel}
                          {rule.channel === 'webhook' && 'Webhook URL configured'}
                          {rule.channel === 'inapp' && (rule.config.inapp?.roles?.length || 0) + ' roles'}
                        </div>
                        {rule.lastTriggered && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <strong>Last Triggered:</strong>{' '}
                            {new Date(rule.lastTriggered).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleTestRule(rule)}
                      className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRule(rule);
                        setIsEditing(true);
                      }}
                      className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>History of sent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 border rounded-lg"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  event.status === 'sent' 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {event.status === 'sent' ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center">
                    {getChannelIcon(event.channel)}
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                      {rules.find(r => r.id === event.ruleId)?.name || 'Unknown Rule'}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      getPriorityStyle(event.priority)
                    }`}>
                      {event.priority}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {event.message}
                  </p>

                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      <Clock className="inline-block h-4 w-4 mr-1" />
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                    <span>
                      <Bell className="inline-block h-4 w-4 mr-1" />
                      {event.recipientCount} recipient(s)
                    </span>
                    {event.metadata.triggeredBy && (
                      <span>
                        <Activity className="inline-block h-4 w-4 mr-1" />
                        {event.metadata.source}
                      </span>
                    )}
                  </div>

                  {event.metadata.error && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                      {event.metadata.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedRule ? 'Edit Notification Rule' : 'Create Notification Rule'}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedRule(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              {/* Rule Editor Form */}
              {/* Implement the form for editing notification rules */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
