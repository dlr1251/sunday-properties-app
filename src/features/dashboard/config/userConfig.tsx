import React from 'react';
import { BarChart3, Home, Calendar, Heart, User, Briefcase, Compass, KeyRound } from 'lucide-react';
import { DashboardConfig } from '../types';
import { UserProfileTab } from '../components/UserProfileTab';
import { UserPropertiesView } from '../../../components/properties/UserPropertiesView';
import { ExploreTabContent } from '../components/ExploreTabContent';
import { FavoritesView } from '../../../components/properties/FavoritesView';
import { UserOverview } from '../components/UserOverview';
import { UserVisitsView } from '../../../components/visits/UserVisitsView';
import { UserBusinessTab } from '../components/UserBusinessTab';
import { MyRentalsTab } from '../components/MyRentalsTab';

export const userConfig: DashboardConfig = {
  title: 'dashboard.userTitle',
  description: 'dashboard.userDescription',
  defaultTab: 'profile',
  showTabBar: false,
  showWelcome: true,
  tabs: [
    { id: 'profile', label: 'nav.profile', icon: User, component: () => <UserProfileTab /> },
    { id: 'explore', label: 'nav.explore', icon: Compass, component: () => <ExploreTabContent /> },
    { id: 'overview', label: 'dashboard.overview', icon: BarChart3, component: () => <UserOverview /> },
    { id: 'properties', label: 'nav.myProperties', icon: Home, component: () => <UserPropertiesView /> },
    { id: 'business', label: 'nav.business', icon: Briefcase, component: () => <UserBusinessTab /> },
    { id: 'favorites', label: 'nav.favourites', icon: Heart, component: () => <FavoritesView /> },
    { id: 'visits', label: 'nav.visits', icon: Calendar, component: () => <UserVisitsView /> },
    { id: 'rentals', label: 'nav.myRentals', icon: KeyRound, component: () => <MyRentalsTab /> },
  ],
};


