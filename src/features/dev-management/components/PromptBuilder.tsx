import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, Eye, History } from 'lucide-react';
import { usePromptGenerator } from '../hooks/usePromptGenerator';
import { MODULE_OPTIONS } from '../config/taskConfig';
import { PromptPreviewDialog } from '../dialogs/PromptPreviewDialog';
import type { PromptTemplate } from '../types';
import type { PromptVariableValues } from '../hooks/usePromptGenerator';

export function PromptBuilder() {
  const { templates, getTemplateById, build, generate, history } = usePromptGenerator();
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? '');
  const [values, setValues] = useState<PromptVariableValues>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [copied, setCopied] = useState(false);

  const template = getTemplateById(selectedId) ?? templates[0];

  const updateVar = useCallback((key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
  }, []);

  const getBuiltPrompt = useCallback(() => {
    if (!template) return '';
    return build(template, values);
  }, [template, build, values]);

  const handlePreview = useCallback(() => {
    setPreviewPrompt(getBuiltPrompt());
    setPreviewName(template?.name ?? '');
    setPreviewOpen(true);
  }, [getBuiltPrompt, template?.name]);

  const handleGenerate = useCallback(async () => {
    if (!template) return;
    generate(selectedId, values);
    const text = getBuiltPrompt();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    handlePreview();
  }, [template, selectedId, values, generate, getBuiltPrompt, handlePreview]);

  const handleCopy = useCallback(async () => {
    const text = getBuiltPrompt();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [getBuiltPrompt]);

  const handleTemplateChange = (t: PromptTemplate) => {
    setSelectedId(t.id);
    const next: PromptVariableValues = {};
    t.variables.forEach((k) => {
      next[k] = values[k] ?? (k === 'module' ? 'properties' : '');
    });
    setValues(next);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generar prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Plantilla</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {templates.map((t) => (
                  <Badge
                    key={t.id}
                    variant={selectedId === t.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTemplateChange(t)}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
            {template && (
              <div className="space-y-4">
                {template.variables.map((key) => (
                  <div key={key}>
                    <Label htmlFor={`var-${key}`}>
                      {key === 'module'
                        ? 'Módulo'
                        : key === 'description'
                          ? 'Descripción'
                          : key === 'files'
                            ? 'Archivos (paths, uno por línea)'
                            : key === 'steps'
                              ? 'Pasos para reproducir'
                              : key === 'error'
                                ? 'Error / stack trace'
                                : key === 'currentCode'
                                  ? 'Código actual'
                                  : key === 'target'
                                    ? 'Componente/hook a testear'
                                    : key}
                    </Label>
                    {key === 'files' ||
                    key === 'description' ||
                    key === 'steps' ||
                    key === 'error' ||
                    key === 'currentCode' ? (
                      <textarea
                        id={`var-${key}`}
                        value={values[key] ?? ''}
                        onChange={(e) => updateVar(key, e.target.value)}
                        className="mt-1 flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        placeholder={
                          key === 'module'
                            ? 'e.g. properties'
                            : key === 'files'
                              ? 'src/features/properties/...'
                              : ''
                        }
                        rows={4}
                      />
                    ) : key === 'module' ? (
                      <select
                        id={`var-${key}`}
                        value={values[key] ?? 'properties'}
                        onChange={(e) => updateVar(key, e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {MODULE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={`var-${key}`}
                        value={values[key] ?? ''}
                        onChange={(e) => updateVar(key, e.target.value)}
                        className="mt-1"
                        placeholder={`${key}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
              <Button onClick={handleGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar y copiar
              </Button>
              <Button onClick={handleCopy} variant="secondary">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[320px] overflow-auto">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Genera un prompt para ver el historial.
                </p>
              ) : (
                history.slice(0, 20).map((h, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg border bg-muted/30 text-sm"
                  >
                    <div className="font-medium">{h.templateName}</div>
                    <div className="text-muted-foreground truncate text-xs mt-0.5">
                      {h.prompt.slice(0, 80)}…
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PromptPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        prompt={previewPrompt}
        templateName={previewName}
      />
    </div>
  );
}
