import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  command: string;
}

const COMMANDS: CommandItem[] = [
  { id: 'build', label: 'Build', description: 'Verificar build de producción', command: 'npm run build' },
  { id: 'dev', label: 'Dev', description: 'Iniciar servidor de desarrollo', command: 'npm run dev' },
  { id: 'tsc', label: 'TypeScript', description: 'Verificar tipos sin emitir', command: 'npx tsc --noEmit' },
  { id: 'test', label: 'Tests', description: 'Ejecutar tests', command: 'npm run test:run' },
  { id: 'supabase-start', label: 'Supabase', description: 'Iniciar Supabase local', command: 'npx supabase start' },
  { id: 'seed-complete', label: 'Seed completo', description: 'Ejecutar seeds completos', command: 'npm run seed:complete' },
  { id: 'seed-auth', label: 'Seed auth', description: 'Seed usuarios de auth', command: 'npm run seed:auth' },
];

interface LinkItem {
  id: string;
  label: string;
  path: string;
}

const QUICK_LINKS: LinkItem[] = [
  { id: 'impl', label: 'Implementation review', path: '/implementation-review' },
  { id: 'schema', label: 'Database schema', path: '/database-schema' },
  { id: 'docs', label: 'Documentación', path: '/docs' },
];

export function AutomationPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCopy = useCallback(async (item: CommandItem) => {
    await navigator.clipboard.writeText(item.command);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Comandos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Copia y ejecuta en tu terminal.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMANDS.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-muted/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                  <code className="text-xs text-foreground/80 mt-1 block truncate">
                    {item.command}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(item)}
                  className="shrink-0"
                >
                  {copiedId === item.id ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copiedId === item.id ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Accesos rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <Button
                key={link.id}
                variant="outline"
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
