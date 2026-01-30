export type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

export function asUserMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message as string;
  }
  return fallback;
}

export function logError(scope: string, error: unknown): void {
  console.error(`[${scope}]`, error);
}


