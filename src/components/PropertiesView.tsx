import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";
import { PropertyAvailabilitySettings } from "./PropertyAvailabilitySettings";

const mockProperties = [
  {
    id: "1",
    title: "Finca en El Retiro",
    area: "300m2",
    location: "Llanogrande, Rionegro",
    bedrooms: 2,
    bathrooms: 3,
    pool: "climatizada",
    price: "$700,000,000 COP",
    image: "https://images.unsplash.com/photo-1707299539593-a4e151b570e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvdW50cnlzaWRlJTIwdmlsbGF8ZW58MXx8fHwxNzYwOTEwNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    title: "Apartamento en Envigado",
    area: "120m2",
    location: "Zona Rosa, Envigado",
    bedrooms: 3,
    bathrooms: 2,
    pool: "comunal",
    price: "$450,000,000 COP",
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjA4OTU4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    title: "Casa Campestre Guarne",
    area: "450m2",
    location: "Vereda San Ignacio, Guarne",
    bedrooms: 4,
    bathrooms: 4,
    pool: "natural",
    price: "$950,000,000 COP",
    image: "https://images.unsplash.com/photo-1760265756109-91061e7c1a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    title: "Penthouse El Poblado",
    area: "180m2",
    location: "Manila, El Poblado",
    bedrooms: 3,
    bathrooms: 3,
    pool: "jacuzzi privado",
    price: "$1,200,000,000 COP",
    image: "https://images.unsplash.com/photo-1568115286680-d203e08a8be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjB2aWV3fGVufDF8fHx8MTc2MDkxMDU4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "5",
    title: "Casa Colonial La Ceja",
    area: "280m2",
    location: "Centro, La Ceja",
    bedrooms: 5,
    bathrooms: 3,
    pool: "no tiene",
    price: "$550,000,000 COP",
    image: "https://images.unsplash.com/photo-1635687673584-65866351f27a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbmlhbCUyMGhvdXNlJTIwZ2FyZGVufGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "6",
    title: "Cabaña Marinilla",
    area: "200m2",
    location: "Alto del Chocho, Marinilla",
    bedrooms: 3,
    bathrooms: 2,
    pool: "no tiene",
    price: "$380,000,000 COP",
    image: "https://images.unsplash.com/photo-1701825299870-398fb12864bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGNhYmluJTIwcmV0cmVhdHxlbnwxfHx8fDE3NjA4NTc4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

interface PropertiesViewProps {
  onPropertyClick?: (propertyId: string) => void;
}

export function PropertiesView({ onPropertyClick }: PropertiesViewProps) {
  const [selectedPropertyForSettings, setSelectedPropertyForSettings] = useState<{ id: string; title: string } | null>(null);

  const handleSettingsClick = (e: React.MouseEvent, propertyId: string, propertyTitle: string) => {
    e.stopPropagation(); // Prevent triggering property click
    setSelectedPropertyForSettings({ id: propertyId, title: propertyTitle });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-['Inter:Black',_sans-serif] font-black text-[20px] text-black">
        Mis Propiedades
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <div
            key={property.id}
            className="relative group"
          >
            <div
              onClick={() => onPropertyClick?.(property.id)}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <PropertyCard
                title={property.title}
                area={property.area}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                pool={property.pool}
                price={property.price}
                image={property.image}
              />
            </div>
            
            {/* Settings button overlay */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white shadow-lg"
                onClick={(e) => handleSettingsClick(e, property.id, property.title)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedPropertyForSettings && (
        <PropertyAvailabilitySettings
          open={!!selectedPropertyForSettings}
          onOpenChange={(open) => !open && setSelectedPropertyForSettings(null)}
          propertyTitle={selectedPropertyForSettings.title}
        />
      )}
    </div>
  );
}
