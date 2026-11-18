import React from 'react';

import { SunnyListingCompare } from '../../components/sunny/SunnyListingCompare';
import { SunnyListingStats } from '../../components/sunny/SunnyListingStats';
import {
  parseCompareListingsOutput,
  parseListingStatsOutput,
  parseShowListingsOutput,
} from '../../lib/sunny/generative-ui';
import { ListingsCarousel } from './ListingsCarousel';
import { useToolStructuredContent, widgetKind } from './host';

function EmptyState({ message }: { message: string }) {
  return (
    <p className="sunday-widget-empty" data-testid="sunday-widget-empty">
      {message}
    </p>
  );
}

export function WidgetApp() {
  const data = useToolStructuredContent();
  const kind = widgetKind();

  if (kind === 'stats') {
    const listing = parseListingStatsOutput(data);
    if (!listing) return <EmptyState message="No hay cifras publicadas para este listado." />;
    return <SunnyListingStats listing={listing} />;
  }

  if (kind === 'compare') {
    const compared = parseCompareListingsOutput(data);
    if (!compared || compared.listings.length < 2) {
      return <EmptyState message="Se necesitan al menos dos listados publicados para comparar." />;
    }
    return <SunnyListingCompare listings={compared.listings} highlights={compared.highlights} />;
  }

  const listings = parseShowListingsOutput(data);
  if (!listings?.length) return <EmptyState message="No hay listados publicados para mostrar." />;
  return <ListingsCarousel listings={listings} />;
}
