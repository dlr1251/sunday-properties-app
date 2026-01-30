import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNegotiationPermissions } from '../useNegotiationPermissions';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock AuthContext
const mockAuthContext = {
  user: { id: 'user-123' },
  profile: { id: 'user-123', role: 'user' },
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshProfile: vi.fn()
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => ({ children })
}));

describe('useNegotiationPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading initially', () => {
    const { result } = renderHook(() => useNegotiationPermissions('neg-123'), {
      wrapper: AuthProvider
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.canAccess).toBe(false);
    expect(result.current.canEdit).toBe(false);
  });

  it('should deny access when user is not authenticated', async () => {
    // Mock unauthenticated user
    const unauthMock = { ...mockAuthContext, user: null };
    vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth.mockReturnValue(unauthMock);

    const { result } = renderHook(() => useNegotiationPermissions('neg-123'), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canAccess).toBe(false);
    expect(result.current.canEdit).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    const mockSupabase = vi.mocked(vi.importActual('../../lib/supabase')).supabase;
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        }))
      }))
    } as any);

    const { result } = renderHook(() => useNegotiationPermissions('neg-123'), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canAccess).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.error).toBe('Database connection failed');
  });
});
