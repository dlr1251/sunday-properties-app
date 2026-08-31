import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export interface PropertyUpdateData {
  title?: string;
  description?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  property_type?: string;
  listing_type?: 'sale' | 'rental';
  price?: number | null;
  rent_monthly?: number | null;
  lease_term_months?: number | null;
  deposit?: number | null;
  admin_fee?: number | null;
  utilities_included?: string[];
  pets_policy?: string | null;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  strata?: number;
  features?: string[];
  status?: string;
}

export const usePropertyEdit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = async (propertyId: string, updates: PropertyUpdateData) => {
    setLoading(true);
    setError(null);

    try {
      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .select(`
          *,
          profiles:owner_id (
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar la propiedad';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, status: string) => {
    return updateProperty(propertyId, { status });
  };

  const updatePropertyPrice = async (propertyId: string, price: number) => {
    return updateProperty(propertyId, { price });
  };

  return {
    updateProperty,
    updatePropertyStatus,
    updatePropertyPrice,
    loading,
    error
  };
};
