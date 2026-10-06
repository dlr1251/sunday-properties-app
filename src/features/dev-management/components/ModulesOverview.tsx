import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MODULES } from '../config/modulesConfig';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { useProjectAnalysis } from '../hooks/useProjectAnalysis';
import type { ModuleId } from '../types';

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  lime: 'bg-lime-500',
  slate: 'bg-slate-500',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ModulesOverview() {
  const { tasks, getByModule, pendingCount, bugCount } = useTaskManagement();
  const metrics = useProjectAnalysis(tasks);

  const moduleStats = useMemo(() => {
    return MODULES.map((m) => {
      const moduleTasks = getByModule(m.id as ModuleId);
      const pending = moduleTasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'cancelled'
      ).length;
      const completed = moduleTasks.filter((t) => t.status === 'completed').length;
      return { module: m, pending, completed, total: moduleTasks.length };
    });
  }, [getByModule, tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.moduleCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pendingCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progreso global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.globalProgress}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugs activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{bugCount}</span>
          </CardContent>
        </Card>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {moduleStats.map(({ module: m, pending, total }) => {
          const barColor = colorMap[m.color ?? 'slate'] ?? 'bg-slate-500';
          return (
            <motion.div key={m.id} variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    {pending > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {pending} pend.
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{m.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
