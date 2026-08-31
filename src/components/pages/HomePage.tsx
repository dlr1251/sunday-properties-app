import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection';
import { PublishedPropertiesGrid } from '@/components/home/PublishedPropertiesGrid';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProperty } from '@/components/home/FeaturedProperty';
import { ExploreProperties } from '@/components/home/ExploreProperties';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Landmark, Scale, ShieldCheck, Sparkles, Zap } from 'lucide-react';

// Section wrapper with consistent styling
const Section: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  alternate?: boolean;
}> = ({ children, className = '', alternate = false }) => (
  <section className={`py-20 lg:py-24 ${alternate ? 'bg-secondary/30' : 'bg-background'} ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

// Section header component
const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  className?: string;
}> = ({ title, subtitle, className = '' }) => (
  <motion.div 
    className={`text-center mb-12 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </motion.div>
);

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('price');

  const highlights = useMemo(
    () => [
      {
        icon: ShieldCheck,
        title: t('home.features.secure'),
        description: t('home.howItWorks.whyFeatures.security.description'),
      },
      {
        icon: CheckCircle2,
        title: t('home.howItWorks.whyFeatures.verification.title'),
        description: t('home.howItWorks.whyFeatures.verification.description'),
      },
      {
        icon: Zap,
        title: t('home.features.smart'),
        description: t('home.howItWorks.whyFeatures.analysis.description'),
      },
    ],
    [t]
  );

  const handleSearch = (query: string) => {
    navigate(`/properties?q=${encodeURIComponent(query)}`);
  };

  const handlePropertySelect = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handlePropertyFavorite = (propertyId: string) => {
    console.log('Property favorited:', propertyId);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSearch={handleSearch} />

      {/* Linear-style product highlights */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-blueprint mask-blueprint-fade opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                <span>{t('home.howItWorks.badge')}</span>
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                {t('home.sections.howItWorksTitle')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('home.sections.howItWorksSubtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild className="h-11 px-5">
                  <Link to="/properties">
                    {t('home.hero.exploreProperties')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 px-5">
                  <Link to="/about">{t('home.hero.learnMore')}</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legal + financial transparency */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="relative p-8 sm:p-10">
              <div className="absolute inset-0 bg-blueprint opacity-50" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-5">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                    {t('home.transparency.title')}
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {t('home.transparency.subtitle')}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="h-11 px-5">
                      <Link to="/docs">
                        {t('home.transparency.ctaDocs')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 px-5">
                      <Link to="/database-schema">{t('home.transparency.ctaSchema')}</Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Landmark,
                        title: t('home.transparency.cards.fees.title'),
                        description: t('home.transparency.cards.fees.description'),
                      },
                      {
                        icon: Scale,
                        title: t('home.transparency.cards.legal.title'),
                        description: t('home.transparency.cards.legal.description'),
                      },
                      {
                        icon: CheckCircle2,
                        title: t('home.transparency.cards.audit.title'),
                        description: t('home.transparency.cards.audit.description'),
                      },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.title}
                          className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-sm p-5 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-secondary/70 flex items-center justify-center border border-border/40">
                              <Icon className="h-5 w-5 text-foreground" />
                            </div>
                            <p className="font-semibold text-foreground">{card.title}</p>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {card.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Property */}
      <Section alternate>
        <SectionHeader title={t('home.sections.featuredTitle')} subtitle={t('home.sections.featuredSubtitle')} />
        <FeaturedProperty onPropertySelect={handlePropertySelect} />
      </Section>

      {/* How it works (detailed) */}
      <Section>
        <HowItWorks />
      </Section>

      {/* Properties Grid */}
      <Section alternate>
        <SectionHeader title={t('home.sections.exploreTitle')} subtitle={t('home.sections.exploreSubtitle')} />
        <PublishedPropertiesGrid
          limit={12}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPropertySelect={handlePropertySelect}
          onPropertyFavorite={handlePropertyFavorite}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </Section>

      {/* Explore Properties */}
      <Section>
        <ExploreProperties />
      </Section>
    </div>
  );
};
