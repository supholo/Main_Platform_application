// src/components/FeatureManagement/FeatureList.tsx

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowUpRight,
  Tag,
  Flag,
  Percent,
  Users,
  Target,
  AlertTriangle,
  Check,
  Filter,
  Search,
  Settings,
  Beaker
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Feature, FeatureType } from '../../types/feature';

interface FeatureListProps {
  features: Feature[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}

const FeatureActionMenu: React.FC<{
  feature: Feature;
  onAction: (action: string) => void;
}> = ({ feature, onAction }) => (
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
          Edit Feature
        </button>
        <button
          onClick={() => onAction('promote')}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
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

const getFeatureTypeIcon = (type: FeatureType) => {
  switch (type) {
    case 'release':
      return <Flag className="h-4 w-4 text-blue-500" />;
    case 'experiment':
      return <Beaker className="h-4 w-4 text-purple-500" />;
    case 'operational':
      return <Settings className="h-4 w-4 text-yellow-500" />;
    case 'permission':
      return <Users className="h-4 w-4 text-green-500" />;
    default:
      return <Flag className="h-4 w-4 text-gray-500" />;
  }
};

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onEdit,
  onDelete,
  onPromote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FeatureType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleAction = (featureId: string, action: string) => {
    switch (action) {
      case 'edit':
        onEdit(featureId);
        break;
      case 'delete':
        onDelete(featureId);
        break;
      case 'promote':
        onPromote(featureId);
        break;
    }
  };

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || feature.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as FeatureType | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            <option value="release">Release Toggles</option>
            <option value="experiment">Experiment Toggles</option>
            <option value="operational">Operational Toggles</option>
            <option value="permission">Permission Toggles</option>
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    {getFeatureTypeIcon(feature.type)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <Badge
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {feature.status}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                  <code className="mt-1 text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {feature.key}
                  </code>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {feature.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Feature Values */}
                  <div className="mt-4 space-y-2">
                    {feature.values.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {value.environment}
                          </Badge>
                          {value.rolloutPercentage !== undefined && value.rolloutPercentage < 100 && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <Percent className="h-4 w-4 mr-1" />
                              {value.rolloutPercentage}%
                            </span>
                          )}
                          {value.rules.length > 0 && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {value.rules.length} rules
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={value.enabled}
                          onCheckedChange={(checked) => {
                            // Handle toggle change
                            onEdit(feature.id);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Version {feature.version}</span>
                    <span>•</span>
                    <span>Updated {new Date(feature.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>By {feature.updatedBy}</span>
                  </div>
                </div>

                <FeatureActionMenu
                  feature={feature}
                  onAction={(action) => handleAction(feature.id, action)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <Flag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No features found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new feature'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};