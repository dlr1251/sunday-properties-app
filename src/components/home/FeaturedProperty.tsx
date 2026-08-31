import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Property } from '../../types/entities';
import { supabase } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../../utils/format';
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  Star,
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FeaturedPropertyProps {
  onPropertySelect?: (propertyId: string) => void;
}

export const FeaturedProperty: React.FC<FeaturedPropertyProps> = ({
  onPropertySelect
}) => {
  const { t } = useTranslation();
  const [featuredProperty, setFeaturedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProperty = async () => {
      setLoading(true);
      try {
        // Get a random featured property (premium or verified)
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .or('premium.eq.true,verified.eq.true')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching featured property:', error);
          setFeaturedProperty(null);
        } else if (data && data.length > 0) {
          // Select a random property from the top 10
          const randomIndex = Math.floor(Math.random() * Math.min(data.length, 3));
          setFeaturedProperty(data[randomIndex] as Property);
        }
      } catch (err) {
        console.error('Unexpected error fetching featured property:', err);
        setFeaturedProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperty();
  }, []);

  const formatPrice = (price: number) => formatCurrency(price);

  const nextImage = () => {
    if (featuredProperty?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % featuredProperty.images.length);
    }
  };

  const prevImage = () => {
    if (featuredProperty?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + featuredProperty.images.length) % featuredProperty.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden max-w-4xl w-full shadow-sm">
          <div className="h-96 bg-muted"></div>
          <div className="p-8">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
            <div className="flex space-x-4">
              <div className="h-12 bg-muted rounded w-32"></div>
              <div className="h-12 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!featuredProperty) {
    return null;
  }

  const images = featuredProperty.images && featuredProperty.images.length > 0
    ? featuredProperty.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'];

  const currentImage = images[currentImageIndex];

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        {/* Image Carousel */}
        <div className="relative h-96 overflow-hidden group">
          <motion.img
            key={currentImageIndex}
            src={currentImage}
            alt={featuredProperty.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full border border-border/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label={t('properties.previousImage')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full border border-border/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label={t('properties.nextImage')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-background/80 text-foreground px-3 py-1.5 rounded-full text-xs font-semibold flex items-center border border-border/60 shadow-sm">
              <Star className="w-4 h-4 mr-2 text-warning" />
              {t('properties.featured')}
            </div>
            {featuredProperty.verified && (
              <div className="bg-success/15 text-success px-3 py-1.5 rounded-full text-xs font-semibold border border-success/30">
                ✓ {t('properties.verifiedBySunday')}
              </div>
            )}
          </div>

          {/* Property Type Badge */}
          <div className="absolute top-6 right-6 bg-primary/15 text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/25">
            {featuredProperty.property_type === 'apartment'
              ? t('properties.types.apartment')
              : featuredProperty.property_type === 'house'
                ? t('properties.types.house')
                : featuredProperty.property_type === 'office'
                  ? t('properties.types.office')
                  : t('properties.types.commercial')}
          </div>

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all border ${
                    index === currentImageIndex
                      ? 'bg-background border-border'
                      : 'bg-background/40 border-border/40'
                  }`}
                  aria-label={t('properties.goToImage', { n: index + 1 })}
                />
              ))}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 bg-background/70 text-foreground px-3 py-1 rounded-full text-xs border border-border/60">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Price and Title */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-foreground mb-2">
              {formatPrice(featuredProperty.price)}
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              {featuredProperty.title}
            </h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{featuredProperty.neighborhood}, {featuredProperty.city}</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="text-center p-4 bg-secondary/40 rounded-xl border border-border/40">
              <Bed className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold text-foreground">{featuredProperty.bedrooms}</div>
              <div className="text-xs text-muted-foreground">{t('properties.bedrooms')}</div>
            </div>
            <div className="text-center p-4 bg-secondary/40 rounded-xl border border-border/40">
              <Bath className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold text-foreground">{featuredProperty.bathrooms}</div>
              <div className="text-xs text-muted-foreground">{t('properties.bathrooms')}</div>
            </div>
            <div className="text-center p-4 bg-secondary/40 rounded-xl border border-border/40">
              <Car className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold text-foreground">{featuredProperty.parking}</div>
              <div className="text-xs text-muted-foreground">{t('properties.parking')}</div>
            </div>
            <div className="text-center p-4 bg-secondary/40 rounded-xl border border-border/40">
              <Ruler className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold text-foreground">{featuredProperty.area}</div>
              <div className="text-xs text-muted-foreground">m²</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="h-12 px-6 text-base font-semibold flex-1"
              onClick={() => onPropertySelect?.(featuredProperty.id)}
            >
              {t('properties.viewProperty')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-semibold"
            >
              <Heart className="mr-2 h-5 w-5" />
              {t('properties.favorites')}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
