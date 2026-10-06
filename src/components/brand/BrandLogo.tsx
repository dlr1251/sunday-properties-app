import { Link } from 'react-router-dom';
import { BRAND_LOGO, BRAND_NAME } from '@/constants/brand';

type BrandLogoVariant = 'default' | 'onDark' | 'gold';

type BrandLogoProps = {
  to?: string | null;
  className?: string;
  heightClassName?: string;
  loading?: 'eager' | 'lazy';
  /** default = color on light; onDark = white on navy hero; gold = gold mark on dark */
  variant?: BrandLogoVariant;
};

export function BrandLogo({
  to = '/',
  className = '',
  heightClassName = 'h-12',
  loading = 'eager',
  variant = 'default',
}: BrandLogoProps) {
  const imgClass = `${heightClassName} w-auto object-contain`;

  const images =
    variant === 'onDark' ? (
      <img
        src={BRAND_LOGO.white}
        alt={to ? '' : BRAND_NAME}
        className={imgClass}
        loading={loading}
        decoding="async"
      />
    ) : variant === 'gold' ? (
      <img
        src={BRAND_LOGO.gold}
        alt={to ? '' : BRAND_NAME}
        className={imgClass}
        loading={loading}
        decoding="async"
      />
    ) : (
      <>
        <img
          src={BRAND_LOGO.color}
          alt={to ? '' : BRAND_NAME}
          className={`${imgClass} dark:hidden`}
          loading={loading}
          decoding="async"
        />
        <img
          src={BRAND_LOGO.gold}
          alt=""
          className={`${imgClass} hidden dark:block`}
          loading={loading}
          decoding="async"
        />
      </>
    );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={BRAND_NAME}
        className={`inline-flex items-center shrink-0 ${className}`}
      >
        {images}
      </Link>
    );
  }

  return <span className={`inline-flex items-center shrink-0 ${className}`}>{images}</span>;
}
