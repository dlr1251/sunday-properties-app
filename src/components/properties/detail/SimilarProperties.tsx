import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../../utils/format';

interface SimilarPropertiesProps {
  currentPropertyId: string;
  neighborhood: string;
  city: string;
  priceRange?: { min: number; max: number };
  onPropertyClick?: (propertyId: string) => void;
}

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_images?: Array<{ image_url: string; is_primary: boolean }>;
  verified?: boolean;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentPropertyId,
  neighborhood,
  city,
  priceRange,
  onPropertyClick,
}) => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount] = useState(3);

  useEffect(() => {
    fetchSimilarProperties();
  }, [currentPropertyId, neighborhood, city, priceRange]);

  const fetchSimilarProperties = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          address,
          neighborhood,
          city,
          bedrooms,
          bathrooms,
          area,
          verified,
          images
        `)
        .eq('city', city)
        .eq('status', 'published')
        .neq('id', currentPropertyId)
        .limit(10);

      // Add price range filter if available
      if (priceRange) {
        // Round prices to integers since price is BIGINT in database
        const minPrice = Math.round(priceRange.min * 0.7);
        const maxPrice = Math.round(priceRange.max * 1.3);
        query = query.gte('price', minPrice).lte('price', maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by neighborhood first, then expand to nearby areas
      const similarInNeighborhood = (data || [])
        .filter((p) => p.neighborhood === neighborhood)
        .slice(0, 6);

      const allSimilar = similarInNeighborhood.length >= 3
        ? similarInNeighborhood
        : [
            ...similarInNeighborhood,
            ...(data || [])
              .filter((p) => p.neighborhood !== neighborhood)
              .slice(0, 6 - similarInNeighborhood.length),
          ];

      setProperties(allSimilar);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + visibleCount, Math.max(0, properties.length - visibleCount))
    );
  };

  const formatPrice = (price: number) => formatCurrency(price);

  const getPropertyImage = (property: Property) => {
    // Use the images array directly since there's no separate property_images table
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images[0];
    }
    return 'https://via.placeholder.com/400x300';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
          <div className="h-40 bg-gray-200 animate-pulse rounded" />
        </div>
      </Card>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  const visibleProperties = properties.slice(currentIndex, currentIndex + visibleCount);
  const hasMore = currentIndex + visibleCount < properties.length;
  const hasPrevious = currentIndex > 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('properties.detail.similarTitle')}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={!hasMore}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {visibleProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onPropertyClick?.(property.id)}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {property.verified && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-green-800 border-0">
                        ✓ {t('properties.verified')}
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{property.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-gray-500" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-gray-500" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4 text-gray-500" />
                          <span>{property.area}m²</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(property.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

