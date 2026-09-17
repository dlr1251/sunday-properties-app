import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Property } from '../../types/entities';
import { supabase } from '../../lib/supabase';
import { formatListingPrice } from '../../utils/format';
import { Button } from '@/components/ui/button';
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

  const formatPrice = (property: Property) => formatListingPrice(property);

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
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Propiedad Destacada
            </h2>
            <p className="text-xl text-gray-600">
              Descubre esta propiedad excepcional
            </p>
          </div>

          <div className="flex justify-center">
            <div className="animate-pulse bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full">
              <div className="h-96 bg-gray-300"></div>
              <div className="p-8">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="flex space-x-4">
                  <div className="h-12 bg-gray-300 rounded w-32"></div>
                  <div className="h-12 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Propiedad Destacada
          </h2>
          <p className="text-xl text-gray-600">
            Descubre esta propiedad excepcional seleccionada especialmente para ti
          </p>
        </motion.div>

        {/* Featured Property Card */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">

            {/* Image Carousel */}
            <div className="relative h-96 overflow-hidden group">
              <motion.img
                key={currentImageIndex}
                src={currentImage}
                alt={featuredProperty.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col space-y-2">
                <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                  <Star className="w-4 h-4 mr-2" />
                  Propiedad Destacada
                </div>
                {featuredProperty.verified && (
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ✓ Verificada por Sunday
                  </div>
                )}
              </div>

              {/* Property Type Badge */}
              <div className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {featuredProperty.property_type === 'apartment' ? 'Apartamento' :
                 featuredProperty.property_type === 'house' ? 'Casa' :
                 featuredProperty.property_type === 'office' ? 'Oficina' : 'Local'}
              </div>

              {/* Image Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-6 right-6 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Price and Title */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(featuredProperty)}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {featuredProperty.title}
                </h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{featuredProperty.neighborhood}, {featuredProperty.city}</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bed className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{featuredProperty.bedrooms}</div>
                  <div className="text-sm text-gray-600">Habitaciones</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bath className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{featuredProperty.bathrooms}</div>
                  <div className="text-sm text-gray-600">Baños</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Car className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{featuredProperty.parking}</div>
                  <div className="text-sm text-gray-600">Parqueaderos</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Ruler className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">{featuredProperty.area}</div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold flex-1"
                  onClick={() => onPropertySelect?.(featuredProperty.id)}
                >
                  Ver Propiedad Completa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Agregar a Favoritos
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
