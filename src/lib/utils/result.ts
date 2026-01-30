// Result type for handling success/error states
export type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

// Helper functions for creating Result instances
export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Type guards
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok === true;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

// Unwrapping functions
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.data;
  }
  throw new Error(`Attempted to unwrap error: ${result.error}`);
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isOk(result)) {
    return result.data;
  }
  return defaultValue;
}

export function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T {
  if (isOk(result)) {
    return result.data;
  }
  return fn(result.error);
}

// Mapping functions
export function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.data));
  }
  return result;
}

export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error));
  }
  return result;
}

// Chaining functions
export function andThen<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
  if (isOk(result)) {
    return fn(result.data);
  }
  return result;
}

// Utility for converting Promise rejections to Result
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T, string>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error.message : String(error));
  }
}
