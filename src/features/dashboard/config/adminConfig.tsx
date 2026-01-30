import React from 'react';
import { BarChart3, UserCheck, Users, Shield, Home, TrendingUp } from 'lucide-react';
import { DashboardConfig } from '../types';
import { VerificationPanel } from '../../verification';
import { UsersPanel } from '../../users';
import { ProfileSection } from '../../../components/dashboards/ProfileSection';
import { AdminOverview } from '../components/AdminOverview';
import { PropertiesPanel } from '../../properties';

export const adminConfig: DashboardConfig = {
  title: 'Admin Dashboard',
  description: 'Welcome Admin! Manage users, verifications, and system operations.',
  badge: { label: 'Admin', variant: 'destructive' },
  defaultTab: 'overview',
  stats: [
    {
      id: 'users',
      label: 'Total Users',
      value: 1247,
      icon: Users,
      trend: '+12% from last month',
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Home,
      component: () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Home className="h-5 w-5" />
                Properties Management
              </h2>
              <p className="text-gray-600 text-sm mt-1">Search and manage properties</p>
            </div>
          </div>
          <PropertiesPanel />
        </div>
      ),
    },
    {
      id: 'properties',
      label: 'Properties',
      value: 89,
      icon: Home,
      trend: '+3 new this week',
    },
    {
      id: 'verifications',
      label: 'Pending Verifications',
      value: 12,
      icon: UserCheck,
      trend: 'Requires attention',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: 'COP 1,250,000',
      icon: TrendingUp,
      trend: '+8% from last month',
    },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: () => (
        <AdminOverview
          stats={{
            totalUsers: 1247,
            totalProperties: 89,
            pendingVerifications: 12,
            totalRevenue: 1250000,
          }}
        />
      ),
    },
    {
      id: 'verifications',
      label: 'User Verifications',
      icon: UserCheck,
      component: () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Verification Management
              </h2>
              <p className="text-gray-600 text-sm mt-1">Review and approve verification requests</p>
            </div>
          </div>
          <VerificationPanel />
        </div>
      ),
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      component: () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </h2>
              <p className="text-gray-600 text-sm mt-1">Create, edit, and manage users across different roles</p>
            </div>
          </div>
          <UsersPanel />
        </div>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Shield,
      component: () => <ProfileSection isDarkMode={false} />,
    },
  ],
};
