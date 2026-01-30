import type { ProjectModule, ModuleId } from '../types';

export const MODULE_IDS: ModuleId[] = [
  'authentication',
  'properties',
  'negotiations',
  'visits',
  'legal',
  'admin',
  'users',
  'notifications',
  'testing',
  'devops',
];

export const MODULES: ProjectModule[] = [
  {
    id: 'authentication',
    name: 'Authentication',
    description: 'Login, OAuth, verificación, roles',
    progress: 95,
    color: 'emerald',
  },
  {
    id: 'properties',
    name: 'Properties',
    description: 'Wizard, discovery, verificación',
    progress: 90,
    color: 'blue',
  },
  {
    id: 'negotiations',
    name: 'Negotiations',
    description: 'Ofertas, contraofertas, NPV, condiciones',
    progress: 95,
    color: 'violet',
  },
  {
    id: 'visits',
    name: 'Visits',
    description: 'Scheduling, pagos, feedback',
    progress: 80,
    color: 'amber',
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Casos, documentos, chat',
    progress: 85,
    color: 'rose',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Dashboard, usuarios, configuración',
    progress: 85,
    color: 'red',
  },
  {
    id: 'users',
    name: 'Users',
    description: 'Verificación, perfiles, roles',
    progress: 90,
    color: 'cyan',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Sistema de alertas',
    progress: 70,
    color: 'orange',
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Unit, E2E, security',
    progress: 30,
    color: 'lime',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, monitoring, performance',
    progress: 40,
    color: 'slate',
  },
];

export function getModuleById(id: ModuleId): ProjectModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getGlobalProgress(modules: ProjectModule[]): number {
  if (modules.length === 0) return 0;
  const sum = modules.reduce((acc, m) => acc + m.progress, 0);
  return Math.round(sum / modules.length);
}
