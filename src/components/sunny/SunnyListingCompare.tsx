import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  compareHighlights,
  type CompareHighlights,
  type CompareMetric,
} from '../../lib/sunny/generative-ui';
import {
  formatListingArea,
  listingDisplayPrice,
  listingHref,
  listingPricePerM2,
  listingShortTitle,
  listingZone,
  type SunnyListingHit,
} from '../../lib/sunny/listing-hit';
import { formatCop, formatSunnyListingPrice } from '../../lib/sunny/format-money';
import './sunny-generative.css';

function cellClass(best: boolean): string {
  return best ? 'bg-[#f0a80d]/20 font-semibold text-[#f5d15a]' : 'text-white';
}

type MetricSpec = {
  key: CompareMetric;
  labelKey: string;
  value: (listing: SunnyListingHit) => string | null;
};

function metrics(t: (key: string) => string): MetricSpec[] {
  return [
    {
      key: 'price',
      labelKey: 'sunnyChat.price',
      value: (listing) => (listingDisplayPrice(listing) != null ? formatSunnyListingPrice(listing) : null),
    },
    {
      key: 'price_per_m2',
      labelKey: 'sunnyChat.pricePerM2',
      value: (listing) => {
        const perM2 = listingPricePerM2(listing);
        if (perM2 == null) return null;
        return `${formatCop(perM2)}${listing.listing_type === 'rental' ? '/m²/mes' : '/m²'}`;
      },
    },
    {
      key: 'area',
      labelKey: 'sunnyChat.area',
      value: (listing) => (listing.area != null ? formatListingArea(listing.area) : null),
    },
    {
      key: 'bedrooms',
      labelKey: 'sunnyChat.bedrooms',
      value: (listing) => (listing.bedrooms != null ? String(listing.bedrooms) : null),
    },
    {
      key: 'admin_fee',
      labelKey: 'sunnyChat.adminFee',
      value: (listing) => (listing.admin_fee != null ? `${formatCop(listing.admin_fee)}/mes` : null),
    },
  ];
}

function SunnyPricePerM2Chart({ listings }: { listings: readonly SunnyListingHit[] }) {
  const { t } = useTranslation();
  const rows = listings
    .map((listing) => ({
      id: listing.id,
      title: listingShortTitle(listing),
      value: listingPricePerM2(listing),
    }))
    .filter((row): row is { id: string; title: string; value: number } => row.value != null);
  if (rows.length < 2) return null;
  const max = Math.max(...rows.map((row) => row.value));
  if (!(max > 0)) return null;

  return (
    <figure className="border-t border-white/10 px-3 py-3" data-testid="sunny-compare-chart">
      <figcaption className="mb-2 text-[11px] uppercase tracking-wide text-[#f5d15a]">
        {t('sunnyChat.chartHeading')}
      </figcaption>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <div className="mb-0.5 flex justify-between gap-2 text-[11px] text-white/80">
              <span className="truncate">{row.title}</span>
              <span className="shrink-0">{formatCop(row.value)}/m²</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="sunny-bar-fill"
                style={{ width: `${Math.max(6, (row.value / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}

type SunnyListingCompareProps = {
  listings: readonly SunnyListingHit[];
  highlights?: CompareHighlights;
};

export function SunnyListingCompare({ listings, highlights }: SunnyListingCompareProps) {
  const { t } = useTranslation();
  if (listings.length < 2) return null;
  const best = highlights ?? compareHighlights(listings);
  const cols = metrics(t).filter((metric) => listings.some((listing) => metric.value(listing) != null));

  return (
    <section
      className="overflow-hidden rounded-xl border border-white/10 bg-[#1a2441] text-white"
      data-testid="sunny-compare"
    >
      <header className="px-3 py-2">
        <p className="text-[11px] uppercase tracking-wide text-[#f5d15a]">{t('sunnyChat.compareHeading')}</p>
      </header>
      <div className="sunny-compare-scroll">
        <table className="min-w-full border-collapse text-left text-xs">
          <caption className="sr-only">{t('sunnyChat.compareHeading')}</caption>
          <thead>
            <tr className="border-y border-white/10 text-white/60">
              <th scope="col" className="sticky left-0 z-[1] bg-[#1a2441] px-2 py-2 font-medium">
                {t('sunnyChat.listing')}
              </th>
              {cols.map((col) => (
                <th key={col.key} scope="col" className="whitespace-nowrap px-2 py-2 font-medium">
                  {t(col.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const href = listingHref(listing);
              const title = listingShortTitle(listing);
              const zone = listingZone(listing);
              return (
                <tr key={listing.id || listing.slug} className="border-b border-white/10 align-top">
                  <th scope="row" className="sticky left-0 z-[1] bg-[#1a2441] px-2 py-2 font-semibold text-white">
                    <Link to={href} className="hover:text-[#f5d15a]">
                      {title}
                    </Link>
                    {zone ? <p className="font-normal text-white/60">{zone}</p> : null}
                  </th>
                  {cols.map((col) => {
                    const highlighted = best[col.key].includes(listing.id);
                    const value = col.value(listing);
                    return (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap px-2 py-2 ${value ? cellClass(highlighted) : 'text-white/30'}`}
                      >
                        {value ?? '—'}
                        {highlighted && value ? (
                          <span className="sr-only">{t('sunnyChat.best')}</span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SunnyPricePerM2Chart listings={listings} />
    </section>
  );
}
