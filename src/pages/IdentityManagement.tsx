import React, { useState, useCallback } from "react";
import {
  Shield,
  User,
  Lock,
  Key,
  UserPlus,
  Mail,
  Smartphone,
  Settings,
  AlertTriangle,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Alert } from "../components/ui/alert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useIdentity } from "../hooks/useIdentity";
import { ApiKeyManager } from "../components/IdentityManagement/ApiKeyManager";
import { IdentityProviderConfig } from "../components/IdentityManagement/IdentityProviderConfig";
import { UserInvite } from "../components/IdentityManagement/UserInvite";
import {
  User as UserType,
  IdentityProvider,
  UserStatus,
  CreateUserData,
} from "../services/identityService";
import { AccessPolicyManager } from "../components/IdentityManagement/SecurityFeatures";
import { DataAccessAudit } from "../components/IdentityManagement/SecurityFeatures";
import { AdvancedSecuritySettings } from "../components/IdentityManagement/SecurityFeatures";
import { SessionMonitor } from "../components/IdentityManagement/SecurityComponents";
import { UserRiskScore } from "../components/IdentityManagement/SecurityComponents";
import { Dialog } from '../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useIdentityAudit } from "../hooks/useIdentityAudit";
import {
  IdentityAuditEvent,
  IdentityAuditEventType,
} from "../types/identityAudit";
import SecurityOverview from "../components/IdentityManagement/SecurityOverview";
import AccessLogs from "../components/IdentityManagement/AccessLogs";
import { Modal } from '../components/ui/modal';  // Assuming you have a Modal component

