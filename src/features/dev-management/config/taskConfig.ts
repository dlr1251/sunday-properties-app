import type { TaskPriority, TaskStatus, TaskType, ModuleId } from '../types';
import { MODULE_IDS } from './modulesConfig';

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'P0', label: 'Crítico' },
  { value: 'P1', label: 'Alto' },
  { value: 'P2', label: 'Medio' },
  { value: 'P3', label: 'Bajo' },
];

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'review', label: 'En review' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'test', label: 'Test' },
  { value: 'docs', label: 'Docs' },
  { value: 'devops', label: 'DevOps' },
];

export const KANBAN_COLUMNS: TaskStatus[] = [
  'pending',
  'in_progress',
  'review',
  'completed',
];

export const MODULE_OPTIONS = MODULE_IDS.map((id) => ({
  value: id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
}));
