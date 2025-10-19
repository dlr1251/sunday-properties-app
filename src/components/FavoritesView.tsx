import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Trash2,
  Eye
} from 'lucide-react';
import { PropertyImage } from './PropertyImage';
import { useAuth } from '../../contexts/AuthContext';

interface FavoriteProperty {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  images: string[];
  addedAt: string;
  notes?: string;
}

export const FavoritesView: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'area'>('date');

  // Mock data - in real app this would come from Supabase
  const favoriteProperties: FavoriteProperty[] = [
    {
      id: '1',
      title: 'Apartamento Moderno en El Poblado',
      address: 'Carrera 43A #5-50',
      neighborhood: 'El Poblado',
      price: 450000000,
      bedrooms: 3,
      bathrooms: 2,
      area: 85,
      parking: 1,
      images: ['https://picsum.photos/800/600?random=1'],
      addedAt: '2024-01-15',
      notes: 'Me gusta mucho la ubicación',
    },
    {
      id: '2',
      title: 'Casa Familiar en Laureles',
      address: 'Calle 70 #45-23',
      neighborhood: 'Laureles',
      price: 380000000,
      bedrooms: 4,
      bathrooms: 3,
      area: 120,
      parking: 2,
      images: ['https://picsum.photos/800/600?random=2'],
      addedAt: '2024-01-12',
      notes: 'Casa perfecta para mi familia',
    },
    {
      id: '3',
      title: 'Apartamento en Envigado',
      address: 'Carrera 48 #30-15',
      neighborhood: 'Envigado',
      price: 280000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 65,
      parking: 1,
      images: ['https://picsum.photos/800/600?random=3'],
      addedAt: '2024-01-10',
      notes: 'Excelente precio en Envigado',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredProperties = favoriteProperties
    .filter(property => 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'area':
          return b.area - a.area;
        case 'date':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  const handleRemoveFavorite = (propertyId: string) => {
    // In real app, this would call Supabase to remove from favorites
    console.log('Remove favorite:', propertyId);
  };

  const handleScheduleVisit = (propertyId: string) => {
    // In real app, this would navigate to visit scheduling
    console.log('Schedule visit:', propertyId);
  };

  const handleMakeOffer = (propertyId: string) => {
    // In real app, this would navigate to offer creation
    console.log('Make offer:', propertyId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mis Favoritos ❤️
          </h1>
          <p className="text-muted-foreground mt-1">
            {favoriteProperties.length} propiedades guardadas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {favoriteProperties.length} Favoritos
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'date' | 'area')}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="date">Más recientes</option>
                <option value="price">Menor precio</option>
                <option value="area">Mayor área</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No tienes favoritos aún'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Explora propiedades y marca las que más te gusten como favoritas'
              }
            </p>
            {!searchTerm && (
              <Button>
                <MapPin className="mr-2 h-4 w-4" />
                Explorar Propiedades
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <PropertyImage
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveFavorite(property.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Badge className="absolute top-2 left-2 bg-red-500">
                  <Heart className="h-3 w-3 mr-1" />
                  Favorito
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.neighborhood}
                    </p>
                  </div>

                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(property.price)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.area}m²
                    </div>
                    {property.parking > 0 && (
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        {property.parking}
                      </div>
                    )}
                  </div>

                  {property.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Nota:</strong> {property.notes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Agregado el {formatDate(property.addedAt)}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Visitar
                    </Button>
                  </div>

                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleMakeOffer(property.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Hacer Oferta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredProperties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredProperties.length} de {favoriteProperties.length} propiedades favoritas
              </div>
              <div className="text-sm font-medium">
                Valor total: {formatCurrency(filteredProperties.reduce((sum, p) => sum + p.price, 0))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};