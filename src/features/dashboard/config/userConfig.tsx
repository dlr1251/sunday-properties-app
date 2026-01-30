import React from 'react';
import { BarChart3, Home, Calendar, Settings, Heart, User, Briefcase } from 'lucide-react';
import { DashboardConfig } from '../types';
import { UserProfileTab } from '../components/UserProfileTab';
import { PropertyVerificationStatus } from '../../../components/properties/PropertyVerificationStatus';
import { UserPropertiesView } from '../../../components/properties/UserPropertiesView';
import { FavoritesView } from '../../../components/properties/FavoritesView';
import { UserOverview } from '../components/UserOverview';
import { UserVisitsView } from '../../../components/visits/UserVisitsView';
import { UserBusinessTab } from '../components/UserBusinessTab';

export const userConfig: DashboardConfig = {
  title: 'User Dashboard',
  description: 'Manage your properties, visits and profile.',
  badge: { label: 'User', variant: 'secondary' },
  defaultTab: 'profile',
  tabs: [
    { id: 'profile', label: 'Perfil', icon: User, component: () => <UserProfileTab /> },
    { id: 'overview', label: 'Overview', icon: BarChart3, component: () => <UserOverview /> },
    { id: 'properties', label: 'Properties', icon: Home, component: () => <UserPropertiesView /> },
    { id: 'business', label: 'Mis Negocios', icon: Briefcase, component: () => <UserBusinessTab /> },
    { id: 'favorites', label: 'Favorites', icon: Heart, component: () => <FavoritesView /> },
    { id: 'visits', label: 'Visits', icon: Calendar, component: () => <UserVisitsView /> },
  ],
};