// Dropdown menu component for user actions
const UserActionMenu: React.FC<{
  user: UserType;
  onAction: (action: string) => void;
}> = ({ user, onAction }) => (
  <div className="relative group">
    <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
      <MoreVertical className="h-5 w-5 text-gray-400" />
    </button>
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
      <div className="py-1">
        <button
          onClick={() => onAction("resetPassword")}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          Reset Password
        </button>
        <button
          onClick={() => onAction("manageApiKeys")}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          Manage API Keys
        </button>
        <button
          onClick={() =>
            onAction(user.status === "active" ? "deactivate" : "activate")
          }
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          {user.status === "active" ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onAction("resetMFA")}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
        >
          Reset MFA
        </button>
      </div>
    </div>
  </div>
);

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    createApiKey,
    refetch,
  } = useIdentity();

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (user: UserType, action: string) => {
    try {
      switch (action) {
        case "resetPassword":
          await updateUser(user.id, { passwordReset: true });
          break;
        case "activate":
          await updateUser(user.id, { status: "active" });
          break;
        case "deactivate":
          await updateUser(user.id, { status: "inactive" });
          break;
        case "resetMFA":
          await updateUser(user.id, { mfaEnabled: false });
          break;
        case "manageApiKeys":
          setSelectedUser(user);
          setShowApiKeys(true);
          break;
      }
      await refetch();
    } catch (error) {
      console.error("Failed to perform user action:", error);
    }
  };

  const handleInviteUser = async (data: {
    email: string;
    role: string;
    sendEmail: boolean;
  }) => {
    try {
      const userData: CreateUserData = {
        email: data.email,
        role: data.role,
        status: "pending" as UserStatus,
        name: data.email.split("@")[0],
        mfaEnabled: false,
        lastLogin: "",
      };

      await createUser(userData);
      await refetch();
      setShowInviteModal(false);
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  const handleCreateApiKey = async (
    userId: string,
    data: { name: string; scopes: string[]; expires: string }
  ) => {
    try {
      await createApiKey(userId, data);
      await refetch();
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user access and permissions
            </CardDescription>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert type="error">{error.message}</Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    MFA
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    API Access
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers?.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : user.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.mfaEnabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.apiAccess?.enabled ? (
                        <div className="flex items-center">
                          <Key className="h-5 w-5 text-green-500 mr-1" />
                          <span className="text-sm text-gray-500">
                            {user.apiAccess.keys.length} keys
                          </span>
                        </div>
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <UserActionMenu
                        user={user}
                        onAction={(action) => handleUserAction(user, action)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Modals */}
      {showInviteModal && (
        <UserInvite
          onInvite={handleInviteUser}
          onClose={() => setShowInviteModal(false)}
          availableRoles={["admin", "user", "viewer"]}
        />
      )}

      {showApiKeys && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            <ApiKeyManager
              user={selectedUser}
              onCreateKey={(data) => handleCreateApiKey(selectedUser.id, data)}
              onRevokeKey={async (keyId) => {
                try {
                  await updateUser(selectedUser.id, {
                    apiAccess: {
                      ...selectedUser.apiAccess,
                      keys:
                        selectedUser.apiAccess?.keys.filter(
                          (k) => k.id !== keyId
                        ) || [],
                    },
                  });
                  await refetch();
                } catch (error) {
                  console.error("Failed to revoke API key:", error);
                }
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

const AuthenticationSettings: React.FC = () => {
  const { providers, loading, error, createProvider, updateProvider, refetch } =
    useIdentity();

  const [authSettings, setAuthSettings] = useState<{
    mfaEnabled: boolean;
    mfaEnforced: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      expiryDays: number;
      preventReuse: number;
    };
  }>({
    mfaEnabled: false,
    mfaEnforced: false,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expiryDays: 90,
      preventReuse: 5,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateSettings = async () => {
    try {
      if (!providers.length) return;

      // Update settings through identity service
      await updateProvider(providers[0].id, {
        config: {
          ...providers[0].config,
          mfaEnabled: authSettings.mfaEnabled,
          mfaEnforced: authSettings.mfaEnforced,
          sessionTimeout: authSettings.sessionTimeout,
          passwordPolicy: authSettings.passwordPolicy,
        },
      } as Partial<IdentityProvider>);

      setIsEditing(false);
      await refetch();
    } catch (error) {
      console.error("Failed to update authentication settings:", error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div className="space-y-6">
      {providers.map((provider) => (
        <IdentityProviderConfig
          key={provider.id}
          provider={provider}
          onUpdate={async (data) => {
            try {
              await updateProvider(provider.id, data);
              await refetch();
            } catch (error) {
              console.error("Failed to update provider:", error);
            }
          }}
        />
      ))}

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access policies
              </CardDescription>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* MFA Settings */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Multi-Factor Authentication
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={authSettings.mfaEnabled}
                      onChange={(e) =>
                        setAuthSettings((prev) => ({
                          ...prev,
                          mfaEnabled: e.target.checked,
                        }))
                      }
                      disabled={!isEditing}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Enable MFA
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={authSettings.mfaEnforced}
                      onChange={(e) =>
                        setAuthSettings((prev) => ({
                          ...prev,
                          mfaEnforced: e.target.checked,
                        }))
                      }
                      disabled={!isEditing || !authSettings.mfaEnabled}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Enforce MFA for all users
                    </label>
                  </div>
                </div>

                {authSettings.mfaEnabled && authSettings.mfaEnforced && (
                  <Alert type="warning">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="ml-2">
                      Enforcing MFA will require all users to set up 2FA during
                      their next login
                    </span>
                  </Alert>
                )}
              </div>
            </div>

            {/* Password Policy */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Password Policy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Length
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={32}
                    value={authSettings.passwordPolicy.minLength}
                    onChange={(e) =>
                      setAuthSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          minLength: parseInt(e.target.value),
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={authSettings.passwordPolicy.expiryDays}
                    onChange={(e) =>
                      setAuthSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          expiryDays: parseInt(e.target.value),
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={authSettings.passwordPolicy.requireUppercase}
                    onChange={(e) =>
                      setAuthSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: e.target.checked,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Require uppercase letters
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={authSettings.passwordPolicy.requireNumbers}
                    onChange={(e) =>
                      setAuthSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: e.target.checked,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Require numbers
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={authSettings.passwordPolicy.requireSymbols}
                    onChange={(e) =>
                      setAuthSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSymbols: e.target.checked,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Require special characters
                  </label>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Session Settings
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={authSettings.sessionTimeout}
                  onChange={(e) =>
                    setAuthSettings((prev) => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value),
                    }))
                  }
                  disabled={!isEditing}
                  className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Save Changes
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const IdentityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [showSecurityOverview, setShowSecurityOverview] = useState(false);
  const [showAccessLogs, setShowAccessLogs] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    users,
    loading: identityLoading,
    error: identityError,
    // ... other identity hook values
  } = useIdentity();

  // Identity audit hook
  const {
    auditEvents,
    complianceReports,
    accessReviews,
    loading: auditLoading,
    error: auditError,
    logAuditEvent,
    generateComplianceReport,
    refetch: refetchAudit,
  } = useIdentityAudit();

  const handleGenerateReport = async () => {
    try {
      await generateComplianceReport("security_posture");
      await refetchAudit();
    } catch (error) {
      console.error("Failed to generate compliance report:", error);
    }
  };

  const handleInitiateReview = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");

      const event: Omit<IdentityAuditEvent, "id"> = {
        eventType: "access_review.initiated" as IdentityAuditEventType,
        timestamp: new Date().toISOString(),
        actor: {
          id: "current-user", // Replace with actual current user ID
          name: "Current User", // Replace with actual current user name
          type: "user" as const,
        },
        target: {
          id: userId,
          type: "user" as const,
          name: user.name,
        },
        action: "initiated_access_review",
        status: "success",
        metadata: {
          initiatedBy: "manual" as const,
          reason: "periodic_review",
        },
        risk: {
          level: "low" as const,
          factors: [],
        },
      };

      await logAuditEvent(event);
      await refetchAudit();
    } catch (error) {
      console.error("Failed to initiate access review:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Identity & Access Management
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSecurityOverview(true)} // Show security overview
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security Overview
          </button>
          <button
            onClick={() => setShowAccessLogs(true)} // Show audit logs
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Access Logs
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <User className="h-5 w-5 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-5 w-5 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="access-policies">
            <Shield className="h-5 w-5 mr-2" />
            Access Policies
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Key className="h-5 w-5 mr-2" />
            Audit & Compliance
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdvancedSecuritySettings />
            <SessionMonitor sessions={[]} /> {/* Pass actual session data */}
          </div>
        </TabsContent>

        <TabsContent value="access-policies">
          <AccessPolicyManager
            policies={[]} // Pass actual policies
            onUpdatePolicy={async () => {}} // Implement handlers
            onCreatePolicy={async () => {}}
          />
        </TabsContent>

        <TabsContent value="audit">
          <DataAccessAudit
            identityEvents={auditEvents}
            complianceReports={complianceReports}
            accessReviews={accessReviews}
            onGenerateReport={handleGenerateReport}
            onInitiateReview={handleInitiateReview}
          />
        </TabsContent>

        <TabsContent value="settings">
          <AdvancedSecuritySettings />
        </TabsContent>
      </Tabs>

      <Dialog isOpen={showSecurityOverview} onClose={() => setShowSecurityOverview(false)}>
        <Dialog.Content className="max-w-6xl">
          <Dialog.Header>
            <div className="flex justify-between items-center w-full">
              <div>
                <Dialog.Title>Security Overview</Dialog.Title>
                <Dialog.Description>
                  Comprehensive security status and metrics
                </Dialog.Description>
              </div>
              <button
                onClick={() => setShowSecurityOverview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </Dialog.Header>
          <div className="p-6">
            <SecurityOverview />
          </div>
        </Dialog.Content>
      </Dialog>

      {/* Access Logs Dialog */}
      <Dialog isOpen={showAccessLogs} onClose={() => setShowAccessLogs(false)}>
        <Dialog.Content className="max-w-7xl">
          <Dialog.Header>
            <div className="flex justify-between items-center w-full">
              <div>
                <Dialog.Title>Access Logs</Dialog.Title>
                <Dialog.Description>
                  Detailed system access history and security events
                </Dialog.Description>
              </div>
              <button
                onClick={() => setShowAccessLogs(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </Dialog.Header>
          <div className="p-6">
            <AccessLogs />
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default IdentityManagement;
