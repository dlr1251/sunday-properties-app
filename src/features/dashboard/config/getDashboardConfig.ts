import { DashboardConfig } from '../types';
import { adminConfig } from './adminConfig';
// Import other configs as we create them
// import { superAdminConfig } from './superAdminConfig';
// import { userConfig } from './userConfig';
// import { lawyerConfig } from './lawyerConfig';

export function getDashboardConfig(role: string): DashboardConfig {
  switch (role) {
    case 'admin':
      return adminConfig;
    // case 'super_admin':
    //   return superAdminConfig;
    // case 'user':
    //   return userConfig;
    // case 'lawyer':
    //   return lawyerConfig;
    default:
      return adminConfig; // Fallback to admin
  }
}

