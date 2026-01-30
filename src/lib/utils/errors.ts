// Base error class for all application errors
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

// Database-related errors
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

// Authentication/authorization errors
export class AuthError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

// Resource not found errors
export class NotFoundError extends AppError {
  public readonly resource: string;
  public readonly id?: string;

  constructor(resource: string, id?: string) {
    super(`${resource} not found${id ? ` with id: ${id}` : ''}`, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

// Business logic errors
export class BusinessError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'BUSINESS_ERROR', details);
    this.name = 'BusinessError';
  }
}

// Network/API errors
export class NetworkError extends AppError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, 'NETWORK_ERROR', { statusCode, ...details });
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

// Error factory functions
export const createDatabaseError = (message: string, details?: unknown) =>
  new DatabaseError(message, details);

export const createValidationError = (message: string, field?: string, value?: unknown) =>
  new ValidationError(message, field, value);

export const createAuthError = (message: string, details?: unknown) =>
  new AuthError(message, details);

export const createNotFoundError = (resource: string, id?: string) =>
  new NotFoundError(resource, id);

export const createBusinessError = (message: string, details?: unknown) =>
  new BusinessError(message, details);

export const createNetworkError = (message: string, statusCode?: number, details?: unknown) =>
  new NetworkError(message, statusCode, details);

// Error type guard
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Error to user-friendly message converter
export function toUserMessage(error: unknown): string {
  if (isAppError(error)) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      case 'NOT_FOUND':
        return 'El recurso solicitado no fue encontrado';
      case 'AUTH_ERROR':
        return 'No tienes permisos para realizar esta acción';
      case 'DATABASE_ERROR':
        return 'Error interno del servidor. Inténtalo de nuevo más tarde';
      case 'NETWORK_ERROR':
        return 'Error de conexión. Verifica tu internet e inténtalo de nuevo';
      case 'BUSINESS_ERROR':
        return error.message;
      default:
        return 'Ha ocurrido un error inesperado';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
}
