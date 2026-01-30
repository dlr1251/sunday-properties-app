import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  User,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  Home,
  Building2,
  DollarSign,
  BookOpen
} from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts = [
    {
      id: 1,
      title: 'Guía completa para comprar vivienda en Colombia 2025',
      excerpt: 'Todo lo que necesitas saber sobre el proceso de compra de propiedades en Colombia, incluyendo requisitos legales, financiamiento y consejos prácticos.',
      author: 'María González',
      date: '2025-01-15',
      readTime: '8 min',
      category: 'Guías',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Tendencias del mercado inmobiliario en Bogotá',
      excerpt: 'Análisis detallado de las tendencias actuales del mercado inmobiliario en la capital colombiana y proyecciones para los próximos meses.',
      author: 'Carlos Rodríguez',
      date: '2025-01-12',
      readTime: '6 min',
      category: 'Mercado',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Financiamiento hipotecario: opciones disponibles',
      excerpt: 'Conoce las diferentes opciones de crédito hipotecario disponibles en Colombia y cómo elegir la mejor opción para tu situación financiera.',
      author: 'Ana López',
      date: '2025-01-10',
      readTime: '5 min',
      category: 'Finanzas',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=300&fit=crop'
    }
  ];

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Blog Inmobiliario
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Información actualizada sobre el mercado inmobiliario colombiano,
              consejos prácticos y análisis de tendencias.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-gray-500">{post.readTime} de lectura</span>
                    </div>

                    <CardTitle className="line-clamp-2">
                      {post.title}
                    </CardTitle>

                    <p className="text-gray-600 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{post.date}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      Leer más
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <BookOpen className="w-12 h-12 text-blue-100 mx-auto" />
            <h2 className="text-3xl font-bold text-white">
              Mantente informado
            </h2>
            <p className="text-xl text-blue-100">
              Suscríbete a nuestro newsletter y recibe las últimas novedades del mercado inmobiliario.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                placeholder="Tu email"
                className="flex-1"
              />
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
