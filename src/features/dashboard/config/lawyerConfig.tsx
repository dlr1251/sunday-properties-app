import React from 'react';
import { Briefcase, MessageSquare, Shield, Settings } from 'lucide-react';
import { DashboardConfig } from '../types';
import { CaseManager } from '../../../components/lawyer/CaseManager';
import { ChatPanel } from '../../../components/chat/ChatPanel';
import { LawyerApprovalPanel } from '../../../components/dashboards/LawyerApprovalPanel';
import { LawyerVerificationPanel } from '../../../components/dashboards/LawyerVerificationPanel';
import { ProfileSection } from '../../../components/dashboards/ProfileSection';

export const lawyerConfig: DashboardConfig = {
  title: 'dashboard.lawyerTitle',
  description: 'dashboard.lawyerDescription',
  badge: { label: 'admin.lawyers', variant: 'secondary' },
  defaultTab: 'cases',
  showTabBar: false,
  tabs: [
    { id: 'cases', label: 'admin.cases', icon: Briefcase, component: () => <CaseManager /> },
    { id: 'chat', label: 'chat.title', icon: MessageSquare, component: () => <ChatPanel /> },
    { id: 'verifications', label: 'admin.verifications', icon: Shield, component: () => <LawyerVerificationPanel /> },
    { id: 'profile', label: 'nav.profile', icon: Settings, component: () => <ProfileSection isDarkMode={false} /> },
  ],
};


