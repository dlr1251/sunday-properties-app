import React from 'react';
import { Dashboard } from '../../features/dashboard';
import { adminConfig } from '../../features/dashboard/config/adminConfig';

export const AdminDashboard = () => {
  return <Dashboard config={adminConfig} />;
};

export default AdminDashboard;
