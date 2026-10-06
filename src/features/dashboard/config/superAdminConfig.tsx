import React from 'react';
import { 
  BarChart3, Shield, Users, Home, FileText, Settings, 
  Handshake, MessageSquare, Eye, Edit, Trash2, 
  Building2, Briefcase, Scale, Crown, Search, 
  Calendar, DollarSign, Archive, Download, Upload
} from 'lucide-react';
import { DashboardConfig } from '../types';
import { VerificationPanel } from '../../verification';
import { UsersPanel } from '../../users';
import { ReportsPanel } from '../../reports/ReportsPanel';
import { ProfileSection } from '../../../components/dashboards/ProfileSection';
import { SuperAdminOverview } from '../components/SuperAdminOverview';
import { SuperAdminUsersManagement } from '../../../components/superadmin/SuperAdminUsersManagement';
import { SuperAdminPropertiesManagement } from '../../../components/superadmin/SuperAdminPropertiesManagement';
import { SuperAdminNegotiationsManagement } from '../../../components/superadmin/SuperAdminNegotiationsManagement';
import { SuperAdminDocumentsManagement } from '../../../components/superadmin/SuperAdminDocumentsManagement';
import { SuperAdminChatsManagement } from '../../../components/superadmin/SuperAdminChatsManagement';
import { SuperAdminVisitsManagement } from '../../../components/superadmin/SuperAdminVisitsManagement';
import { SuperAdminLawyersManagement } from '../../../components/superadmin/SuperAdminLawyersManagement';
import { SuperAdminAdminsManagement } from '../../../components/superadmin/SuperAdminAdminsManagement';

export const superAdminConfig: DashboardConfig = {
  title: 'dashboard.superAdminTitle',
  description: 'dashboard.superAdminDescription',
  badge: { label: 'admin.title', variant: 'destructive' },
  defaultTab: 'overview',
  showTabBar: false,
  tabs: [
    { 
      id: 'overview', 
      label: 'dashboard.overview', 
      icon: BarChart3, 
      component: () => <SuperAdminOverview />
    },
    { 
      id: 'users', 
      label: 'admin.users', 
      icon: Users, 
      component: () => <SuperAdminUsersManagement />
    },
    { 
      id: 'properties', 
      label: 'admin.properties', 
      icon: Home, 
      component: () => <SuperAdminPropertiesManagement />
    },
    { 
      id: 'negotiations', 
      label: 'negotiations.title', 
      icon: Handshake, 
      component: () => <SuperAdminNegotiationsManagement />
    },
    { 
      id: 'documents', 
      label: 'admin.documents', 
      icon: FileText, 
      component: () => <SuperAdminDocumentsManagement />
    },
    { 
      id: 'chats', 
      label: 'admin.chats', 
      icon: MessageSquare, 
      component: () => <SuperAdminChatsManagement />
    },
    { 
      id: 'visits', 
      label: 'visits.title', 
      icon: Calendar, 
      component: () => <SuperAdminVisitsManagement />
    },
    { 
      id: 'lawyers', 
      label: 'admin.lawyers', 
      icon: Scale, 
      component: () => <SuperAdminLawyersManagement />
    },
    { 
      id: 'admins', 
      label: 'admin.admins', 
      icon: Crown, 
      component: () => <SuperAdminAdminsManagement />
    },
    { 
      id: 'verifications', 
      label: 'admin.verifications', 
      icon: Shield, 
      component: () => <VerificationPanel />
    },
    { 
      id: 'reports', 
      label: 'admin.reports', 
      icon: BarChart3, 
      component: () => <ReportsPanel />
    },
    { 
      id: 'profile', 
      label: 'nav.profile', 
      icon: Settings, 
      component: () => <ProfileSection isDarkMode={false} />
    },
  ],
};


