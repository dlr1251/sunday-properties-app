import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ExtendedUserProfile } from './types';

export const useTestingUsers = () => {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        // Fetch users with additional profile data including verification_status
        const { data: usersData, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, status, bio, location, avatar_url, phone, website, last_login_at, created_at, verification_status')
          .order('created_at', { ascending: false });

        if (fetchError) {
          // Handle RLS policy issues gracefully
          if (fetchError.message?.includes('infinite recursion detected') ||
              fetchError.message?.includes('Could not find the table')) {
            setError('⚠️ Profiles table access blocked by RLS policies. Please contact administrator to fix database permissions.');
            setLoadingUsers(false);
            return;
          }
          setError('Failed to load users: ' + fetchError.message);
          return;
        }

        // Get properties and offers counts efficiently
        const userIds = (usersData || []).map(user => user.id);

        // Get properties with titles per user
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('owner_id, title, id')
          .in('owner_id', userIds);

        const propertiesCountMap = (propertiesData || []).reduce((acc, prop) => {
          if (!acc[prop.owner_id]) {
            acc[prop.owner_id] = { count: 0, properties: [] };
          }
          acc[prop.owner_id].count += 1;
          acc[prop.owner_id].properties.push({ id: prop.id, title: prop.title || 'Untitled Property' });
          return acc;
        }, {} as Record<string, { count: number; properties: Array<{ id: string; title: string }> }>);

        // Get active negotiations with details per user
        const { data: negotiationsData } = await supabase
          .from('negotiations')
          .select(`
            id,
            buyer_id,
            seller_id,
            status,
            property_id,
            property:properties(id, title, price)
          `)
          .in('status', ['active', 'pending_lawyer', 'pending_documents']);

        // Get offers for these negotiations (offers are linked by property_id)
        const propertyIds = (negotiationsData || []).map(n => n.property_id).filter(Boolean);
        const { data: offersData } = propertyIds.length > 0 ? await supabase
          .from('offers')
          .select('id, property_id, offer_price, status, created_at')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false }) : { data: [], error: null };

        const negotiationsMap = (negotiationsData || []).reduce((acc, negotiation) => {
          const userIds = [negotiation.buyer_id, negotiation.seller_id].filter(Boolean);
          const offers = (offersData || []).filter(o => o.property_id === negotiation.property_id);
          
          userIds.forEach(userId => {
            if (!acc[userId]) {
              acc[userId] = { count: 0, negotiations: [] };
            }
            acc[userId].count += 1;
            acc[userId].negotiations.push({
              id: negotiation.id,
              property: negotiation.property,
              status: negotiation.status,
              latestOffer: offers[0] || null
            });
          });
          return acc;
        }, {} as Record<string, { 
          count: number; 
          negotiations: Array<{
            id: string;
            property: any;
            status: string;
            latestOffer: any;
          }>
        }>);

        // Combine user data with stats
        const usersWithStats = (usersData || []).map(user => ({
          ...user,
          propertiesCount: propertiesCountMap[user.id]?.count || 0,
          properties: propertiesCountMap[user.id]?.properties || [],
          negotiationsCount: negotiationsMap[user.id]?.count || 0,
          activeNegotiations: negotiationsMap[user.id]?.negotiations || []
        }));

        setUsers(usersWithStats);
      } catch (err) {
        setError('Unexpected error loading users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loadingUsers, error };
};

