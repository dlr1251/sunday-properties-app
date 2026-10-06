import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BRAND_LOCATION } from '@/constants/brand';
import {
  Shield,
  FileCheck,
  MapPin,
  ArrowRight,
  Scale,
  Eye,
  Handshake,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const values = [
    {
      icon: Shield,
      title: t('pages.about.values.transparency.title'),
      description: t('pages.about.values.transparency.description'),
    },
    {
      icon: FileCheck,
      title: t('pages.about.values.clarity.title'),
      description: t('pages.about.values.clarity.description'),
    },
    {
      icon: Handshake,
      title: t('pages.about.values.trust.title'),
      description: t('pages.about.values.trust.description'),
    },
    {
      icon: Scale,
      title: t('pages.about.values.legal.title'),
      description: t('pages.about.values.legal.description'),
    },
  ];

  const pillars = [
    {
      icon: Eye,
      title: t('pages.about.pillars.visit.title'),
      description: t('pages.about.pillars.visit.description'),
    },
    {
      icon: FileCheck,
      title: t('pages.about.pillars.documents.title'),
      description: t('pages.about.pillars.documents.description'),
    },
    {
      icon: Handshake,
      title: t('pages.about.pillars.negotiation.title'),
      description: t('pages.about.pillars.negotiation.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-brand-hero pt-24 pb-20">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <BrandLogo to={null} heightClassName="h-14" variant="onDark" className="justify-center mb-8" />
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium mb-6">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>{BRAND_LOCATION}</span>
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6">
            {t('pages.about.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto">
            {t('pages.about.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
                {t('pages.about.mission.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('pages.about.mission.description')}
              </p>
              <ul className="space-y-3">
                {[
                  t('pages.about.mission.features.verified'),
                  t('pages.about.mission.features.visits'),
                  t('pages.about.mission.features.legal'),
                  t('pages.about.mission.features.transparent'),
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-foreground">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-gold shrink-0" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('pages.about.model.title')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('pages.about.model.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
              {t('pages.about.values.title')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pages.about.values.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-sky/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-brand-sky" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
              {t('pages.about.pillars.title')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pages.about.pillars.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/15 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-hero">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">{t('pages.about.cta.title')}</h2>
          <p className="text-lg text-white/80 mb-8">{t('pages.about.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" onClick={() => navigate('/properties')}>
              {t('pages.about.cta.explore')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate('/contact')}
            >
              {t('pages.about.cta.contact')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
