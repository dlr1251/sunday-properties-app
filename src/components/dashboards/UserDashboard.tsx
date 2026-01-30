import React from 'react';
import { Dashboard } from '../../features/dashboard';
import { userConfig } from '../../features/dashboard/config/userConfig';

export const UserDashboard: FC = () => {
  return <Dashboard config={userConfig} />;
};