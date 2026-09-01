import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  Building2,
  Shield,
  TrendingUp
} from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (filters: string) => void;
  className?: string;
}

// Animation variants for staggered children
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
  onSearch,
  className = ''
}) => {
  const { t } = useTranslation();
  
  const features = [
    { icon: Building2, label: t('home.features.properties') },
    { icon: Shield, label: t('home.features.secure') },
    { icon: TrendingUp, label: t('home.features.smart') },
  ];

  return (
    <section className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-hero ${className}`}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-blueprint mask-blueprint-fade opacity-30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading - Display typography */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight text-balance font-display">
              {t('home.hero.title')}{' '}
              <span className="text-brand-gold-light">{t('home.hero.titleHighlight')}</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl text-balance"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="w-full max-w-3xl mt-10">
            <SearchBar 
              variant="hero" 
              onSearch={onSearch}
            />
          </motion.div>

          {/* Features Row */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 mt-10"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.label}
                  className="flex items-center gap-2 text-sm text-white/80"
                >
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-brand-gold-light" />
                  </div>
                  <span>{feature.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          >
            <Button size="lg" variant="accent" asChild className="h-12 px-8 text-base">
              <Link to="/properties">
                {t('home.hero.exploreProperties')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link to="/about">
                {t('home.hero.learnMore')}
              </Link>
            </Button>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1">
          <motion.div 
            className="w-1.5 h-2.5 bg-brand-gold-light rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};