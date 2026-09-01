import React from 'react';
import { Dashboard } from '@/features/dashboard';
import { devManagementConfig } from './config/devManagementConfig';

export function DevManagementPanel() {
  return <Dashboard config={devManagementConfig} />;
}
