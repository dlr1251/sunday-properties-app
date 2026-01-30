import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PropertyCardProps {
  id?: string;
  title: string;
  area: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  price: string;
  image?: string;
  rating?: number;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
  verified?: boolean;
  premium?: boolean;
  acceptsCrypto?: boolean;
  viewsCount?: number;
  favoritesCount?: number;
}

export function PropertyCard({
  id = '1',
  title,
  area,
  location,
  bedrooms,
  bathrooms,
  price,
  image = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzYwOTEwNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  isFavorite = false,
  onFavorite,
  onView,
  className = '',
  verified = false,
  premium = false,
  acceptsCrypto = false,
}: PropertyCardProps) {
  const { t } = useTranslation();

  const formatPrice = (price: string) => {
    const numericPrice = parseInt(price.replace(/[^\d]/g, ''));
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const handleCardClick = () => {
    onView?.(id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  return (
    <motion.article
      className={[
        'group relative',
        'bg-card rounded-2xl overflow-hidden',
        'border border-border/50',
        'shadow-soft hover:shadow-elevated',
        'transition-all duration-300 ease-out',
        'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      onClick={handleCardClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {premium && (
            <Badge variant="premium" className="shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('properties.premium')}
            </Badge>
          )}
          {verified && (
            <Badge variant="success" className="shadow-sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t('properties.verified')}
            </Badge>
          )}
          {acceptsCrypto && (
            <Badge variant="default" className="shadow-sm">
              {t('properties.acceptsCrypto')}
            </Badge>
          )}
        </div>

        {/* Favorite Button - Top Right */}
        <motion.button
          className={[
            'absolute top-3 right-3 z-10',
            'w-9 h-9 rounded-full',
            'flex items-center justify-center',
            'bg-background/90 backdrop-blur-sm',
            'border border-border/50',
            'shadow-sm',
            'transition-colors duration-200',
            isFavorite ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
          ].join(' ')}
          onClick={handleFavorite}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isFavorite ? t('properties.removeFromFavorites') : t('properties.addToFavorites')}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-200 ${
              isFavorite ? 'fill-current' : ''
            }`} 
          />
        </motion.button>

        {/* Price Overlay - Bottom */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-sm shadow-sm">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-sm truncate">{location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bed className="h-4 w-4" />
            <span className="text-sm font-medium">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Bath className="h-4 w-4" />
            <span className="text-sm font-medium">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Maximize2 className="h-4 w-4" />
            <span className="text-sm font-medium">{area}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}