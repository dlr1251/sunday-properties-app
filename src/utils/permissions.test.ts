import { describe, it, expect } from 'vitest';
import {
  canPublishProperty,
  canMakeOffer,
  canScheduleVisit,
  canAccessAdminPanel,
  canApproveProperty,
  canReviewVerifications,
  canManageUsers,
  canManageVisits,
  canViewReports,
  canManageNegotiations,
  canViewAuditLogs,
  canManagePlatformSettings,
  getRoleLevel,
  hasElevatedPermissions,
  getPermissionContext
} from './permissions';

describe('Property Publishing Permissions', () => {
  it('allows verified users to publish properties', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canPublishProperty(user)).toBe(true);
  });

  it('denies unverified users from publishing properties', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'unverified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canPublishProperty(user)).toBe(false);
  });

  it('allows verified users to publish regardless of email confirmation', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: null
    };
    expect(canPublishProperty(user)).toBe(true);
  });

  it('denies null users from publishing', () => {
    expect(canPublishProperty(null)).toBe(false);
  });
});

describe('Offer Making Permissions', () => {
  it('allows verified users with email confirmation to make offers', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'verified' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canMakeOffer(user)).toBe(true);
  });

  it('denies users without email confirmation from making offers', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'verified' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: null
    };
    expect(canMakeOffer(user)).toBe(false);
  });

  it('denies unverified users from making offers', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'unverified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canMakeOffer(user)).toBe(false);
  });
});

describe('Visit Scheduling Permissions', () => {
  it('allows users with email confirmation to schedule visits', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'unverified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canScheduleVisit(user)).toBe(true);
  });

  it('denies users without email confirmation from scheduling visits', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'unverified' as const,
      email_confirmed_at: null
    };
    expect(canScheduleVisit(user)).toBe(false);
  });
});

describe('Admin Panel Access', () => {
  it('allows admin users to access admin panel', () => {
    const user = {
      id: '1',
      email: 'admin@test.com',
      role: 'admin' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canAccessAdminPanel(user)).toBe(true);
  });

  it('allows super admin users to access admin panel', () => {
    const user = {
      id: '1',
      email: 'super@test.com',
      role: 'super_admin' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canAccessAdminPanel(user)).toBe(true);
  });

  it('denies regular users from accessing admin panel', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'verified' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canAccessAdminPanel(user)).toBe(false);
  });
});

describe('Property Approval Permissions', () => {
  it('allows only super admin users to approve properties', () => {
    const superAdmin = {
      id: '1',
      email: 'super@test.com',
      role: 'super_admin' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canApproveProperty(superAdmin)).toBe(true);

    const admin = {
      id: '2',
      email: 'admin@test.com',
      role: 'admin' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };
    expect(canApproveProperty(admin)).toBe(false);
  });
});

describe('Role Levels', () => {
  it('returns correct role levels', () => {
    expect(getRoleLevel(null)).toBe(0);
    expect(getRoleLevel({ role: 'visitor' })).toBe(1);
    expect(getRoleLevel({ role: 'registered' })).toBe(2);
    expect(getRoleLevel({ role: 'verified' })).toBe(3);
    expect(getRoleLevel({ role: 'premium' })).toBe(4);
    expect(getRoleLevel({ role: 'lawyer' })).toBe(5);
    expect(getRoleLevel({ role: 'admin' })).toBe(6);
    expect(getRoleLevel({ role: 'super_admin' })).toBe(7);
  });
});

describe('Elevated Permissions', () => {
  it('identifies users with elevated permissions', () => {
    const admin = { role: 'admin' as const };
    const superAdmin = { role: 'super_admin' as const };
    const user = { role: 'verified' as const };

    expect(hasElevatedPermissions(admin)).toBe(true);
    expect(hasElevatedPermissions(superAdmin)).toBe(true);
    expect(hasElevatedPermissions(user)).toBe(false);
    expect(hasElevatedPermissions(null)).toBe(false);
  });
});

describe('Permission Context', () => {
  it('returns complete permission context for verified user', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'verified' as const,
      verification_status: 'verified' as const,
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };

    const context = getPermissionContext(user);

    expect(context.canPublish).toBe(true);
    expect(context.canOffer).toBe(true);
    expect(context.canVisit).toBe(true);
    expect(context.canAdmin).toBe(false);
    expect(context.isVerified).toBe(true);
    expect(context.isEmailConfirmed).toBe(true);
    expect(context.roleLevel).toBe(3);
    expect(context.hasElevatedPermissions).toBe(false);
  });

  it('returns restricted context for unverified user', () => {
    const user = {
      id: '1',
      email: 'user@test.com',
      role: 'registered' as const,
      verification_status: 'unverified' as const,
      email_confirmed_at: null
    };

    const context = getPermissionContext(user);

    expect(context.canPublish).toBe(false);
    expect(context.canOffer).toBe(false);
    expect(context.canVisit).toBe(false);
    expect(context.canAdmin).toBe(false);
    expect(context.isVerified).toBe(false);
    expect(context.isEmailConfirmed).toBe(false);
  });
});
