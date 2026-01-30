import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Simple hook for fetching user properties
export const useUserProperties = (userId?: string) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProperties([]);
      setLoading(false);
      return;
    }

  const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
          .eq('owner_id', userId)
        .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ useUserProperties: Supabase error:', error);
          throw error;
        }

      setProperties(data || []);
    } catch (err) {
        console.error('❌ useUserProperties: Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

    fetchProperties();
  }, [userId]);

  return { properties, loading, error };
};

// Simple hook for fetching user visits
export const useUserVisits = (userId?: string) => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchVisits = async () => {
      setLoading(true);
      setError(null);
      
      try {
      const { data, error } = await supabase
        .from('visits')
          .select('*')
          .eq('visitor_id', userId)
          .order('scheduled_date', { ascending: false })
          .limit(10);

      if (error) throw error;
      setVisits(data || []);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch visits');
    } finally {
      setLoading(false);
    }
  };

    fetchVisits();
  }, [userId]);

  return { visits, loading, error };
};

// Simple hook for fetching user offers
export const useUserOffers = (userId?: string) => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      
      try {
      const { data, error } = await supabase
        .from('offers')
          .select('*')
          .eq('buyer_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

    fetchOffers();
  }, [userId]);

  return { offers, loading, error };
};

// Simple hook for fetching user notifications
export const useUserNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

  const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

    fetchNotifications();
  }, [userId]);

  return { notifications, loading, error };
};

// Hook for fetching ALL properties (for logged-in users to browse)
export const useAllProperties = (currentUserId?: string) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            profiles:owner_id (
              full_name,
              email,
              phone
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ useAllProperties: Supabase error:', error);
          throw error;
        }

        // Add ownership flag for current user
        const propertiesWithOwnership = data?.map(property => ({
          ...property,
          isOwner: property.owner_id === currentUserId,
          owner: property.profiles
        })) || [];

        setProperties(propertiesWithOwnership);
      } catch (err) {
        console.error('❌ useAllProperties: Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProperties();
  }, [currentUserId]);

  return { properties, loading, error };
};

// Hook for managing visit scheduling
export const useVisitScheduling = () => {
  const [loading, setLoading] = useState(false);

  const scheduleVisit = async (visitData: {
    property_id: string;
    scheduled_date: string;
    scheduled_time: string;
    visitor_name: string;
    visitor_phone: string;
    visitor_email: string;
    notes?: string;
  }) => {
    setLoading(true);

    try {
      // Get current user for visitor_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // First get property details to find owner
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('owner_id, title')
        .eq('id', visitData.property_id)
        .single();

      if (propertyError) throw propertyError;

      // Create the visit (using the correct schema)
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          property_id: visitData.property_id,
          visitor_id: user.id,
          scheduled_date: visitData.scheduled_date,
          scheduled_time: visitData.scheduled_time,
          notes: visitData.notes,
          status: 'pending',
          visit_price: 49000 // Default visit price
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // Create notification for property owner
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: property.owner_id,
          type: 'visit_request',
          title: 'Nueva solicitud de visita',
          message: `Tienes una nueva solicitud de visita para "${property.title}" el ${visitData.scheduled_date} a las ${visitData.scheduled_time}`,
          data: {
            visit_id: visit.id,
            property_id: visitData.property_id,
            visitor_id: user.id,
            visitor_name: visitData.visitor_name,
            scheduled_date: visitData.scheduled_date,
            scheduled_time: visitData.scheduled_time
          },
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole operation for notification error
      }

      return { success: true, visit };

    } catch (error) {
      console.error('Error scheduling visit:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { scheduleVisit, loading };
};

// Hook for managing visit responses (for property owners)
export const useVisitManagement = (userId?: string) => {
  const [pendingVisits, setPendingVisits] = useState<any[]>([]);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingVisits = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // First get all properties owned by this user
      const { data: userProperties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', userId);

      if (propError) throw propError;

      const propertyIds = userProperties?.map(p => p.id) || [];

      if (propertyIds.length === 0) {
        setPendingVisits([]);
        setAllVisits([]);
        return;
      }

      // Get all visits (pending, confirmed, etc.) for those properties
      const { data: allData, error: allError } = await supabase
        .from('visits')
        .select(`
          *,
          properties:properties!visits_property_id_fkey (
            title,
            address,
            city
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .in('property_id', propertyIds)
        .order('scheduled_date', { ascending: true });

      if (allError) throw allError;

      // Filter pending visits
      const pending = (allData || []).filter(v => v.status === 'pending');
      setPendingVisits(pending);
      setAllVisits(allData || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToVisit = async (visitId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          status: status
        })
        .eq('id', visitId);

      if (error) throw error;

      // Get visit details for notification
      const { data: visit } = await supabase
        .from('visits')
        .select(`
          *,
          properties:properties!visits_property_id_fkey (
            title
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            email
          )
        `)
        .eq('id', visitId)
        .single();

      if (visit) {
        // Create notification for visitor
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: visit.visitor.id,
            type: 'visit_response',
            title: status === 'confirmed' ? 'Visita Confirmada' : 'Visita Cancelada',
            message: `Tu solicitud de visita para "${visit.properties.title}" ha sido ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`,
            data: {
              visit_id: visitId,
              property_id: visit.property_id,
              status,
              scheduled_date: visit.scheduled_date,
              scheduled_time: visit.scheduled_time
            },
            read: false
          });

        if (notificationError) {
          console.error('Error creating response notification:', notificationError);
        }
      }

      await fetchPendingVisits(); // Refresh the list
      return { success: true };

    } catch (error) {
      console.error('Error responding to visit:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchPendingVisits();
  }, [userId]);

  return {
    pendingVisits,
    allVisits,
    loading,
    respondToVisit,
    refreshVisits: fetchPendingVisits
  };
};

// Simple hook for updating profile
export const useProfileUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (userId: string, updates: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};

// Hook for fetching all properties with filters
export const useProperties = (filters?: {
  status?: string;
  property_type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('properties')
          .select(`
            *,
            profiles:owner_id (
              name,
              phone,
              email
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
        if (filters?.city) {
          query = query.ilike('city', filters.city);
        }
        if (filters?.min_price !== undefined) {
          query = query.gte('price', filters.min_price);
        }
        if (filters?.max_price !== undefined) {
          query = query.lte('price', filters.max_price);
        }
        if (filters?.bedrooms !== undefined) {
          query = query.gte('bedrooms', filters.bedrooms);
        }
        if (filters?.bathrooms !== undefined) {
          query = query.gte('bathrooms', filters.bathrooms);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ useProperties: Supabase error:', error);
          throw error;
        }

        // Transform data to include primary image
        const transformedProperties = (data || []).map(property => ({
          ...property,
          primary_image: property.images?.[0] ||
                        'https://picsum.photos/400/300?random=' + property.id,
          owner: property.profiles
        }));

        setProperties(transformedProperties);
      } catch (err) {
        console.error('❌ useProperties: Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
};