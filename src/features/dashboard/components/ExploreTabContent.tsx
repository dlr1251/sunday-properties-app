import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertiesView } from '@/components/properties/PropertiesView';
import { PropertyDetailView } from '@/components/properties/PropertyDetailView';

/**
 * Dashboard "Explorar" tab: shows all properties list, and when a property
 * is selected shows its detail in-place (within the dashboard) via ?property=id.
 */
export function ExploreTabContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('property');

  const handlePropertyClick = (id: string) => {
    setSearchParams({ tab: 'explore', property: id });
  };

  const handleBack = () => {
    setSearchParams({ tab: 'explore' });
  };

  if (propertyId) {
    return <PropertyDetailView propertyId={propertyId} onBack={handleBack} />;
  }

  return <PropertiesView onPropertyClick={handlePropertyClick} />;
}
