import React from 'react';
import { fetchUsersService, getRoleStatsService, updateUserRoleService } from '../../../services/users';

export type UseUsersQuery = {
  page: number;
  limit: number;
  search?: string;
  role?: string;
};

export function useUsersData(query: UseUsersQuery) {
  const { page, limit, search, role } = query;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);

  async function load() {
    setIsLoading(true);
    setError(null);
    const res = await fetchUsersService(page, limit, search, role);
    if (res.ok) {
      setUsers(res.data.users);
      setCount(res.data.count);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, role]);

  async function changeRole(userId: string, newRole: string) {
    const res = await updateUserRoleService(userId, newRole as any);
    if (res.ok) await load();
    return res;
  }

  return { isLoading, error, users, count, reload: load, changeRole };
}

export function useUserRoleStats() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<{ [k: string]: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await getRoleStatsService();
      if (res.ok) setStats(res.data as any);
      else setError(res.error);
      setIsLoading(false);
    })();
  }, []);

  return { isLoading, error, stats };
}


