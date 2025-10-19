import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  BookOpen,
  Filter,
  ArrowRight
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  publishedAt: string;
  viewCount: number;
  featuredImage: string;
  tags: string[];
}

interface BlogListProps {
  onPostSelect: (postId: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({ onPostSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - in real app this would come from Supabase
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'La Promesa de Compraventa en Colombia: Guía Completa',
      slug: 'promesa-compraventa-colombia-guia-completa',
      excerpt: 'Conoce todo sobre la promesa de compraventa en Colombia: elementos esenciales, ventajas, aspectos legales y recomendaciones para una transacción segura.',
      author: 'Dr. Andrés Morales',
      category: 'Derecho Inmobiliario',
      publishedAt: '2024-01-15',
      viewCount: 156,
      featuredImage: 'https://picsum.photos/800/400?random=31',
      tags: ['promesa', 'compraventa', 'derecho', 'inmuebles', 'colombia'],
    },
    {
      id: '2',
      title: 'Escrituras Públicas: Qué Son y Cómo Funcionan',
      slug: 'escrituras-publicas-que-son-como-funcionan',
      excerpt: 'Descubre qué son las escrituras públicas, cómo funcionan, qué tipos existen y cuál es el proceso completo para elaborarlas correctamente.',
      author: 'Dra. Patricia Ruiz',
      category: 'Derecho Inmobiliario',
      publishedAt: '2024-01-12',
      viewCount: 89,
      featuredImage: 'https://picsum.photos/800/400?random=32',
      tags: ['escrituras', 'notaria', 'derecho', 'inmuebles', 'documentos'],
    },
    {
      id: '3',
      title: 'Cómo Usar Sundap Properties: Guía Paso a Paso',
      slug: 'como-usar-sundap-properties-guia-paso-paso',
      excerpt: 'Aprende a utilizar todas las funcionalidades de Sundap Properties para encontrar, negociar y comprar tu propiedad ideal de forma segura.',
      author: 'Equipo Sundap',
      category: 'Guías de Usuario',
      publishedAt: '2024-01-10',
      viewCount: 234,
      featuredImage: 'https://picsum.photos/800/400?random=33',
      tags: ['guia', 'usuario', 'tutorial', 'plataforma'],
    },
    {
      id: '4',
      title: 'El Rol de las Notarías en la Compra de Inmuebles',
      slug: 'rol-notarias-compra-inmuebles',
      excerpt: 'Entiende la importancia de las notarías en las transacciones inmobiliarias y cómo garantizan la seguridad jurídica de tu compra.',
      author: 'Dr. Andrés Morales',
      category: 'Derecho Inmobiliario',
      publishedAt: '2024-01-08',
      viewCount: 67,
      featuredImage: 'https://picsum.photos/800/400?random=34',
      tags: ['notaria', 'derecho', 'seguridad', 'juridica'],
    },
    {
      id: '5',
      title: 'Propiedad Horizontal: Derechos y Obligaciones',
      slug: 'propiedad-horizontal-derechos-obligaciones',
      excerpt: 'Conoce los derechos y obligaciones que tienes como propietario en un régimen de propiedad horizontal en Colombia.',
      author: 'Dra. Patricia Ruiz',
      category: 'Derecho Inmobiliario',
      publishedAt: '2024-01-05',
      viewCount: 123,
      featuredImage: 'https://picsum.photos/800/400?random=35',
      tags: ['propiedad', 'horizontal', 'derechos', 'obligaciones'],
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'Derecho Inmobiliario', name: 'Derecho Inmobiliario' },
    { id: 'Guías de Usuario', name: 'Guías de Usuario' },
    { id: 'Noticias de la Plataforma', name: 'Noticias de la Plataforma' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Blog Legal 📚
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Información legal especializada y guías prácticas para tus transacciones inmobiliarias
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <Card className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={filteredPosts[0].featuredImage}
                alt={filteredPosts[0].title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Destacado
                  </Badge>
                  <Badge variant="outline">{filteredPosts[0].category}</Badge>
                </div>
                <h2 className="text-2xl font-bold">{filteredPosts[0].title}</h2>
                <p className="text-muted-foreground">{filteredPosts[0].excerpt}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {filteredPosts[0].author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(filteredPosts[0].publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {filteredPosts[0].viewCount} vistas
                  </div>
                </div>
                <Button 
                  onClick={() => onPostSelect(filteredPosts[0].id)}
                  className="w-full md:w-auto"
                >
                  Leer Artículo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.slice(1).map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPostSelect(post.id)}>
            <div className="relative">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <Badge className="absolute top-2 left-2">{post.category}</Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.viewCount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Leer Más
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron artículos</h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda o selecciona una categoría diferente
            </p>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
          <CardDescription>
            Explora artículos por tema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
