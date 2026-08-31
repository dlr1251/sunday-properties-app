import {
  AI_PROMPT_DISCLAIMER_EN,
  AI_PROMPT_DISCLAIMER_ES,
} from '@/constants/ai-disclaimer';

const MARKER = 'INSTRUCCIÓN DE CUMPLIMIENTO';

export function appendAiPromptDisclaimer(
  prompt: string,
  locale: 'es' | 'en' = 'es'
): string {
  if (prompt.includes(MARKER) || prompt.includes('COMPLIANCE INSTRUCTION')) {
    return prompt;
  }
  const block = locale === 'en' ? AI_PROMPT_DISCLAIMER_EN : AI_PROMPT_DISCLAIMER_ES;
  return `${prompt.trim()}\n\n---\n${block}`;
}
