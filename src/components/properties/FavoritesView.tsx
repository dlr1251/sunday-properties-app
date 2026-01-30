import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from './PropertyCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Heart, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Car,
  Star,
  Eye,
  Trash2
} from 'lucide-react';

interface FavoriteProperty {
  id: string;
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    address: string;
    neighborhood: string;
    city: string;
    property_type: string;
    status: string;
    images: string[];
    verified: boolean;
    premium: boolean;
  };
  created_at: string;
  notes?: string;
}

export const FavoritesView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error removing favorite:', error);
        return;
      }

      setFavorites(prev => prev.filter(fav => fav.property.id !== propertyId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.property.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      (favorite.property.address || favorite.property.neighborhood || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === 'all' || 
      favorite.property.property_type === filterBy;

    return matchesSearch && matchesFilter;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.property.price - b.property.price;
      case 'price_desc':
        return b.property.price - a.property.price;
      case 'area_asc':
        return a.property.area - b.property.area;
      case 'area_desc':
        return b.property.area - a.property.area;
      case 'created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="text-gray-700 mt-1 font-semibold">
            {favorites.length} propiedades guardadas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            <Heart className="h-3 w-3 mr-1" />
            {favorites.length} favoritos
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="apartment">Apartamentos</SelectItem>
                <SelectItem value="house">Casas</SelectItem>
                <SelectItem value="townhouse">Casas Campestres</SelectItem>
                <SelectItem value="office">Oficinas</SelectItem>
                <SelectItem value="commercial">Locales</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Más recientes</SelectItem>
                <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="area_asc">Área: Menor a Mayor</SelectItem>
                <SelectItem value="area_desc">Área: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Favorites List */}
      {sortedFavorites.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' 
                ? 'No se encontraron favoritos' 
                : 'No tienes favoritos aún'
              }
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              {searchTerm || filterBy !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Explora propiedades y agrega las que te gusten a tus favoritos'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <Button onClick={() => navigate('/properties')}>
                <Eye className="h-4 w-4 mr-2" />
                Explorar Propiedades
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFavorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={favorite.property.images?.[0] || '/placeholder-property.jpg'}
                  alt={favorite.property.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Remove from favorites button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(favorite.property.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex space-x-2">
                  {favorite.property.verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Star className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {favorite.property.premium && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {favorite.property.title}
                </h3>
                
                <div className="flex items-center text-gray-700 mb-3">
                  <MapPin className="h-4 w-4 mr-1 text-gray-600" />
                  <span className="text-sm font-medium">{favorite.property.address}, {favorite.property.neighborhood}, {favorite.property.city}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(favorite.property.price)}
                  </div>
                  <Badge variant="secondary">
                    {favorite.property.property_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-700 mb-4 font-medium">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-gray-600" />
                      <span>{favorite.property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-gray-600" />
                      <span>{favorite.property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1 text-gray-600" />
                      <span>{favorite.property.area}m²</span>
                    </div>
                    {favorite.property.parking > 0 && (
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1 text-gray-600" />
                        <span>{favorite.property.parking}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    className="flex-1 font-semibold" 
                    size="sm"
                    onClick={() => navigate(`/properties/${favorite.property.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeFavorite(favorite.property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 text-xs font-medium text-gray-700">
                  Agregado el {new Date(favorite.created_at).toLocaleDateString('es-CO')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};