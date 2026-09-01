import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, formatRelativeTime, formatCurrency } from '../../utils/format';
import { Button } from '../ui/button';
import { Building2, Calendar, RefreshCw, ExternalLink, DollarSign } from 'lucide-react';

export type NegotiationHeaderProperty = {
  id: string;
  title: string;
  images?: string[];
  price?: number;
  address?: string;
  neighborhood?: string;
  city?: string;
};

export type NegotiationHeaderProps = {
  negotiationId: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  currentPrice?: number | null;
  property?: NegotiationHeaderProperty | null;
  className?: string;
};

export const NegotiationHeader: React.FC<NegotiationHeaderProps> = ({
  title: _legacyTitle,
  createdAt,
  updatedAt,
  currentPrice,
  property,
  className
}) => {
  const { t } = useTranslation();
  const propertyTitle = property?.title || _legacyTitle || t('negotiations.detail');
  const thumbnails = (property?.images && property.images.length > 0)
    ? property.images.slice(0, 4)
    : [];
  const dealValue = currentPrice ?? property?.price ?? null;

  return (
    <div className={className ?? ''}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {thumbnails.length > 0 ? (
          <div className="flex gap-2 shrink-0">
            <div className="flex gap-1.5 overflow-hidden rounded-xl border border-border bg-muted">
              {thumbnails.map((src, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl border border-border bg-muted flex items-center justify-center">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/70" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {propertyTitle}
            </h1>
            {(property?.neighborhood || property?.city) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[property?.neighborhood, property?.city].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              {createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-muted-foreground/70" />
                  {t('negotiations.created', { relative: formatRelativeTime(createdAt), date: formatDate(createdAt) })}
                </span>
              )}
              {updatedAt && createdAt !== updatedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-muted-foreground/70" />
                  {t('negotiations.lastUpdated', { relative: formatRelativeTime(updatedAt) })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            {dealValue != null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xl sm:text-2xl font-bold text-emerald-900">
                  {formatCurrency(dealValue)}
                </span>
                <span className="text-sm font-medium text-emerald-700">{t('negotiations.currentValue')}</span>
              </div>
            )}
            {property?.id && (
              <Button variant="outline" size="sm" asChild className="shrink-0 font-medium">
                <Link to={`/dashboard?tab=explore&property=${property.id}`} className="inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t('properties.viewProperty')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

