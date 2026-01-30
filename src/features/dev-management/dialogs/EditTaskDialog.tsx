import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { MODULE_OPTIONS } from '../config/taskConfig';
import { PRIORITIES, STATUSES, TASK_TYPES } from '../config/taskConfig';
import type { DevTask, ModuleId, TaskPriority, TaskStatus, TaskType } from '../types';
import type { UpdateTaskInput } from '../hooks/useTaskManagement';

export interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: DevTask | null;
  onSubmit: (id: string, input: UpdateTaskInput) => void;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: EditTaskDialogProps) {
  const [form, setForm] = useState<UpdateTaskInput>({});

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title,
      description: task.description,
      module: task.module,
      priority: task.priority,
      status: task.status,
      type: task.type,
      tags: task.tags,
      relatedFiles: task.relatedFiles,
      dueDate: task.dueDate,
      assignee: task.assignee,
    });
  }, [task]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    const { title, ...rest } = form;
    if (title !== undefined && !title.trim()) return;
    onSubmit(task.id, form);
    handleClose();
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        showClose={true}
        onClose={handleClose}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={form.title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Descripción breve"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Descripción</Label>
              <textarea
                id="edit-desc"
                value={form.description ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Detalles opcionales"
                className="mt-1 flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-module">Módulo</Label>
                <select
                  id="edit-module"
                  value={form.module ?? task.module}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, module: e.target.value as ModuleId }))
                  }
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {MODULE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Prioridad</Label>
                <select
                  id="edit-priority"
                  value={form.priority ?? task.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <select
                  id="edit-status"
                  value={form.status ?? task.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
                <select
                  id="edit-type"
                  value={form.type ?? task.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as TaskType }))
                  }
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!((form.title ?? task.title)?.trim())}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
