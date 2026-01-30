import { useState, useCallback, useEffect } from 'react';
import type { DevTask, ModuleId, TaskPriority, TaskStatus, TaskType } from '../types';
import { KANBAN_COLUMNS } from '../config/taskConfig';

const STORAGE_KEY = 'sunday_dev_tasks';

function loadTasks(): DevTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DevTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: DevTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  module: ModuleId;
  priority?: TaskPriority;
  type?: TaskType;
  tags?: string[];
  relatedFiles?: string[];
  dueDate?: string;
  assignee?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  module?: ModuleId;
  priority?: TaskPriority;
  status?: TaskStatus;
  type?: TaskType;
  tags?: string[];
  relatedFiles?: string[];
  dueDate?: string;
  assignee?: string;
}

export function useTaskManagement() {
  const [tasks, setTasks] = useState<DevTask[]>(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const create = useCallback((input: CreateTaskInput): DevTask => {
    const now = new Date().toISOString();
    const task: DevTask = {
      id: generateId(),
      title: input.title,
      description: input.description ?? '',
      module: input.module,
      priority: input.priority ?? 'P2',
      status: 'pending',
      type: input.type ?? 'feature',
      tags: input.tags ?? [],
      relatedFiles: input.relatedFiles ?? [],
      createdAt: now,
      updatedAt: now,
      dueDate: input.dueDate,
      assignee: input.assignee,
    };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const update = useCallback((id: string, input: UpdateTaskInput): DevTask | null => {
    let updated: DevTask | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        updated = {
          ...t,
          ...input,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      })
    );
    return updated ?? null;
  }, []);

  const updateStatus = useCallback((id: string, status: TaskStatus): DevTask | null => {
    return update(id, { status });
  }, [update]);

  const remove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getById = useCallback(
    (id: string): DevTask | undefined => tasks.find((t) => t.id === id),
    [tasks]
  );

  const getByModule = useCallback(
    (module: ModuleId): DevTask[] => tasks.filter((t) => t.module === module),
    [tasks]
  );

  const getByStatus = useCallback(
    (status: TaskStatus): DevTask[] => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const tasksByKanbanColumn = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, DevTask[]>
  );

  const pendingCount = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;
  const bugCount = tasks.filter((t) => t.type === 'bug' && t.status !== 'completed' && t.status !== 'cancelled').length;

  return {
    tasks,
    create,
    update,
    updateStatus,
    remove,
    getById,
    getByModule,
    getByStatus,
    tasksByKanbanColumn,
    pendingCount,
    bugCount,
  };
}
