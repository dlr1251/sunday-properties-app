import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { listingStatsFromHit, type ListingStat } from '../../lib/sunny/generative-ui';
import { formatCop, formatSunnyListingPrice } from '../../lib/sunny/format-money';
import { formatListingArea, listingHref, type SunnyListingHit } from '../../lib/sunny/listing-hit';

function formatStat(
  stat: ListingStat,
  listing: SunnyListingHit,
  t: (key: string) => string,
): { label: string; value: string } {
  switch (stat.key) {
    case 'price':
      return { label: t('sunnyChat.price'), value: formatSunnyListingPrice(listing) };
    case 'price_per_m2':
      return {
        label: t('sunnyChat.pricePerM2'),
        value:
          typeof stat.value === 'number'
            ? `${formatCop(stat.value)}${listing.listing_type === 'rental' ? '/m²/mes' : '/m²'}`
            : String(stat.value),
      };
    case 'area':
      return {
        label: t('sunnyChat.area'),
        value: typeof stat.value === 'number' ? formatListingArea(stat.value) : String(stat.value),
      };
    case 'bedrooms':
      return { label: t('sunnyChat.bedrooms'), value: String(stat.value) };
    case 'bathrooms':
      return { label: t('sunnyChat.bathrooms'), value: String(stat.value) };
    case 'strata':
      return { label: t('sunnyChat.strata'), value: String(stat.value) };
    case 'admin_fee':
      return {
        label: t('sunnyChat.adminFee'),
        value: typeof stat.value === 'number' ? `${formatCop(stat.value)}/mes` : String(stat.value),
      };
    case 'zone':
      return { label: t('sunnyChat.zone'), value: String(stat.value) };
    default:
      return { label: stat.key, value: String(stat.value) };
  }
}

type SunnyListingStatsProps = {
  listing: SunnyListingHit;
};

export function SunnyListingStats({ listing }: SunnyListingStatsProps) {
  const { t } = useTranslation();
  const stats = listingStatsFromHit(listing);
  if (!stats.length) return null;
  const href = listingHref(listing);
  const title = listing.title?.trim() || href;

  return (
    <section
      className="overflow-hidden rounded-xl border border-white/10 bg-[#1a2441] text-white"
      data-testid="sunny-stats"
    >
      <header className="border-b border-white/10 px-3 py-2">
        <p className="text-[11px] uppercase tracking-wide text-[#f5d15a]">{t('sunnyChat.statsHeading')}</p>
        <h3 className="text-sm font-semibold">{title}</h3>
      </header>
      <dl className="grid grid-cols-2 gap-px bg-white/10">
        {stats.map((stat) => {
          const formatted = formatStat(stat, listing, t);
          return (
            <div key={stat.key} className="bg-[#1a2441] px-3 py-2">
              <dt className="text-[11px] text-white/60">{formatted.label}</dt>
              <dd className="text-sm font-semibold text-white">{formatted.value}</dd>
            </div>
          );
        })}
      </dl>
      <div className="flex flex-wrap gap-2 px-3 py-2.5">
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
    </section>
  );
}
