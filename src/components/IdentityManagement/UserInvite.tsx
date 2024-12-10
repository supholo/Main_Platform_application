import React, { useState } from 'react';
import { UserPlus, Mail, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

interface UserInviteProps {
  onInvite: (data: { email: string; role: string; sendEmail: boolean }) => Promise<void>;
  onClose: () => void;
  availableRoles: string[];
}

export const UserInvite: React.FC<UserInviteProps> = ({
  onInvite,
  onClose,
  availableRoles
}) => {
  const [inviteData, setInviteData] = useState({
    email: '',
    role: availableRoles[0] || '',
    sendEmail: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onInvite(inviteData);
      onClose();
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>Send an invitation to join the organization</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={inviteData.sendEmail}
                onChange={(e) => setInviteData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Send invitation email
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};