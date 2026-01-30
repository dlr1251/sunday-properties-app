import { supabase } from '../lib/supabase';
import { Result, asUserMessage, logError } from '../lib/error';
import type { UserWithRole, RoleStats } from '../types/entities';

/**
 * Fetches a paginated and filtered list of users with their roles and activity counts.
 * @param page The page number to fetch.
 * @param limit The number of users per page.
 * @param search A search term to filter by name or email.
 * @param roleFilter A role to filter by.
 * @returns A Result object containing the list of users and the total count.
 */
export async function fetchUsersService(
  page = 1,
  limit = 20,
  search?: string,
  roleFilter?: string
): Promise<Result<{ users: UserWithRole[]; count: number }>> {
  try {
    let query = supabase
      .from('profiles')
      .select(`*,
        properties:properties!properties_owner_id_fkey(count),
        reports_as_reporter:reports!reporter_id(count),
        reports_as_reported:reports!reported_user_id(count),
        visits_as_buyer:visits!buyer_id(count),
        offers_as_buyer:offers!buyer_id(count),
        offers_as_seller:offers!seller_id(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const users: UserWithRole[] = (data || []).map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verification_status: user.verification_status,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      properties_count: user.properties?.[0]?.count || 0,
      reports_count: (user.reports_as_reporter?.[0]?.count || 0) + (user.reports_as_reported?.[0]?.count || 0),
      visits_count: user.visits_as_buyer?.[0]?.count || 0,
      offers_count: (user.offers_as_buyer?.[0]?.count || 0) + (user.offers_as_seller?.[0]?.count || 0)
    }));

    return { ok: true, data: { users, count: count || 0 } };
  } catch (e) {
    logError('fetchUsersService', e);
    return { ok: false, error: asUserMessage(e, 'Error al cargar usuarios') };
  }
}

/**
 * Updates the role of a specific user.
 * @param userId The ID of the user to update.
 * @param newRole The new role to assign.
 * @returns A Result object indicating success or failure.
 */
export async function updateUserRoleService(
  userId: string,
  newRole: UserWithRole['role']
): Promise<Result<null>> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) throw error;
    return { ok: true, data: null };
  } catch (e) {
    logError('updateUserRoleService', e);
    return { ok: false, error: asUserMessage(e, 'Error al actualizar el rol') };
  }
}

/**
 * Fetches statistics about user roles.
 * @returns A Result object containing role statistics.
 */
export async function getRoleStatsService(): Promise<Result<RoleStats>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, verification_status');
    if (error) throw error;

    const stats: RoleStats = {
      total_users: data.length,
      super_admins: data.filter((u: any) => u.role === 'super_admin').length,
      admins: data.filter((u: any) => u.role === 'admin').length,
      agents: data.filter((u: any) => u.role === 'agent').length,
      verified_users: data.filter((u: any) => u.verification_status === 'verified').length,
      unverified_users: data.filter((u: any) => u.verification_status !== 'verified').length
    };

    return { ok: true, data: stats };
  } catch (e) {
    logError('getRoleStatsService', e);
    return { ok: false, error: asUserMessage(e, 'Error al obtener estadísticas') };
  }
}


