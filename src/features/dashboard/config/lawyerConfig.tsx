import React from 'react';
import { Briefcase, MessageSquare, Shield, Settings } from 'lucide-react';
import { DashboardConfig } from '../types';
import { CaseManager } from '../../../components/lawyer/CaseManager';
import { ChatPanel } from '../../../components/chat/ChatPanel';
import { LawyerApprovalPanel } from '../../../components/dashboards/LawyerApprovalPanel';
import { LawyerVerificationPanel } from '../../../components/dashboards/LawyerVerificationPanel';
import { ProfileSection } from '../../../components/dashboards/ProfileSection';

export const lawyerConfig: DashboardConfig = {
  title: 'Lawyer Dashboard',
  description: 'Manage legal cases, documents, and verifications.',
  badge: { label: 'Lawyer', variant: 'secondary' },
  defaultTab: 'cases',
  tabs: [
    { id: 'cases', label: 'Cases', icon: Briefcase, component: () => <CaseManager /> },
    { id: 'chat', label: 'Chat', icon: MessageSquare, component: () => <ChatPanel /> },
    { id: 'verifications', label: 'Verifications', icon: Shield, component: () => <LawyerVerificationPanel /> },
    { id: 'profile', label: 'Profile', icon: Settings, component: () => <ProfileSection isDarkMode={false} /> },
  ],
};


