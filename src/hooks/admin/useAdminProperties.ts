import { useState, useCallback } from 'react';
import { propertiesRepository } from '../../lib/db/repositories/properties.repo';
// import { Result } from '../../lib/utils/result';
import { AppError } from '../../lib/utils/errors';

// Temporary Result type definition - TODO: Fix export from result.ts
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  property_type: 'apartment' | 'house' | 'townhouse' | 'office' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'archived';
  owner_id: string;
  owner?: {
    id: string;
    full_name: string;
    email: string;
  };
  images: string[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export const useAdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result: Result<Property[], AppError> = await propertiesRepository.getPendingProperties();

      if (result.isOk()) {
        setProperties(result.value);
      } else {
        setError(result.error.message);
        console.error('Error fetching properties:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error in refreshProperties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePropertyStatus = useCallback(async (
    propertyId: string,
    status: 'approved' | 'rejected' | 'published',
    notes?: string
  ): Promise<Result<void, AppError>> => {
    try {
      const result = await propertiesRepository.updatePropertyStatus(propertyId, status, notes);

      if (result.isOk()) {
        // Refresh the properties list
        await refreshProperties();
      }

      return result;
    } catch (err) {
      console.error('Error updating property status:', err);
      return Result.err(new AppError('Error actualizando estado de propiedad', 'UPDATE_ERROR'));
    }
  }, [refreshProperties]);

  return {
    properties,
    loading,
    error,
    refreshProperties,
    updatePropertyStatus,
  };
};