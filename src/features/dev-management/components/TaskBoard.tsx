import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { KANBAN_COLUMNS } from '../config/taskConfig';
import { CreateTaskDialog } from '../dialogs/CreateTaskDialog';
import { EditTaskDialog } from '../dialogs/EditTaskDialog';
import type { DevTask, TaskStatus } from '../types';
import type { CreateTaskInput } from '../hooks/useTaskManagement';

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  review: 'En review',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

function KanbanCard({
  task,
  onEdit,
  onDragStart,
  onDragEnd,
}: {
  task: DevTask;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card
        className="cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <CardHeader className="p-3 pb-1 flex flex-row items-start gap-2">
          <div
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">{task.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="shrink-0 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-xs font-normal">
                {task.module}
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                {task.priority}
              </Badge>
              {task.type !== 'feature' && (
                <Badge variant="outline" className="text-xs font-normal">
                  {task.type}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {task.description && (
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
  isOver,
}: {
  status: TaskStatus;
  tasks: DevTask[];
  onEdit: (task: DevTask) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isOver: boolean;
}) {
  const label = statusLabels[status];

  return (
    <div
      className={`flex flex-col rounded-xl border-2 min-h-[320px] transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="p-3 flex items-center justify-between border-b bg-muted/50 rounded-t-xl">
        <span className="font-medium text-sm">{label}</span>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-auto">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onEdit={() => onEdit(task)}
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

export function TaskBoard() {
  const {
    tasksByKanbanColumn,
    create,
    update,
    updateStatus,
  } = useTaskManagement();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<DevTask | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  const handleCreate = useCallback(
    (input: CreateTaskInput) => {
      create(input);
    },
    [create]
  );

  const handleEditSubmit = useCallback(
    (id: string, data: Parameters<typeof update>[1]) => {
      update(id, data);
    },
    [update]
  );

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(taskId);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedId(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTarget(status);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      setDropTarget(null);
      setDraggedId(null);
      if (id) updateStatus(id, status);
    },
    [updateStatus]
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByKanbanColumn[status] ?? []}
            onEdit={(task) => {
              setEditTask(task);
              setEditOpen(true);
            }}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isOver={dropTarget === status}
          />
        ))}
      </div>

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      <EditTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={editTask}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
