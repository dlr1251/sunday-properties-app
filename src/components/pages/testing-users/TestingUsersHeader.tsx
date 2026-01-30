import React from 'react';
import { CheckCircle } from 'lucide-react';
import { GroupedUsers } from './types';

interface TestingUsersHeaderProps {
  usersCount: number;
  groupedUsers: GroupedUsers;
}

export const TestingUsersHeader: React.FC<TestingUsersHeaderProps> = ({
  usersCount,
  groupedUsers
}) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Testing Users</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Select a user to log in and explore the platform. Data fetched live from Supabase.
      </p>

      {/* Live Data Stats */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
        <div className="flex items-center mb-2">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm font-medium text-green-800">Live Supabase Data</p>
        </div>
        <div className="text-sm text-green-700">
          <strong>✅ Connected to Database:</strong> {usersCount} users loaded<br />
          <strong>Super Admin:</strong> {groupedUsers.superAdmin.length} |
          <strong>Admins:</strong> {groupedUsers.admins.length} |
          <strong>Lawyers:</strong> {groupedUsers.lawyers.length} |
          <strong>Agents:</strong> {groupedUsers.agents.length} |
          <strong>Regular Users:</strong> {groupedUsers.users.length}
        </div>
      </div>
    </div>
  );
};

