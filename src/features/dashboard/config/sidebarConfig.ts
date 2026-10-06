import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  Compass,
  FileText,
  Handshake,
  Heart,
  Home,
  KeyRound,
  MessageSquare,
  Scale,
  Shield,
  User,
  Users,
  Crown,
  Briefcase,
  UserCheck,
} from 'lucide-react';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  /** Dashboard tab id. Active when `/dashboard?tab=` matches. */
  tab?: string;
  /** Active when the current pathname starts with this prefix. */
  pathPrefix?: string;
};

export type SidebarSection = {
  id: string;
  label?: string;
  items: SidebarItem[];
};

export type SidebarConfig = {
  defaultTab: string;
  sections: SidebarSection[];
};

const userSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'profile', label: 'nav.profile', icon: User, to: '/dashboard?tab=profile', tab: 'profile' },
      { id: 'explore', label: 'nav.explore', icon: Compass, to: '/dashboard?tab=explore', tab: 'explore' },
      { id: 'favorites', label: 'nav.myFavourites', icon: Heart, to: '/dashboard?tab=favorites', tab: 'favorites' },
      { id: 'visits', label: 'nav.myVisits', icon: Calendar, to: '/dashboard?tab=visits', tab: 'visits' },
      { id: 'rentals', label: 'nav.myRentals', icon: KeyRound, to: '/dashboard?tab=rentals', tab: 'rentals' },
      { id: 'negotiations', label: 'nav.myNegotiations', icon: Handshake, to: '/negotiations', pathPrefix: '/negotiations' },
      { id: 'properties', label: 'nav.myProperties', icon: Home, to: '/dashboard?tab=properties', tab: 'properties' },
    ],
  },
];

const superAdminSections: SidebarSection[] = [
  {
    id: 'overview',
    items: [
      { id: 'overview', label: 'dashboard.overview', icon: BarChart3, to: '/dashboard?tab=overview', tab: 'overview' },
    ],
  },
  {
    id: 'platform',
    label: 'nav.sidebarPlatform',
    items: [
      { id: 'users', label: 'admin.users', icon: Users, to: '/dashboard?tab=users', tab: 'users' },
      { id: 'properties', label: 'admin.properties', icon: Home, to: '/dashboard?tab=properties', tab: 'properties' },
      { id: 'negotiations', label: 'negotiations.title', icon: Handshake, to: '/dashboard?tab=negotiations', tab: 'negotiations' },
      { id: 'documents', label: 'admin.documents', icon: FileText, to: '/dashboard?tab=documents', tab: 'documents' },
      { id: 'chats', label: 'admin.chats', icon: MessageSquare, to: '/dashboard?tab=chats', tab: 'chats' },
      { id: 'visits', label: 'visits.title', icon: Calendar, to: '/dashboard?tab=visits', tab: 'visits' },
    ],
  },
  {
    id: 'people',
    label: 'nav.sidebarPeople',
    items: [
      { id: 'lawyers', label: 'admin.lawyers', icon: Scale, to: '/dashboard?tab=lawyers', tab: 'lawyers' },
      { id: 'admins', label: 'admin.admins', icon: Crown, to: '/dashboard?tab=admins', tab: 'admins' },
    ],
  },
  {
    id: 'operations',
    label: 'nav.sidebarOperations',
    items: [
      { id: 'verifications', label: 'admin.verifications', icon: Shield, to: '/dashboard?tab=verifications', tab: 'verifications' },
      { id: 'reports', label: 'admin.reports', icon: BarChart3, to: '/dashboard?tab=reports', tab: 'reports' },
    ],
  },
  {
    id: 'account',
    items: [
      { id: 'profile', label: 'nav.profile', icon: User, to: '/dashboard?tab=profile', tab: 'profile' },
    ],
  },
];

const adminSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'dashboard.overview', icon: BarChart3, to: '/dashboard?tab=overview', tab: 'overview' },
      { id: 'verifications', label: 'admin.userVerifications', icon: UserCheck, to: '/dashboard?tab=verifications', tab: 'verifications' },
      { id: 'users', label: 'admin.userManagement', icon: Users, to: '/dashboard?tab=users', tab: 'users' },
      { id: 'profile', label: 'nav.profile', icon: Shield, to: '/dashboard?tab=profile', tab: 'profile' },
    ],
  },
];

const lawyerSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'cases', label: 'admin.cases', icon: Briefcase, to: '/dashboard?tab=cases', tab: 'cases' },
      { id: 'chat', label: 'chat.title', icon: MessageSquare, to: '/dashboard?tab=chat', tab: 'chat' },
      { id: 'verifications', label: 'admin.verifications', icon: Shield, to: '/dashboard?tab=verifications', tab: 'verifications' },
      { id: 'profile', label: 'nav.profile', icon: User, to: '/dashboard?tab=profile', tab: 'profile' },
    ],
  },
];

const DEFAULT_TAB_BY_ROLE: Record<string, string> = {
  super_admin: 'overview',
  admin: 'overview',
  lawyer: 'cases',
  user: 'profile',
};

export function getSidebarConfig(role?: string | null): SidebarConfig {
  switch (role) {
    case 'super_admin':
      return { defaultTab: DEFAULT_TAB_BY_ROLE.super_admin, sections: superAdminSections };
    case 'admin':
      return { defaultTab: DEFAULT_TAB_BY_ROLE.admin, sections: adminSections };
    case 'lawyer':
      return { defaultTab: DEFAULT_TAB_BY_ROLE.lawyer, sections: lawyerSections };
    default:
      return { defaultTab: DEFAULT_TAB_BY_ROLE.user, sections: userSections };
  }
}

export function isSidebarItemActive(
  item: SidebarItem,
  pathname: string,
  tab: string | null,
  defaultTab: string,
): boolean {
  if (item.pathPrefix) {
    return pathname.startsWith(item.pathPrefix);
  }
  if (item.tab) {
    if (pathname !== '/dashboard') return false;
    return tab === item.tab || (!tab && item.tab === defaultTab);
  }
  return pathname === item.to;
}
