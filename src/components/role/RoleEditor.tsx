// src/components/role/RoleEditor.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Role, Permission } from "../../types/role";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card";
import { Alert } from "../ui/alert";
import LoadingSpinner from "../LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  PermissionDependencyGraph
} from "./PermissionDependencyGraph";
import {
    PermissionTree,
  } from "./PermissionTree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface RoleEditorProps {
  role: Role | null;
  permissions: Permission[];
  onSave: (data: Partial<Role>) => Promise<void>;
  onCreatePermission?: (data: Omit<Permission, "id">) => Promise<void>; // Add this line
  onCancel: () => void;
  loading: boolean;
}

interface PermissionCategoryProps {
  category: string;
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (permissionId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

interface AdvancedSettingsProps {
  value: Role["metadata"];
  onChange: (value: Role["metadata"]) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={value?.allowDelegation || false}
          onChange={(e) =>
            onChange({ ...value, allowDelegation: e.target.checked })
          }
          id="allowDelegation"
        />
        <label htmlFor="allowDelegation">Allow Role Delegation</label>
      </div>

      {value?.allowDelegation && (
        <div className="pl-6">
          <label className="block text-sm mb-1">Maximum Delegation Depth</label>
          <input
            type="number"
            min="1"
            max="5"
            value={value?.maxDelegationDepth || 1}
            onChange={(e) =>
              onChange({
                ...value,
                maxDelegationDepth: parseInt(e.target.value),
              })
            }
            className="w-24 rounded-md"
          />
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Role Expiration</label>
        <input
          type="date"
          value={value?.expirationDate || ""}
          onChange={(e) =>
            onChange({ ...value, expirationDate: e.target.value })
          }
          className="rounded-md"
        />
      </div>
    </div>
  );
};

const PermissionCategory: React.FC<PermissionCategoryProps> = ({
  category,
  permissions,
  selectedPermissions,
  onTogglePermission,
  expanded,
  onToggleExpand,
}) => {
  // Add a stable motion div identifier
  const motionDivId = React.useMemo(
    () => `category-${category.toLowerCase().replace(/\s+/g, "-")}`,
    [category]
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleExpand();
        }}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            {category}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            (
            {
              permissions.filter((p) => selectedPermissions.includes(p.id))
                .length
            }
            /{permissions.length})
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            layoutId={motionDivId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 space-y-2">
              {permissions.map((permission) => (
                <motion.div
                  key={permission.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => {
                      e.preventDefault();
                      onTogglePermission(permission.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </span>
                      {permission.risk === "high" && (
                        <div
                          className="ml-2 flex items-center text-yellow-500"
                          title="High Risk Permission"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {permission.description}
                    </p>
                    {permission.dependencies &&
                      permission.dependencies.length > 0 && ( // Added optional chaining here
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <Info className="inline-block h-3 w-3 mr-1" />
                          Requires:{" "}
                          {permission.dependencies
                            .map((dep) => {
                              const depPerm = permissions.find(
                                (p) => p.id === dep
                              );
                              return depPerm?.name;
                            })
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                  </div>
                  {selectedPermissions.includes(permission.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RoleEditor: React.FC<RoleEditorProps> = ({
  role,
  permissions,
  onSave,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<Role>>({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
    status: role?.status || "active",
    metadata: role?.metadata || {},
  });
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [view, setView] = useState<"list" | "tree" | "graph">("list");

  // Update the handlePermissionToggle in RoleEditor to prevent re-renders
  const handlePermissionToggle = useCallback(
    (permissionId: string) => {
      const permission = permissions.find((p) => p.id === permissionId);
      if (!permission) return;

      setFormData((prev) => {
        const currentPermissions = new Set(prev.permissions || []);

        if (currentPermissions.has(permissionId)) {
          // When removing a permission, also remove any permissions that depend on it
          const toRemove = new Set([permissionId]);

          // Find all permissions that depend on the one being removed
          permissions.forEach((p) => {
            if (p.dependencies?.includes(permissionId)) {
              toRemove.add(p.id);
            }
          });

          return {
            ...prev,
            permissions: Array.from(currentPermissions).filter(
              (id) => !toRemove.has(id)
            ),
          };
        } else {
          // When adding a permission, also add its dependencies
          permission.dependencies?.forEach((depId) => {
            currentPermissions.add(depId);
          });
          currentPermissions.add(permissionId);

          return {
            ...prev,
            permissions: Array.from(currentPermissions),
          };
        }
      });
    },
    [permissions]
  );

  // Toggle categories expansion state
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const permissionsByCategory = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!formData.name?.trim()) {
        setError("Role name is required");
        return;
      }
      if (!formData.permissions?.length) {
        setError("At least one permission is required");
        return;
      }

      const dataToSave: Partial<Role> = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        status: formData.status,
        metadata: formData.metadata,
        // Preserve existing data
        type: role?.type || "custom",
        userCount: role?.userCount ?? 0,
      };
      await onSave(dataToSave);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role");
    }
  };

  const renderPermissionsContent = () => {
    const PermissionsWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => <div onClick={(e) => e.stopPropagation()}>{children}</div>;

    const containerStyles = "min-h-[600px] h-[calc(100vh-400px)] overflow-auto border rounded-lg p-4";

    if (view === "list") {
      return (
        <PermissionsWrapper>
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <PermissionCategory
                key={category}
                category={category}
                permissions={perms}
                selectedPermissions={formData.permissions || []}
                onTogglePermission={(id) => {
                  handlePermissionToggle(id);
                }}
                expanded={!!expandedCategories[category]}
                onToggleExpand={() => toggleCategory(category)}
              />
            ))}
            {Object.keys(permissionsByCategory).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No permissions available
              </div>
            )}
          </div>
        </PermissionsWrapper>
      );
    }

    if (view === "tree") {
      return (
        <PermissionsWrapper>
          <div className={containerStyles} onClick={(e) => e.stopPropagation()}>
            <PermissionTree
              permissions={permissions}
              selectedPermissions={formData.permissions || []}
              onTogglePermission={handlePermissionToggle}
            />
          </div>
        </PermissionsWrapper>
      );
    }

    if (view === "graph") {
      return (
        <PermissionsWrapper>
          <div className={containerStyles}>
            <PermissionDependencyGraph
              permissions={permissions}
              selectedPermissions={formData.permissions || []}
              onSelectPermission={handlePermissionToggle}
            />
          </div>
        </PermissionsWrapper>
      );
    }
  };

  return (
    <Card className="h-[calc(100vh-100px)]">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{role ? "Edit Role" : "Create Role"}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter role name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Enter role description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as Role["status"],
                      }))
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-4 h-full">
                <div className="flex justify-end space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`px-3 py-1 rounded ${
                      view === "list" ? "bg-indigo-100 text-indigo-700" : ""
                    }`}
                  >
                    List View
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("tree")}
                    className={`px-3 py-1 rounded ${
                      view === "tree" ? "bg-indigo-100 text-indigo-700" : ""
                    }`}
                  >
                    Tree View
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("graph")}
                    className={`px-3 py-1 rounded ${
                      view === "graph" ? "bg-indigo-100 text-indigo-700" : ""
                    }`}
                  >
                    Dependency Graph
                  </button>
                </div>
                <div className="h-[calc(100%-60px)]"> {/* Subtract height of the buttons */}
      {renderPermissionsContent()}
    </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedSettings
                value={formData.metadata || {}}
                onChange={(metadata) =>
                  setFormData((prev) => ({ ...prev, metadata }))
                }
              />
            </TabsContent>
          </Tabs>

          {error && (
            <Alert type="error" className="mt-4">
              {error}
            </Alert>
          )}
        </CardContent>

        <CardFooter className="border-t mt-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Saving...
              </span>
            ) : (
              "Save Role"
            )}
          </button>
        </CardFooter>
      </form>
    </Card>
  );
};
