import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SearchBar, type HomeSearchValues } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onFiltersChange?: (filters: HomeSearchValues) => void;
  rentalsHref: string;
  salesHref: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFiltersChange,
  rentalsHref,
  salesHref,
  className = '',
}) => {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, label: t('home.features.secure') },
    { icon: TrendingUp, label: t('home.features.smart') },
  ];

  return (
    <section className={`relative flex min-h-0 items-start justify-center overflow-x-hidden bg-brand-hero py-16 pb-28 sm:min-h-[90vh] sm:items-center sm:pb-16 ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-blueprint mask-blueprint-fade opacity-30" />
      </div>

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-8 lg:px-12">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight text-balance font-display">
              {t('home.hero.title')}{' '}
              <span className="text-brand-gold-light">{t('home.hero.titleHighlight')}</span>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl text-balance"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 w-full min-w-0 max-w-3xl sm:mt-10">
            <SearchBar variant="hero" onFiltersChange={onFiltersChange} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10 sm:gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-brand-gold-light" />
                  </div>
                  <span>{feature.label}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 pr-24 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:pr-0"
          >
            <Button size="lg" variant="accent" asChild className="h-12 min-h-12 w-full px-8 text-base sm:w-auto">
              <Link to={rentalsHref}>{t('home.hero.rentals')}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 min-h-12 w-full px-8 text-base sm:w-auto !bg-transparent border-white/40 !text-white hover:!bg-white/10 hover:!text-white"
            >
              <Link to={salesHref}>{t('home.hero.sales')}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1">
          <motion.div
            className="w-1.5 h-2.5 bg-brand-gold-light rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};
