import { useMemo } from 'react';
import { MODULES, getGlobalProgress } from '../config/modulesConfig';
import type { DevTask } from '../types';

export interface AnalysisMetrics {
  globalProgress: number;
  moduleCount: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  bugCount: number;
  typeCoverageEstimate: number;
  suggestions: string[];
}

export function useProjectAnalysis(tasks: DevTask[]): AnalysisMetrics {
  return useMemo(() => {
    const globalProgress = getGlobalProgress(MODULES);
    const pendingTasks = tasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled'
    ).length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const bugCount = tasks.filter(
      (t) => t.type === 'bug' && t.status !== 'completed' && t.status !== 'cancelled'
    ).length;

    const suggestions: string[] = [];
    const testingProgress = MODULES.find((m) => m.id === 'testing')?.progress ?? 0;
    if (testingProgress < 50) {
      suggestions.push('Aumentar cobertura de tests: el módulo Testing está por debajo del 50%.');
    }
    if (bugCount > 0) {
      suggestions.push(`${bugCount} bug(s) activo(s). Priorizar resolución antes de nuevas features.`);
    }
    if ((MODULES.find((m) => m.id === 'devops')?.progress ?? 0) < 50) {
      suggestions.push('Reforzar DevOps: CI/CD y monitoring para preparar despliegue.');
    }
    if (pendingTasks > 20) {
      suggestions.push('Muchas tareas pendientes. Considera revisar prioridades o desglosar tareas.');
    }

    return {
      globalProgress,
      moduleCount: MODULES.length,
      totalTasks: tasks.length,
      pendingTasks,
      completedTasks,
      bugCount,
      typeCoverageEstimate: 85,
      suggestions,
    };
  }, [tasks]);
}
