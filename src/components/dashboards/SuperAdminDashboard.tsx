import React from 'react';
import { Dashboard } from '../../features/dashboard';
import { superAdminConfig } from '../../features/dashboard/config/superAdminConfig';

export const SuperAdminDashboard: React.FC = () => {
  return <Dashboard config={superAdminConfig} />;
};
