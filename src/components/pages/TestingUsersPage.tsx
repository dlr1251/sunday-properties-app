import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, AlertCircle, Crown, Briefcase, Gavel, Award, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTestingUsers } from './testing-users/useTestingUsers';
import { TestingUsersHeader } from './testing-users/TestingUsersHeader';
import { UserGroupSection } from './testing-users/UserGroupSection';
import { ExtendedUserProfile, GroupedUsers } from './testing-users/types';
import { getRoleIcon } from './testing-users/utils';

export const TestingUsersPage: React.FC = () => {
  const { signIn, signOut, loading, user, profile } = useAuth();
  const navigate = useNavigate();
  const { users, loadingUsers, error } = useTestingUsers();
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Listen for auth state changes to handle login completion
  useEffect(() => {
    if (isLoggingIn && user && profile && selectedUser) {
      toast.success(`Welcome back, ${selectedUser.full_name || selectedUser.email}! Redirecting to your dashboard...`);
      setIsLoggingIn(false);
      setSelectedUser(null);
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, isLoggingIn, selectedUser, navigate]);

  const handleLogin = async (user: ExtendedUserProfile) => {
    setIsLoggingIn(true);
    setSelectedUser(user);

    try {
      // Sign out any existing user first
      await signOut();

      // Small delay to ensure sign out completes
      await new Promise(resolve => setTimeout(resolve, 100));

      await signIn(user.email, 'Test123456!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error?.message || 'Please try again.'}`);
      setIsLoggingIn(false);
      setSelectedUser(null);
    }
  };

  const groupedUsers: GroupedUsers = React.useMemo(() => ({
    superAdmin: users.filter(u => u.role === 'super_admin'),
    admins: users.filter(u => u.role === 'admin'),
    lawyers: users.filter(u => u.role === 'lawyer'),
    agents: users.filter(u => u.role === 'agent'),
    users: users.filter(u => u.role === 'user')
  }), [users]);

  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Testing Users</h1>
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p className="text-lg text-gray-600">Loading users from Supabase...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Testing Users</h1>
            <Alert className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TestingUsersHeader usersCount={users.length} groupedUsers={groupedUsers} />

        <UserGroupSection
          title="Super Admin"
          users={groupedUsers.superAdmin}
          icon={getRoleIcon('super_admin')}
          currentUserId={profile?.id}
          isLoggingIn={isLoggingIn}
          selectedUserId={selectedUser?.id}
          onLogin={handleLogin}
          loading={loading}
        />

        <UserGroupSection
          title="Admins"
          users={groupedUsers.admins}
          icon={getRoleIcon('admin')}
          currentUserId={profile?.id}
          isLoggingIn={isLoggingIn}
          selectedUserId={selectedUser?.id}
          onLogin={handleLogin}
          loading={loading}
        />

        <UserGroupSection
          title="Lawyers"
          users={groupedUsers.lawyers}
          icon={getRoleIcon('lawyer')}
          currentUserId={profile?.id}
          isLoggingIn={isLoggingIn}
          selectedUserId={selectedUser?.id}
          onLogin={handleLogin}
          loading={loading}
        />

        <UserGroupSection
          title="Real Estate Agents"
          users={groupedUsers.agents}
          icon={getRoleIcon('agent')}
          currentUserId={profile?.id}
          isLoggingIn={isLoggingIn}
          selectedUserId={selectedUser?.id}
          onLogin={handleLogin}
          loading={loading}
        />

        <UserGroupSection
          title="Regular Users"
          users={groupedUsers.users}
          icon={getRoleIcon('user')}
          gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          currentUserId={profile?.id}
          isLoggingIn={isLoggingIn}
          selectedUserId={selectedUser?.id}
          onLogin={handleLogin}
          loading={loading}
        />
      </div>
    </div>
  );
};
