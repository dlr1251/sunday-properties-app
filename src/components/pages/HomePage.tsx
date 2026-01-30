import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyGrid } from '@/components/home/PropertyGrid';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturedProperty } from '@/components/home/FeaturedProperty';
import { ExploreProperties } from '@/components/home/ExploreProperties';

// Mock data for properties
const mockProperties = [
  {
    id: "1",
    title: "Finca en El Retiro",
    area: "300m2",
    location: "Llanogrande, Rionegro",
    bedrooms: 2,
    bathrooms: 3,
    price: "$700,000,000 COP",
    image: "https://images.unsplash.com/photo-1707299539593-a4e151b570e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvdW50cnlzaWRlJTIwdmlsbGF8ZW58MXx8fHwxNzYwOTEwNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    verified: true,
    premium: true
  },
  {
    id: "2",
    title: "Apartamento en Envigado",
    area: "120m2",
    location: "Zona Rosa, Envigado",
    bedrooms: 3,
    bathrooms: 2,
    price: "$450,000,000 COP",
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjA4OTU4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    verified: true,
    premium: false
  },
  {
    id: "3",
    title: "Casa Campestre Guarne",
    area: "450m2",
    location: "Vereda San Ignacio, Guarne",
    bedrooms: 4,
    bathrooms: 4,
    price: "$950,000,000 COP",
    image: "https://images.unsplash.com/photo-1760265756109-91061e7c1a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    verified: true,
    premium: true
  },
  {
    id: "4",
    title: "Penthouse El Poblado",
    area: "180m2",
    location: "Manila, El Poblado",
    bedrooms: 3,
    bathrooms: 3,
    price: "$1,200,000,000 COP",
    image: "https://images.unsplash.com/photo-1568115286680-d203e08a8be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjB2aWV3fGVufDF8fHx8MTc2MDkxMDU4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    verified: true,
    premium: true
  },
  {
    id: "5",
    title: "Casa Colonial La Ceja",
    area: "280m2",
    location: "Centro, La Ceja",
    bedrooms: 5,
    bathrooms: 3,
    price: "$550,000,000 COP",
    image: "https://images.unsplash.com/photo-1635687673584-65866351f27a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbmlhbCUyMGhvdXNlJTIwZ2FyZGVufGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    verified: true,
    premium: false
  },
  {
    id: "6",
    title: "Cabaña Marinilla",
    area: "200m2",
    location: "Alto del Chocho, Marinilla",
    bedrooms: 3,
    bathrooms: 2,
    price: "$380,000,000 COP",
    image: "https://images.unsplash.com/photo-1701825299870-398fb12864bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmluJTIwcmV0cmVhdHxlbnwxfHx8fDE3NjA4NTc4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.4,
    verified: true,
    premium: false
  }
];

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
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Featured Property */}
      <Section alternate>
        <SectionHeader 
          title={t('home.sections.featuredTitle')}
          subtitle={t('home.sections.featuredSubtitle')}
        />
        <FeaturedProperty onPropertySelect={handlePropertySelect} />
      </Section>

      {/* How It Works */}
      <Section>
        <SectionHeader 
          title={t('home.sections.howItWorksTitle')}
          subtitle={t('home.sections.howItWorksSubtitle')}
        />
        <HowItWorks />
      </Section>

      {/* Properties Grid */}
      <Section alternate>
        <SectionHeader 
          title={t('home.sections.exploreTitle')}
          subtitle={t('home.sections.exploreSubtitle')}
        />
        <PropertyGrid
          properties={mockProperties}
          loading={false}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPropertySelect={handlePropertySelect}
          onPropertyFavorite={handlePropertyFavorite}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </Section>

      {/* Explore Properties CTA */}
      <Section>
        <ExploreProperties />
      </Section>
    </div>
  );
};
