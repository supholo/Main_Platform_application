// src/components/ConfigurationManagement/ConfigurationsList.tsx

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowUpRight,
  Tag,
  CheckCircle,
  XCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Configuration } from '../../types/configuration';

interface ConfigurationsListProps {
  configurations: Configuration[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}

const ConfigurationActionMenu: React.FC<{
  config: Configuration;
  onAction: (action: string) => void;
}> = ({ config, onAction }) => (
  <div className="relative group">
    <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
      <MoreVertical className="h-5 w-5 text-gray-400" />
    </button>
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
      <div className="py-1">
        <button
          onClick={() => onAction('edit')}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          <Edit className="h-4 w-4 inline mr-2" />
          Edit Configuration
        </button>
        <button
          onClick={() => onAction('promote')}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          disabled={config.environment === 'production'}
        >
          <ArrowUpRight className="h-4 w-4 inline mr-2" />
          Promote
        </button>
        <button
          onClick={() => onAction('delete')}
          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          <Trash2 className="h-4 w-4 inline mr-2" />
          Delete
        </button>
      </div>
    </div>
  </div>
);

export const ConfigurationsList: React.FC<ConfigurationsListProps> = ({
  configurations,
  onEdit,
  onDelete,
  onPromote
}) => {
  const handleAction = (configId: string, action: string) => {
    switch (action) {
      case 'edit':
        onEdit(configId);
        break;
      case 'delete':
        onDelete(configId);
        break;
      case 'promote':
        onPromote(configId);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {configurations.map((config) => (
        <Card key={config.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {config.name}
                  </h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    config.status === 'active' ? 'bg-green-100 text-green-800' :
                    config.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {config.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{config.description}</p>
                
                <div className="mt-4 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      {config.tags.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {config.values.some(v => v.isSecret) ? (
                      <Lock className="h-4 w-4 text-yellow-500 mr-1" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    <span className="text-sm text-gray-500">
                      {config.values.length} values
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">
                      v{config.version}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {config.values.map((value) => (
                    <div
                      key={value.id}
                      className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      <span className="font-medium">{value.key}</span>
                      {!value.isSecret && (
                        <span className="ml-2 text-gray-500">
                          = {typeof value.value === 'object' 
                              ? 'JSON' 
                              : String(value.value).substring(0, 20)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <ConfigurationActionMenu
                config={config}
                onAction={(action) => handleAction(config.id, action)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};