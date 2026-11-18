import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  COMPARE_LISTINGS_TOOL,
  LISTING_STATS_TOOL,
  SHOW_LISTINGS_TOOL,
  parseCompareListingsOutput,
  parseListingStatsOutput,
  parseShowListingsOutput,
} from '../../lib/sunny/generative-ui';
import { SunnyListingCards } from './SunnyListingCard';
import { SunnyListingCompare } from './SunnyListingCompare';
import { SunnyListingStats } from './SunnyListingStats';

export type SunnyToolPartView = {
  name: string;
  state: 'streaming' | 'requested' | 'running' | 'completed' | string;
  output?: unknown;
  label?: string;
};

type SunnyToolResultProps = {
  part: SunnyToolPartView;
};

export function SunnyToolResult({ part }: SunnyToolResultProps) {
  const { t } = useTranslation();
  if (part.state === 'streaming' || part.state === 'requested' || part.state === 'running') {
    return (
      <p className="text-xs text-white/60" data-testid="sunny-tool-pending">
        {part.label || t('sunnyChat.loadingUi')}
      </p>
    );
  }
  if (part.state !== 'completed') return null;

  if (part.name === SHOW_LISTINGS_TOOL) {
    const listings = parseShowListingsOutput(part.output);
    if (!listings?.length) return null;
    return <SunnyListingCards listings={listings} />;
  }
  if (part.name === LISTING_STATS_TOOL) {
    const listing = parseListingStatsOutput(part.output);
    if (!listing) return null;
    return <SunnyListingStats listing={listing} />;
  }
  if (part.name === COMPARE_LISTINGS_TOOL) {
    const compared = parseCompareListingsOutput(part.output);
    if (!compared?.listings.length) return null;
    return <SunnyListingCompare listings={compared.listings} highlights={compared.highlights} />;
  }
  return null;
}
