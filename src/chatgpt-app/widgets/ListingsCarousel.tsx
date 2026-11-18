import React from 'react';

import { SunnyListingCard } from '../../components/sunny/SunnyListingCard';
import type { SunnyListingHit } from '../../lib/sunny/listing-hit';

type ListingsCarouselProps = {
  listings: readonly SunnyListingHit[];
};

export function ListingsCarousel({ listings }: ListingsCarouselProps) {
  if (!listings.length) return null;
  return (
    <div className="sunday-listings-carousel" data-testid="sunday-listings">
      {listings.map((listing) => (
        <div key={listing.id || listing.slug || listing.url} className="sunday-listings-slide">
          <SunnyListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
