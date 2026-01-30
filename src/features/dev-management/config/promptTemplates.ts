import type { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'feature-new',
    name: 'Nueva feature',
    category: 'feature',
    template: `Eres un desarrollador senior en el proyecto Sunday Properties (plataforma inmobiliaria en Medellín). Implementa la siguiente feature.

**Módulo:** {module}
**Descripción:** {description}

**Archivos relevantes del proyecto (revisar antes de implementar):**
{files}

**Requisitos:**
- Mantener la arquitectura existente (features/, hooks/, components/)
- Usar TypeScript estricto y componentes shadcn/ui
- Seguir patrones del módulo (ej. hooks en features/{module}/hooks/)
- Añadir tipos en types/ si aplica

Responde con el plan de implementación y luego el código necesario.`,
    variables: ['module', 'description', 'files'],
  },
  {
    id: 'bug-fix',
    name: 'Bug fix',
    category: 'bugfix',
    template: `Corrige el siguiente bug en Sunday Properties.

**Módulo/área afectada:** {module}
**Descripción del bug:** {description}
**Pasos para reproducir (opcional):** {steps}
**Stack trace o error (si aplica):** {error}

**Archivos probablemente afectados:**
{files}

Indica la causa raíz y aplica el fix mínimo necesario. Mantén tests existentes pasando.`,
    variables: ['module', 'description', 'steps', 'error', 'files'],
  },
  {
    id: 'refactor',
    name: 'Refactor',
    category: 'refactor',
    template: `Refactoriza el siguiente código en Sunday Properties.

**Módulo:** {module}
**Objetivo del refactor:** {description}
**Archivos a modificar:**
{files}

**Código actual o contexto:**
{currentCode}

**Criterios:**
- Mejorar legibilidad y mantenibilidad
- Extraer lógica a hooks/utils cuando tenga sentido
- Conservar comportamiento externo (no breaking changes)
- TypeScript estricto

Proporciona los cambios de forma incremental.`,
    variables: ['module', 'description', 'files', 'currentCode'],
  },
  {
    id: 'test',
    name: 'Escribir tests',
    category: 'test',
    template: `Añade tests para el proyecto Sunday Properties (Vitest + Testing Library).

**Componente/hook/servicio a testear:** {target}
**Archivo actual:** {files}

**Casos de prueba a cubrir:**
{description}

**Stack:** Vitest, @testing-library/react, jsdom.

Escribe tests en \`__tests__\` o \`.test.ts(x)\` siguiendo la estructura del proyecto. Incluye casos felices, edge cases y errores relevantes.`,
    variables: ['target', 'files', 'description'],
  },
  {
    id: 'docs',
    name: 'Documentación',
    category: 'docs',
    template: `Genera documentación para Sunday Properties.

**Módulo/funcionalidad:** {module}
**Alcance:** {description}

**Archivos a documentar:**
{files}

**Formato deseado:** JSDoc en funciones públicas, README del módulo si aplica, y tipos exportados documentados.

Mantén tono técnico y conciso. Incluye ejemplos de uso cuando ayude.`,
    variables: ['module', 'description', 'files'],
  },
];

export function getTemplatesByCategory(
  category: PromptTemplate['category']
): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
}
