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
  title: 'Super Admin Dashboard',
  description: 'Control total del sistema: gestión completa de usuarios, propiedades, negociaciones, documentos y más.',
  badge: { label: 'Super Admin', variant: 'destructive' },
  defaultTab: 'overview',
  tabs: [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3, 
      component: () => <SuperAdminOverview />
    },
    { 
      id: 'users', 
      label: 'Usuarios', 
      icon: Users, 
      component: () => <SuperAdminUsersManagement />
    },
    { 
      id: 'properties', 
      label: 'Propiedades', 
      icon: Home, 
      component: () => <SuperAdminPropertiesManagement />
    },
    { 
      id: 'negotiations', 
      label: 'Negociaciones', 
      icon: Handshake, 
      component: () => <SuperAdminNegotiationsManagement />
    },
    { 
      id: 'documents', 
      label: 'Documentos', 
      icon: FileText, 
      component: () => <SuperAdminDocumentsManagement />
    },
    { 
      id: 'chats', 
      label: 'Chats', 
      icon: MessageSquare, 
      component: () => <SuperAdminChatsManagement />
    },
    { 
      id: 'visits', 
      label: 'Visitas', 
      icon: Calendar, 
      component: () => <SuperAdminVisitsManagement />
    },
    { 
      id: 'lawyers', 
      label: 'Abogados', 
      icon: Scale, 
      component: () => <SuperAdminLawyersManagement />
    },
    { 
      id: 'admins', 
      label: 'Admins', 
      icon: Crown, 
      component: () => <SuperAdminAdminsManagement />
    },
    { 
      id: 'verifications', 
      label: 'Verificaciones', 
      icon: Shield, 
      component: () => <VerificationPanel />
    },
    { 
      id: 'reports', 
      label: 'Reportes', 
      icon: BarChart3, 
      component: () => <ReportsPanel />
    },
    { 
      id: 'profile', 
      label: 'Perfil', 
      icon: Settings, 
      component: () => <ProfileSection isDarkMode={false} />
    },
  ],
};


