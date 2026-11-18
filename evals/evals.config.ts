import { defineEvalConfig } from 'eve/evals';

/**
 * Live eve evals (`npx eve eval`) need AI Gateway credentials. Vitest in
 * `src/lib/sunny/*.test.ts` covers the same guardrails without a model.
 */
export default defineEvalConfig({
  timeoutMs: 90_000,
});
