import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';

// Property interface (matching database schema)
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  property_type: 'apartment' | 'house' | 'townhouse' | 'office' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'archived';
  verified: boolean;
  premium: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Joined data
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

// Property filters interface
export interface PropertyFilters {
  status?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  search?: string;
  verified?: boolean;
  premium?: boolean;
  ownerId?: string;
}

export class PropertiesRepository {
  /**
   * Get published properties with filters
   */
  async getPublishedProperties(filters: PropertyFilters = {}): Promise<Result<Property[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.search) {
        query = query.or(`
          title.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%,
          address.ilike.%${filters.search}%
        `);
      }
      if (filters.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }
      if (filters.premium !== undefined) {
        query = query.eq('premium', filters.premium);
      }
      if (filters.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch properties', { filters, error });
        throw createDatabaseError('Error al cargar las propiedades', error);
      }

      return data || [];
    });
  }

  /**
   * Get pending properties for admin review
   */
  async getPendingProperties(): Promise<Result<Property[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch pending properties', { error });
        throw createDatabaseError('Error al cargar las propiedades pendientes', error);
      }

      return data || [];
    });
  }

  /**
   * Update property status (for admin approval/rejection)
   */
  async updatePropertyStatus(
    id: string,
    status: 'approved' | 'rejected' | 'published',
    notes?: string
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'rejected' && notes) {
        updateData.rejection_reason = notes;
      }

      if (status === 'approved') {
        updateData.verified = true;
        updateData.published_at = new Date().toISOString();

        // Get the verification data to transfer images and other submitted data
        const { data: verificationData, error: verificationError } = await supabase
          .from('property_verifications')
          .select('submitted_data')
          .eq('property_id', id)
          .single();

        if (verificationError) {
          logError('Failed to get verification data', { id, error: verificationError });
        } else if (verificationData?.submitted_data?.property) {
          const submittedProperty = verificationData.submitted_data.property;

          // Transfer the submitted data to the main property record
          updateData.title = submittedProperty.title;
          updateData.description = submittedProperty.description;
          updateData.address = submittedProperty.address;
          updateData.neighborhood = submittedProperty.neighborhood;
          updateData.city = submittedProperty.city;
          updateData.coordinates = submittedProperty.coordinates;
          updateData.property_type = submittedProperty.propertyType;
          updateData.price = submittedProperty.price;
          updateData.area = submittedProperty.area;
          updateData.bedrooms = submittedProperty.bedrooms;
          updateData.bathrooms = submittedProperty.bathrooms;
          updateData.parking = submittedProperty.parking;
          updateData.floor = submittedProperty.floor;
          updateData.total_floors = submittedProperty.totalFloors;
          updateData.year_built = submittedProperty.yearBuilt;
          updateData.strata = submittedProperty.strata;
          updateData.features = submittedProperty.features || [];
          updateData.visit_price = submittedProperty.visitPrice;

          // Handle images - if there are uploaded image URLs, use them
          if (submittedProperty.uploadedImages && submittedProperty.uploadedImages.length > 0) {
            updateData.images = submittedProperty.uploadedImages;
          } else {
            // Fallback to some default images
            updateData.images = [
              'https://picsum.photos/800/600?random=1',
              'https://picsum.photos/800/600?random=2',
              'https://picsum.photos/800/600?random=3'
            ];
          }
        }
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id);

      if (error) {
        logError('Failed to update property status', { id, status, error });
        throw createDatabaseError('Error al actualizar el estado de la propiedad', error);
      }
    });
  }

  /**
   * Get a specific property by ID
   */
  async getPropertyById(id: string): Promise<Result<Property, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Property', id);
        }
        logError('Failed to fetch property', { id, error });
        throw createDatabaseError('Error al cargar la propiedad', error);
      }

      return data;
    });
  }

  /**
   * Update property
   */
  async updateProperty(id: string, data: Partial<Property>): Promise<Result<Property, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        logError('Failed to update property', { id, data, error });
        throw createDatabaseError('Error al actualizar la propiedad', error);
      }

      return result;
    });
  }

  /**
   * Archive a property
   */
  async archiveProperty(propertyId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) {
        logError('Failed to archive property', { propertyId, error });
        throw createDatabaseError('Error al archivar la propiedad', error);
      }

      return undefined;
    });
  }

  /**
   * Get properties by owner
   */
  async getPropertiesByOwner(ownerId: string): Promise<Result<Property[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch owner properties', { ownerId, error });
        throw createDatabaseError('Error al cargar las propiedades del propietario', error);
      }

      return data || [];
    });
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<Result<{
    total: number;
    published: number;
    draft: number;
    pending: number;
    sold: number;
    rented: number;
    archived: number;
    verified: number;
    premium: number;
    byType: Record<string, number>;
    averagePrice: number;
    newToday: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('status, property_type, price, verified, premium, created_at');

      if (error) {
        logError('Failed to fetch property stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de propiedades', error);
      }

      const today = new Date().toISOString().split('T')[0];
      const newToday = data?.filter(p => p.created_at.startsWith(today)).length || 0;

      const byType = data?.reduce((acc, property) => {
        acc[property.property_type] = (acc[property.property_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalPrice = data?.reduce((sum, property) => sum + property.price, 0) || 0;
      const averagePrice = data?.length ? totalPrice / data.length : 0;

      return {
        total: data?.length || 0,
        published: data?.filter(p => p.status === 'published').length || 0,
        draft: data?.filter(p => p.status === 'draft').length || 0,
        pending: data?.filter(p => p.status === 'pending').length || 0,
        sold: data?.filter(p => p.status === 'sold').length || 0,
        rented: data?.filter(p => p.status === 'rented').length || 0,
        archived: data?.filter(p => p.status === 'archived').length || 0,
        verified: data?.filter(p => p.verified).length || 0,
        premium: data?.filter(p => p.premium).length || 0,
        byType,
        averagePrice,
        newToday
      };
    });
  }

  /**
   * Search properties
   */
  async searchProperties(query: string, filters: PropertyFilters = {}): Promise<Result<Property[], AppError>> {
    return tryCatch(async () => {
      let supabaseQuery = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('status', 'published')
        .or(`
          title.ilike.%${query}%,
          description.ilike.%${query}%,
          address.ilike.%${query}%,
          city.ilike.%${query}%
        `)
        .order('created_at', { ascending: false });

      // Apply additional filters
      if (filters.propertyType && filters.propertyType !== 'all') {
        supabaseQuery = supabaseQuery.eq('property_type', filters.propertyType);
      }
      if (filters.minPrice) {
        supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        logError('Failed to search properties', { query, filters, error });
        throw createDatabaseError('Error al buscar propiedades', error);
      }

      return data || [];
    });
  }
}

// Export singleton instance
export const propertiesRepository = new PropertiesRepository();
