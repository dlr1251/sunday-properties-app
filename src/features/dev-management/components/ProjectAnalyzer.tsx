import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Code2,
  Package,
  Type,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTaskManagement } from '../hooks/useTaskManagement';
import { useProjectAnalysis } from '../hooks/useProjectAnalysis';
import { MODULES } from '../config/modulesConfig';

export function ProjectAnalyzer() {
  const { tasks } = useTaskManagement();
  const metrics = useProjectAnalysis(tasks);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Progreso global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.globalProgress}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Type coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.typeCoverageEstimate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tareas totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.totalTasks}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{metrics.completedTasks}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Code health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">TypeScript</span>
                <Badge variant="secondary">{metrics.typeCoverageEstimate}%</Badge>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${metrics.typeCoverageEstimate}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Módulos</span>
                <Badge variant="secondary">{metrics.moduleCount}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Progreso por módulo según docs/project/checklist.md
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugerencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.suggestions.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Sin sugerencias prioritarias.</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {metrics.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progreso por módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MODULES.map((m) => (
              <div key={m.id} className="flex items-center gap-4">
                <span className="w-32 text-sm truncate">{m.name}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-10">{m.progress}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
