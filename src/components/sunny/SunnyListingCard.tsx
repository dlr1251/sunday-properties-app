import { Bath, Bed, Maximize2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatSunnyListingPrice } from '../../lib/sunny/format-money';
import { formatListingArea, listingHref, listingZone, type SunnyListingHit } from '../../lib/sunny/listing-hit';
import { SunnyListingGallery } from './SunnyListingGallery';

type SunnyListingCardProps = {
  listing: SunnyListingHit;
};

export function SunnyListingCard({ listing }: SunnyListingCardProps) {
  const { t } = useTranslation();
  const href = listingHref(listing);
  const zone = listingZone(listing);
  const title = listing.title?.trim() || href;
  const priceLabel = formatSunnyListingPrice(listing);

  return (
    <article
      className="overflow-hidden rounded-xl border border-white/10 bg-[#1a2441] text-white shadow-md"
      data-testid="sunny-listing-card"
    >
      <SunnyListingGallery images={listing.images} title={title} />
      <div className="space-y-2 px-3 py-3">
        <h3 className="text-sm font-semibold leading-snug">
          <Link to={href} className="text-white hover:text-[#f5d15a]">
            {title}
          </Link>
        </h3>
        {zone ? <p className="text-xs text-white/70">{zone}</p> : null}
        <p className="text-base font-semibold text-[#f5d15a]">{priceLabel}</p>
        <dl className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/80">
          {listing.area != null ? (
            <div className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">{t('sunnyChat.area')}</dt>
              <dd>{formatListingArea(listing.area)}</dd>
            </div>
          ) : null}
          {listing.bedrooms != null ? (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">{t('sunnyChat.bedrooms')}</dt>
              <dd>{listing.bedrooms}</dd>
            </div>
          ) : null}
          {listing.bathrooms != null ? (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden="true" />
              <dt className="sr-only">{t('sunnyChat.bathrooms')}</dt>
              <dd>{listing.bathrooms}</dd>
            </div>
          ) : null}
        </dl>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={href}
            className="rounded-lg border border-[#f5d15a]/40 px-2.5 py-1.5 text-xs font-medium text-[#f5d15a] hover:bg-[#f5d15a]/10"
          >
            {t('sunnyChat.viewListing')}
          </Link>
          <Link
            to={href}
            className="rounded-lg bg-[#f0a80d] px-2.5 py-1.5 text-xs font-semibold text-[#1a2441] hover:bg-[#d9940b]"
          >
            {t('sunnyChat.scheduleVisit')}
          </Link>
        </div>
      </div>
    </article>
  );
}

type SunnyListingCardsProps = {
  listings: readonly SunnyListingHit[];
};

export function SunnyListingCards({ listings }: SunnyListingCardsProps) {
  if (!listings.length) return null;
  return (
    <div className="space-y-3" data-testid="sunny-listings">
      {listings.map((listing) => (
        <SunnyListingCard key={listing.id || listing.slug || listing.url} listing={listing} />
      ))}
    </div>
  );
}
