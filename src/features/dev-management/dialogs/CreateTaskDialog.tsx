import React, { useState } from 'react';
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
import { PRIORITIES, TASK_TYPES } from '../config/taskConfig';
import type { CreateTaskInput, ModuleId, TaskPriority, TaskType } from '../types';

export interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => void;
}

const defaultForm: CreateTaskInput = {
  title: '',
  description: '',
  module: 'properties',
  priority: 'P2',
  type: 'feature',
  tags: [],
  relatedFiles: [],
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateTaskDialogProps) {
  const [form, setForm] = useState<CreateTaskInput>(defaultForm);

  const reset = () => setForm({ ...defaultForm });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        showClose={true}
        onClose={handleClose}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="create-title">Título *</Label>
              <Input
                id="create-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Descripción breve"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-desc">Descripción</Label>
              <textarea
                id="create-desc"
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
                <Label htmlFor="create-module">Módulo</Label>
                <select
                  id="create-module"
                  value={form.module}
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
                <Label htmlFor="create-priority">Prioridad</Label>
                <select
                  id="create-priority"
                  value={form.priority ?? 'P2'}
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
            <div>
              <Label htmlFor="create-type">Tipo</Label>
              <select
                id="create-type"
                value={form.type ?? 'feature'}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.title?.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
