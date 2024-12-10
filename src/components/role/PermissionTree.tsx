import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Permission } from '../../types/role';

interface PermissionTreeProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (id: string) => void;
}

interface PermissionNodeProps {
  permission: Permission;
  level: number;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  children?: React.ReactNode;
}

// Separate Node component to better control renders and state
const PermissionNode: React.FC<PermissionNodeProps> = React.memo(({
  permission,
  level,
  selected,
  expanded,
  onToggleSelect,
  onToggleExpand,
  children
}) => {
  const hasChildren = Boolean(children);

  return (
    <div className="select-none">
      <div className="flex items-center gap-2" style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center min-w-[32px]">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(permission.id);
              }}
              className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
            >
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </button>
          )}
        </div>

        <div 
          className={`flex-1 p-2 rounded-lg ${
            selected ? 'bg-indigo-50 dark:bg-indigo-900' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="flex items-center min-w-[24px]" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(permission.id);
                }}
                className="cursor-pointer"
              />
            </div>
            <div className="ml-2">
              <div className="font-medium">{permission.name}</div>
              {permission.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {permission.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {children && (
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
          className="mt-1"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
});

PermissionNode.displayName = 'PermissionNode';

export const PermissionTree: React.FC<PermissionTreeProps> = ({
  permissions,
  selectedPermissions,
  onTogglePermission
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set());

  const handleToggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const buildTree = (permission: Permission, level = 0) => {
    const dependentPermissions = permissions.filter(p => 
      p.dependencies?.includes(permission.id)
    );

    return (
      <PermissionNode
        key={permission.id}
        permission={permission}
        level={level}
        selected={selectedPermissions.includes(permission.id)}
        expanded={expandedNodes.has(permission.id)}
        onToggleSelect={onTogglePermission}
        onToggleExpand={handleToggleExpand}
      >
        {dependentPermissions.length > 0 && (
          dependentPermissions.map(dep => buildTree(dep, level + 1))
        )}
      </PermissionNode>
    );
  };

  const rootPermissions = permissions.filter(p => !p.dependencies?.length);

  return (
    <div className="space-y-2">
      {rootPermissions.map(perm => buildTree(perm))}
    </div>
  );
};