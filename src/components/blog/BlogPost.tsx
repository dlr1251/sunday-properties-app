import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Share2,
  BookOpen,
  Clock
} from 'lucide-react';

interface BlogPostProps {
  postId: string;
  onBack: () => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ postId, onBack }) => {
  // Mock data - in real app this would come from Supabase
  const blogPost = {
    id: postId,
    title: 'La Promesa de Compraventa en Colombia: Guía Completa',
    slug: 'promesa-compraventa-colombia-guia-completa',
    content: `# La Promesa de Compraventa en Colombia: Guía Completa

## ¿Qué es una Promesa de Compraventa?

La promesa de compraventa es un contrato mediante el cual una persona se compromete a vender y otra a comprar un bien inmueble en un plazo determinado, bajo condiciones específicas acordadas entre las partes.

## Elementos Esenciales

### 1. Identificación de las Partes
- **Promitente vendedor**: Quien se compromete a vender
- **Promitente comprador**: Quien se compromete a comprar
- Datos completos de identificación (cédula, dirección, teléfono)

### 2. Descripción del Inmueble
- Dirección exacta
- Matrícula inmobiliaria
- Área del terreno y construcción
- Linderos y colindancias

### 3. Precio y Forma de Pago
- Precio total acordado
- Forma de pago (efectivo, financiación, mixto)
- Cronograma de pagos
- Garantías y fianzas

### 4. Plazos y Condiciones
- Fecha límite para el cumplimiento
- Condiciones suspensivas
- Penalidades por incumplimiento

## Ventajas de la Promesa de Compraventa

1. **Seguridad jurídica**: Protege tanto al comprador como al vendedor
2. **Flexibilidad**: Permite negociar términos específicos
3. **Tiempo para trámites**: Da plazo para obtener financiación
4. **Documentación**: Facilita la preparación de documentos legales

## Aspectos Legales Importantes

### Registro de Instrumento Público
La promesa debe ser registrada en la oficina de instrumentos públicos correspondiente para tener efectos frente a terceros.

### Impuestos y Gastos
- **Impuesto de Timbre**: 0.5% del valor del inmueble
- **Registro**: Tarifa según el valor
- **Notaría**: Honorarios del notario

### Condiciones Suspensivas Comunes
- Aprobación de crédito bancario
- Obtención de licencias
- Resolución de litigios
- Cumplimiento de requisitos legales

## Recomendaciones

1. **Asesoría legal**: Siempre consulte con un abogado especializado
2. **Verificación**: Confirme la legalidad del inmueble
3. **Documentación**: Tenga todos los documentos en orden
4. **Plazos**: Respete los tiempos acordados

## Conclusión

La promesa de compraventa es una herramienta fundamental en las transacciones inmobiliarias en Colombia. Su correcta elaboración y cumplimiento garantiza la seguridad jurídica de todas las partes involucradas.`,
    excerpt: 'Conoce todo sobre la promesa de compraventa en Colombia: elementos esenciales, ventajas, aspectos legales y recomendaciones para una transacción segura.',
    author: 'Dr. Andrés Morales',
    authorTitle: 'Abogado Especialista en Derecho Inmobiliario',
    category: 'Derecho Inmobiliario',
    publishedAt: '2024-01-15',
    viewCount: 156,
    featuredImage: 'https://picsum.photos/800/400?random=31',
    tags: ['promesa', 'compraventa', 'derecho', 'inmuebles', 'colombia'],
    readTime: '8 min',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogPost.title,
        text: blogPost.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Blog
      </Button>

      {/* Featured Image */}
      <div className="relative">
        <img
          src={blogPost.featuredImage}
          alt={blogPost.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-blue-100 text-blue-800">{blogPost.category}</Badge>
        </div>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {blogPost.title}
        </h1>
        
        <p className="text-xl text-muted-foreground">
          {blogPost.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <div>
              <p className="font-medium">{blogPost.author}</p>
              <p className="text-xs">{blogPost.authorTitle}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(blogPost.publishedAt)}
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            {blogPost.viewCount} vistas
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {blogPost.readTime} de lectura
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            {blogPost.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-foreground">
                    {paragraph.substring(2)}
                  </h1>
                );
              } else if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 text-foreground">
                    {paragraph.substring(3)}
                  </h2>
                );
              } else if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-medium mt-4 mb-2 text-foreground">
                    {paragraph.substring(4)}
                  </h3>
                );
              } else if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="ml-4 mb-1 text-muted-foreground">
                    {paragraph.substring(2)}
                  </li>
                );
              } else if (paragraph.startsWith('1. ')) {
                return (
                  <li key={index} className="ml-4 mb-1 text-muted-foreground">
                    {paragraph.substring(3)}
                  </li>
                );
              } else if (paragraph.trim() === '') {
                return <br key={index} />;
              } else {
                return (
                  <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
        </CardContent>
      </Card>

      {/* Author Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{blogPost.author}</h3>
              <p className="text-muted-foreground mb-2">{blogPost.authorTitle}</p>
              <p className="text-sm text-muted-foreground">
                Especialista en derecho inmobiliario con más de 10 años de experiencia 
                en transacciones inmobiliarias en Colombia. Miembro del Colegio de Abogados 
                de Medellín y experto en promesas de compraventa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Artículos Relacionados</CardTitle>
          <CardDescription>
            Más contenido que podría interesarte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <BookOpen className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Escrituras Públicas: Qué Son y Cómo Funcionan</h4>
                <p className="text-sm text-muted-foreground">Dra. Patricia Ruiz</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <BookOpen className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">El Rol de las Notarías en la Compra de Inmuebles</h4>
                <p className="text-sm text-muted-foreground">Dr. Andrés Morales</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
