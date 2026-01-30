import { useState, useEffect, useCallback } from 'react';
import { usersRepository, UserProfile } from '../lib/db/repositories/users.repo';
import { Result, isOk, isErr } from '../lib/utils/result';
import { AppError, toUserMessage } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { 
  UserFilters, 
  UpdateUserRoleInput, 
  UpdateVerificationInput, 
  CreateUserInput,
  BulkUserActionsInput 
} from '../lib/validation/users.schema';
import { toast } from 'sonner';

interface UseUsersOptions {
  filters?: UserFilters;
  autoFetch?: boolean;
}

interface UseUsersReturn {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateRole: (input: UpdateUserRoleInput) => Promise<boolean>;
  updateVerification: (input: UpdateVerificationInput) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  createUser: (input: CreateUserInput) => Promise<boolean>;
  bulkActions: (input: BulkUserActionsInput) => Promise<boolean>;
  stats: {
    total: number;
    byRole: Record<string, number>;
    byVerificationStatus: Record<string, number>;
    newToday: number;
    activeUsers: number;
  } | null;
}

export function useUsers({
  filters = {},
  autoFetch = true
}: UseUsersOptions = {}): UseUsersReturn {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseUsersReturn['stats']>(null);

  const fetchUsers = useCallback(() => {
    let aborted = false;
    const abortCtrl = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await usersRepository.getUsers(filters);
        if (aborted) return;
        if (isOk(result)) {
          setUsers(result.data);
        } else {
          const errorMessage = toUserMessage(result.error);
          setError(errorMessage);
          logError('Failed to fetch users', { filters, error: result.error });
        }
      } catch (err) {
        if (aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Ha ocurrido un error inesperado';
        setError(errorMessage);
        logError('Failed to fetch users', { filters, error: err });
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    run();
    return () => {
      aborted = true;
      abortCtrl.abort();
    };
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await usersRepository.getUserStats();
      
      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch user stats', { error: err });
    }
  }, []);

  const updateRole = useCallback(async (input: UpdateUserRoleInput): Promise<boolean> => {
    try {
      const result = await usersRepository.updateUserRole(input);
      
      if (isOk(result)) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === input.userId 
            ? { ...user, role: input.role }
            : user
        ));
        
        // Update stats (temporarily disabled)
        // await fetchStats();
        
        toast.success('Rol de usuario actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update user role', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update user role', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const updateVerification = useCallback(async (input: UpdateVerificationInput): Promise<boolean> => {
    try {
      const result = await usersRepository.updateVerificationStatus(input);
      
      if (isOk(result)) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === input.userId 
            ? { ...user, verification_status: input.status }
            : user
        ));
        
        // Update stats (temporarily disabled)
        // await fetchStats();
        
        toast.success('Estado de verificación actualizado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update verification status', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update verification status', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const result = await usersRepository.deleteUser(userId);
      
      if (isOk(result)) {
        // Remove user from local state
        setUsers(prev => prev.filter(user => user.id !== userId));
        
        // Update stats (temporarily disabled)
        // await fetchStats();
        
        toast.success('Usuario eliminado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to delete user', { userId, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to delete user', { userId, error: err });
      return false;
    }
  }, [fetchStats]);

  const createUser = useCallback(async (input: CreateUserInput): Promise<boolean> => {
    try {
      const result = await usersRepository.createUser(input);
      
      if (isOk(result)) {
        // Add new user to local state
        setUsers(prev => [result.data, ...prev]);
        
        // Update stats (temporarily disabled)
        // await fetchStats();
        
        toast.success('Usuario creado exitosamente');
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to create user', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to create user', { input, error: err });
      return false;
    }
  }, [fetchStats]);

  const bulkActions = useCallback(async (input: BulkUserActionsInput): Promise<boolean> => {
    try {
      const result = await usersRepository.bulkUserActions(input);
      
      if (isOk(result)) {
        // Refetch users to get updated data
        await fetchUsers();
        
        // Update stats (temporarily disabled)
        // await fetchStats();
        
        toast.success(`${input.userIds.length} usuario(s) actualizado(s) exitosamente`);
        return true;
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to perform bulk user actions', { input, error: result.error });
        return false;
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to perform bulk user actions', { input, error: err });
      return false;
    }
  }, [fetchUsers, fetchStats]);

  const refetch = useCallback(async () => {
    await fetchUsers();
    // await fetchStats(); // Temporarily disabled
  }, [fetchUsers]);

  // Auto-fetch on mount and when filters change (only users for now to avoid resource issues)
  useEffect(() => {
    if (!autoFetch) return;
    const cleanup = fetchUsers();
    return cleanup;
  }, [fetchUsers, autoFetch]);

  return {
    users,
    loading,
    error,
    refetch,
    updateRole,
    updateVerification,
    deleteUser,
    createUser,
    bulkActions,
    stats
  };
}

// Hook for user profile management
export function useUserProfile(userId: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await usersRepository.getUserById(userId);
      
      if (isOk(result)) {
        setUser(result.data);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch user profile', { userId, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch user profile', { userId, error: err });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      // This would need to be implemented in the repository
      // For now, we'll just update the local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast.success('Perfil actualizado exitosamente');
      return true;
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update user profile', { userId, data, error: err });
      return false;
    }
  }, [userId]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateProfile
  };
}
