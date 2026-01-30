import React from 'react';
import { Dashboard } from '../../features/dashboard';
import { lawyerConfig } from '../../features/dashboard/config/lawyerConfig';

export const LawyerDashboard: React.FC = () => {
  return <Dashboard config={lawyerConfig} />;
};
