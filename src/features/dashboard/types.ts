import { LucideIcon, ComponentType } from 'lucide-react';

export type DashboardTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType<any>;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'primary' | 'secondary' | 'gray';
};

export type DashboardConfig = {
  title: string;
  description: string;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  tabs: DashboardTab[];
  defaultTab: string;
  /** When false, tab bar is hidden (navigation only via sidebar/URL). Default true. */
  showTabBar?: boolean;
  /** When true, header shows a personalised welcome message (uses auth profile). */
  showWelcome?: boolean;
  stats?: DashboardStat[];
  overviewComponent?: ComponentType<any>;
};

