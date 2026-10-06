import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  BRAND_EMAIL,
  BRAND_EMAIL_HREF,
  BRAND_LOCATION,
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_PHONE_HREF,
} from '@/constants/brand';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <BrandLogo heightClassName="h-16" loading="lazy" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('nav.company')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('nav.properties')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('properties.title')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('pages.contact.info.title')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href={BRAND_EMAIL_HREF} className="hover:text-foreground transition-colors">
                  {BRAND_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href={BRAND_PHONE_HREF} className="hover:text-foreground transition-colors">
                  {BRAND_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{BRAND_LOCATION}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {BRAND_NAME}. {t('common.allRightsReserved')}.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/docs/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('docs.terms')}
              </Link>
              <Link to="/docs/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('docs.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}