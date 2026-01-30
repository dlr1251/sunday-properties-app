// Permission and Authorization Utilities
// Centralized permission checking for different user actions

import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'visitor' | 'registered' | 'verified' | 'premium' | 'lawyer' | 'admin' | 'super_admin';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  email_confirmed_at?: string;
}

/**
 * Check if user can publish properties
 * Requires: verified status
 */
export function canPublishProperty(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.verification_status === 'verified';
}

/**
 * Check if user can make offers on properties
 * Requires: verified status AND email confirmed
 */
export function canMakeOffer(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.verification_status === 'verified' && !!user.email_confirmed_at;
}

/**
 * Check if user can schedule visits
 * Requires: email confirmed (basic requirement)
 */
export function canScheduleVisit(user: UserProfile | null): boolean {
  if (!user) return false;
  return !!user.email_confirmed_at;
}

/**
 * Check if user can access admin panel
 * Requires: admin or super_admin role
 */
export function canAccessAdminPanel(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can approve properties
 * Requires: admin or super_admin role (both can approve properties)
 */
export function canApproveProperty(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can review verifications
 * Requires: admin or super_admin role
 */
export function canReviewVerifications(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can manage users
 * Requires: admin or super_admin role
 */
export function canManageUsers(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can manage visits
 * Requires: admin or super_admin role
 */
export function canManageVisits(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can view reports
 * Requires: admin or super_admin role
 */
export function canViewReports(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can manage negotiations
 * Requires: admin or super_admin role
 */
export function canManageNegotiations(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can access audit logs
 * Requires: admin or super_admin role
 */
export function canViewAuditLogs(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Check if user can manage platform settings
 * Requires: super_admin role only
 */
export function canManagePlatformSettings(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * Get user role hierarchy level (for UI display)
 */
export function getRoleLevel(user: UserProfile | null): number {
  if (!user) return 0;

  const levels: Record<string, number> = {
    visitor: 1,
    registered: 2,
    verified: 3,
    premium: 4,
    lawyer: 5,
    admin: 6,
    super_admin: 7
  };

  return levels[user.role] || 0;
}

/**
 * Check if user has elevated permissions (admin or higher)
 */
export function hasElevatedPermissions(user: UserProfile | null): boolean {
  if (!user) return false;
  return ['admin', 'super_admin'].includes(user.role);
}

/**
 * Get permission context for UI rendering
 */
export function getPermissionContext(user: UserProfile | null) {
  return {
    canPublish: canPublishProperty(user),
    canOffer: canMakeOffer(user),
    canVisit: canScheduleVisit(user),
    canAdmin: canAccessAdminPanel(user),
    canApprove: canApproveProperty(user),
    canReview: canReviewVerifications(user),
    canManageUsers: canManageUsers(user),
    canManageVisits: canManageVisits(user),
    canViewReports: canViewReports(user),
    canManageNegotiations: canManageNegotiations(user),
    canViewAudit: canViewAuditLogs(user),
    canManageSettings: canManagePlatformSettings(user),
    roleLevel: getRoleLevel(user),
    hasElevatedPermissions: hasElevatedPermissions(user),
    isVerified: user?.verification_status === 'verified',
    isEmailConfirmed: !!user?.email_confirmed_at
  };
}

/**
 * Get restriction message for blocked actions
 */
export function getRestrictionMessage(action: string, user: UserProfile | null): string {
  if (!user) {
    return 'Debes iniciar sesión para realizar esta acción.';
  }

  switch (action) {
    case 'publish':
      if (!user.email_confirmed_at) {
        return 'Debes confirmar tu email antes de publicar propiedades.';
      }
      if (user.verification_status !== 'verified') {
        return 'Debes completar la verificación de identidad antes de publicar propiedades.';
      }
      break;

    case 'offer':
      if (!user.email_confirmed_at) {
        return 'Debes confirmar tu email antes de hacer ofertas.';
      }
      if (user.verification_status !== 'verified') {
        return 'Debes completar la verificación de identidad antes de hacer ofertas.';
      }
      break;

    case 'visit':
      if (!user.email_confirmed_at) {
        return 'Debes confirmar tu email antes de agendar visitas.';
      }
      break;

    case 'admin':
      return 'No tienes permisos de administrador.';

    default:
      return 'No tienes permisos para realizar esta acción.';
  }

  return 'No tienes permisos para realizar esta acción.';
}

// Export types
export type { UserProfile };