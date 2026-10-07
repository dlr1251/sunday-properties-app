import { supabase } from './supabase';

export type PropertyCountsByOwner = {
  owner_id: string;
  total: number;
  published: number;
  sold: number;
};

export function emptyPropertyCounts(ownerId: string): PropertyCountsByOwner {
  return { owner_id: ownerId, total: 0, published: 0, sold: 0 };
}

/**
 * SECURITY DEFINER RPC: admin/super_admin see requested owners; everyone
 * else only sees their own row. Missing owners are omitted (treat as 0).
 */
export async function fetchPropertyCountsByOwner(
  ownerIds: string[]
): Promise<Map<string, PropertyCountsByOwner>> {
  const unique = [...new Set(ownerIds.filter(Boolean))];
  const map = new Map<string, PropertyCountsByOwner>();
  if (unique.length === 0) return map;

  const { data, error } = await supabase.rpc('property_counts_by_owner', {
    owner_ids: unique,
  });
  if (error) throw error;

  for (const row of data ?? []) {
    map.set(row.owner_id, {
      owner_id: row.owner_id,
      total: Number(row.total ?? 0),
      published: Number(row.published ?? 0),
      sold: Number(row.sold ?? 0),
    });
  }
  return map;
}
