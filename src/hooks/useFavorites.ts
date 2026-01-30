import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    price: number;
    address: string;
    neighborhood: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    images: string[];
    status: string;
  };
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            id,
            title,
            price,
            address,
            neighborhood,
            city,
            bedrooms,
            bathrooms,
            area,
            images,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFavorites(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (propertyId: string, notes?: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        })
        .select(`
          *,
          property:properties(
            id,
            title,
            price,
            address,
            neighborhood,
            city,
            bedrooms,
            bathrooms,
            area,
            images,
            status
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Esta propiedad ya está en tus favoritos');
          return false;
        }
        throw error;
      }

      setFavorites(prev => [data, ...prev]);
      toast.success('Propiedad agregada a favoritos');
      return true;
    } catch (err) {
      console.error('Error adding to favorites:', err);
      toast.error(err instanceof Error ? err.message : 'Error al agregar a favoritos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        throw error;
      }

      setFavorites(prev => prev.filter(fav => fav.property_id !== propertyId));
      toast.success('Propiedad eliminada de favoritos');
      return true;
    } catch (err) {
      console.error('Error removing from favorites:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar de favoritos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFavoriteNotes = async (propertyId: string, notes: string) => {
    // Notes column doesn't exist in favorites table
    // This function is kept for compatibility but doesn't do anything
    console.warn('updateFavoriteNotes: Notes feature not implemented in database');
    return false;
  };

  const isFavorited = (propertyId: string): boolean => {
    return favorites.some(fav => fav.property_id === propertyId);
  };

  const getFavoriteNotes = (propertyId: string): string => {
    // Notes column doesn't exist in favorites table
    return '';
  };

  const clearFavorites = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setFavorites([]);
      toast.success('Favoritos eliminados');
      return true;
    } catch (err) {
      console.error('Error clearing favorites:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar favoritos');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    updateFavoriteNotes,
    isFavorited,
    getFavoriteNotes,
    clearFavorites,
    refetch: fetchFavorites
  };
};
