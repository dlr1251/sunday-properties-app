import { useState, useCallback } from 'react';
import { PROMPT_TEMPLATES, getTemplateById } from '../config/promptTemplates';
import type { PromptTemplate } from '../types';

export interface PromptVariableValues {
  [key: string]: string;
}

export interface GeneratedPrompt {
  templateId: string;
  templateName: string;
  prompt: string;
  variableValues: PromptVariableValues;
  generatedAt: string;
}

const HISTORY_KEY = 'sunday_dev_prompt_history';
const MAX_HISTORY = 50;

function loadHistory(): GeneratedPrompt[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GeneratedPrompt[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: GeneratedPrompt[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function applyTemplate(template: string, values: PromptVariableValues): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export function usePromptGenerator() {
  const [history, setHistory] = useState<GeneratedPrompt[]>(loadHistory);

  const build = useCallback(
    (template: PromptTemplate, variableValues: PromptVariableValues): string => {
      return applyTemplate(template.template, variableValues);
    },
    []
  );

  const generate = useCallback(
    (templateId: string, variableValues: PromptVariableValues): GeneratedPrompt | null => {
      const template = getTemplateById(templateId);
      if (!template) return null;
      const prompt = build(template, variableValues);
      const generated: GeneratedPrompt = {
        templateId,
        templateName: template.name,
        prompt,
        variableValues: { ...variableValues },
        generatedAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const next = [generated, ...prev];
        saveHistory(next);
        return next;
      });
      return generated;
    },
    [build]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    templates: PROMPT_TEMPLATES,
    getTemplateById,
    build,
    generate,
    history,
    clearHistory,
  };
}
