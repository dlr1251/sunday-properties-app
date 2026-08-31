import React from 'react';
import { BarChart3, UserCheck, Users, Shield, Home, TrendingUp } from 'lucide-react';
import { DashboardConfig } from '../types';
import { VerificationPanel } from '../../verification';
import { UsersPanel } from '../../users';
import { ProfileSection } from '../../../components/dashboards/ProfileSection';
import { AdminOverview } from '../components/AdminOverview';

export const adminConfig: DashboardConfig = {
  title: 'dashboard.adminTitle',
  description: 'dashboard.adminDescription',
  badge: { label: 'admin.title', variant: 'destructive' },
  defaultTab: 'overview',
  showTabBar: false,
  stats: [
    {
      id: 'users',
      label: 'admin.totalUsers',
      value: 1247,
      icon: Users,
      trend: 'admin.trendUsers',
    },
    {
      id: 'properties',
      label: 'admin.properties',
      value: 89,
      icon: Home,
      trend: 'admin.trendProperties',
    },
    {
      id: 'verifications',
      label: 'admin.pendingVerifications',
      value: 12,
      icon: UserCheck,
      trend: 'admin.requiresAttention',
    },
    {
      id: 'revenue',
      label: 'admin.revenue',
      value: 'COP 1,250,000',
      icon: TrendingUp,
      trend: 'admin.trendRevenue',
    },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'dashboard.overview',
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
      label: 'admin.userVerifications',
      icon: UserCheck,
      component: () => <VerificationPanel />,
    },
    {
      id: 'users',
      label: 'admin.userManagement',
      icon: Users,
      component: () => <UsersPanel />,
    },
    {
      id: 'profile',
      label: 'nav.profile',
      icon: Shield,
      component: () => <ProfileSection isDarkMode={false} />,
    },
  ],
};
