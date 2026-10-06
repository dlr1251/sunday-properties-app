import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardConfig } from './types';

export type UserSummaryStats = {
  propertiesInOffer: number;
  visitsReceived: number;
  offersReceived: number;
  offersSent: number;
  visitsCompleted: number;
};

export type DashboardProps = {
  config: DashboardConfig;
  className?: string;
};

// Animation variants for staggered stat cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

function getWeekdayCapitalized(locale: string): string {
  const name = new Date().toLocaleDateString(locale, { weekday: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const initialSummary: UserSummaryStats = {
  propertiesInOffer: 0,
  visitsReceived: 0,
  offersReceived: 0,
  offersSent: 0,
  visitsCompleted: 0,
};

export function Dashboard({ config, className }: DashboardProps) {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTab = config.tabs.find(tab => tab.id === tabParam) ? tabParam : config.defaultTab;
  const [activeTab, setActiveTab] = useState(validTab);
  const [summaryStats, setSummaryStats] = useState<UserSummaryStats>(initialSummary);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || t('dashboard.welcome');
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const dayName = getWeekdayCapitalized(i18n.language || 'en');

  useEffect(() => {
    const nextTab = config.tabs.find(tab => tab.id === tabParam) ? tabParam : config.defaultTab;
    setActiveTab(nextTab);
  }, [tabParam, config.tabs, config.defaultTab]);

  useEffect(() => {
    if (!config.showWelcome || !user?.id) return;
    let cancelled = false;
    setSummaryLoading(true);
    (async () => {
      try {
        const { data: myProperties, error: propErr } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id);
        if (propErr) throw propErr;
        const propertyIds = (myProperties || []).map((p: { id: string }) => p.id);

        const [visitsReceivedRes, offersSentRes, visitsCompletedRes, offersReceivedRes] = await Promise.all([
          propertyIds.length
            ? supabase.from('visits').select('id', { count: 'exact', head: true }).in('property_id', propertyIds)
            : Promise.resolve({ count: 0 }),
          supabase.from('offers').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id),
          supabase
            .from('visits')
            .select('id', { count: 'exact', head: true })
            .eq('visitor_id', user.id)
            .eq('status', 'completed'),
          propertyIds.length
            ? supabase.from('offers').select('id', { count: 'exact', head: true }).in('property_id', propertyIds)
            : Promise.resolve({ count: 0 }),
        ]);

        const propertiesInOffer = propertyIds.length;
        const visitsReceived =
          'count' in visitsReceivedRes && typeof visitsReceivedRes.count === 'number' ? visitsReceivedRes.count : 0;
        const offersSent =
          'count' in offersSentRes && typeof offersSentRes.count === 'number' ? offersSentRes.count : 0;
        const visitsCompleted =
          'count' in visitsCompletedRes && typeof visitsCompletedRes.count === 'number'
            ? visitsCompletedRes.count
            : 0;
        const offersReceived =
          'count' in offersReceivedRes && typeof offersReceivedRes.count === 'number'
            ? offersReceivedRes.count
            : 0;

        if (!cancelled) {
          setSummaryStats({
            propertiesInOffer,
            visitsReceived,
            offersReceived,
            offersSent,
            visitsCompleted,
          });
        }
      } catch (e) {
        console.error('Dashboard summary stats:', e);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config.showWelcome, user?.id]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[31px] pb-16 mt-0 h-[648px] ${className ?? ''}`}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header: welcome (user) or standard title */}
        {config.showWelcome ? (
          <motion.header
            className="pb-6 sm:pb-8 border-b border-border/40"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {t('dashboard.welcomeGreeting', { day: dayName, name: firstName })}
            </h1>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              {t('dashboard.subtitle')}
            </p>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground flex flex-wrap gap-x-1 gap-y-1 items-baseline">
              {summaryLoading ? (
                <span>{t('dashboard.loading')}</span>
              ) : (
                [
                  t('dashboard.summary.propertiesInOffer', { count: summaryStats.propertiesInOffer }),
                  t('dashboard.summary.visitsReceived', { count: summaryStats.visitsReceived }),
                  `${t('dashboard.summary.offersReceived', { count: summaryStats.offersReceived })} / ${t('dashboard.summary.offersSent', { count: summaryStats.offersSent })}`,
                  t('dashboard.summary.visitsCompleted', { count: summaryStats.visitsCompleted }),
                ].join(' · ')
              )}
            </p>
          </motion.header>
        ) : (
          <motion.div
            className="bg-card rounded-xl border border-border/50 p-5 sm:p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {t(config.title)}
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">{t(config.description)}</p>
              </div>
              {config.badge && (
                <Badge variant={config.badge.variant} className="w-fit shrink-0">
                  {t(config.badge.label)}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 sm:space-y-8">
          {config.showTabBar !== false && (
            <TabsList 
              className="w-full h-auto p-1 flex flex-wrap gap-1"
            >
              {config.tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="flex-1 min-w-[100px] h-10 gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t(tab.label)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          )}

          {config.tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-5 sm:space-y-6 mt-6 sm:mt-8">
                {/* Stats Grid for default tab */}
                {tab.id === config.defaultTab && config.stats && (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {config.stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div key={stat.id} variants={itemVariants}>
                          <Card className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t(stat.label)}
                              </CardTitle>
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-foreground">
                                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                              </div>
                              {stat.trend && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t(stat.trend)}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
                <TabComponent />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;

