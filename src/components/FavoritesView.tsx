import { PropertyCard } from "./PropertyCard";

const mockFavorites = [
  {
    id: "1",
    title: "Apartamento Laureles",
    area: "95m2",
    location: "Laureles, Medellín",
    bedrooms: 2,
    bathrooms: 2,
    pool: "comunal",
    price: "$380,000,000 COP",
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjA4OTU4Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    title: "Finca Carmen de Viboral",
    area: "520m2",
    location: "Vereda El Rosario, Carmen de Viboral",
    bedrooms: 5,
    bathrooms: 4,
    pool: "natural",
    price: "$850,000,000 COP",
    image: "https://images.unsplash.com/photo-1707299539593-a4e151b570e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvdW50cnlzaWRlJTIwdmlsbGF8ZW58MXx8fHwxNzYwOTEwNTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    title: "Casa en La Estrella",
    area: "180m2",
    location: "La Tablaza, La Estrella",
    bedrooms: 3,
    bathrooms: 3,
    pool: "no tiene",
    price: "$420,000,000 COP",
    image: "https://images.unsplash.com/photo-1635687673584-65866351f27a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbmlhbCUyMGhvdXNlJTIwZ2FyZGVufGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    title: "Lote Sabaneta",
    area: "250m2",
    location: "Las Lomitas, Sabaneta",
    bedrooms: 0,
    bathrooms: 0,
    pool: "no aplica",
    price: "$320,000,000 COP",
    image: "https://images.unsplash.com/photo-1760265756109-91061e7c1a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGVzdGF0ZSUyMHByb3BlcnR5fGVufDF8fHx8MTc2MDkxMDU4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

interface FavoritesViewProps {
  onPropertyClick?: (propertyId: string) => void;
}

export function FavoritesView({ onPropertyClick }: FavoritesViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-['Inter:Black',_sans-serif] font-black text-[20px] text-black">
        Mis Favoritos
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFavorites.map((property) => (
          <div
            key={property.id}
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
        ))}
      </div>
    </div>
  );
}
