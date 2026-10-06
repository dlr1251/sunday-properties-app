import React from 'react';
import {
  LayoutGrid,
  KanbanSquare,
  Sparkles,
  LineChart,
  Terminal,
  Layers,
  ListTodo,
  TrendingUp,
  Bug,
} from 'lucide-react';
import { DashboardConfig } from '@/features/dashboard/types';
import { ModulesOverview } from '../components/ModulesOverview';
import { TaskBoard } from '../components/TaskBoard';
import { PromptBuilder } from '../components/PromptBuilder';
import { ProjectAnalyzer } from '../components/ProjectAnalyzer';
import { AutomationPanel } from '../components/AutomationPanel';

export const devManagementConfig: DashboardConfig = {
  title: 'Dev Management',
  description: 'Gestión del desarrollo del proyecto Sunday Properties',
  badge: { label: 'Dev', variant: 'secondary' },
  defaultTab: 'overview',
  stats: [
    { id: 'modules', label: 'Módulos', value: 10, icon: Layers },
    { id: 'tasks', label: 'Tareas pendientes', value: 0, icon: ListTodo },
    { id: 'progress', label: 'Progreso global', value: '78%', icon: TrendingUp },
    { id: 'bugs', label: 'Bugs activos', value: 0, icon: Bug },
  ],
  tabs: [
    {
      id: 'overview',
      label: 'Módulos',
      icon: LayoutGrid,
      component: () => <ModulesOverview />,
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: KanbanSquare,
      component: () => <TaskBoard />,
    },
    {
      id: 'prompts',
      label: 'Prompts IA',
      icon: Sparkles,
      component: () => <PromptBuilder />,
    },
    {
      id: 'analysis',
      label: 'Análisis',
      icon: LineChart,
      component: () => <ProjectAnalyzer />,
    },
    {
      id: 'automation',
      label: 'Scripts',
      icon: Terminal,
      component: () => <AutomationPanel />,
    },
  ],
};
