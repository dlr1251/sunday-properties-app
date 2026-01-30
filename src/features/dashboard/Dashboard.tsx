import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DashboardConfig } from './types';

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

export function Dashboard({ config, className }: DashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTab = config.tabs.find(t => t.id === tabParam) ? tabParam : config.defaultTab;
  const [activeTab, setActiveTab] = useState(validTab);
  
  useEffect(() => {
    if (tabParam && config.tabs.find(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, config.tabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 ${className ?? ''}`}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          className="bg-card rounded-2xl border border-border/50 shadow-soft p-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {config.title}
              </h1>
              <p className="text-muted-foreground mt-1">{config.description}</p>
            </div>
            {config.badge && (
              <Badge variant={config.badge.variant} className="w-fit">
                {config.badge.label}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {config.tabs.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
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
                                {stat.label}
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
                                  {stat.trend}
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

