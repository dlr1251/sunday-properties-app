import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Scale, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Shield,
  Lightbulb,
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { KnowledgeBaseEntry } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface KnowledgeBasePanelProps {
  userId: string;
  propertyId?: string;
  context?: Record<string, any>;
}

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  userId,
  propertyId,
  context
}) => {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'fundamental' | 'best_practices' | 'advanced'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'legal' | 'financial' | 'tax' | 'process'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch knowledge base entries
  useEffect(() => {
    const fetchKnowledgeEntries = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (propertyId) {
          query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching knowledge entries:', error);
          return;
        }

        setKnowledgeEntries(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeEntries();
  }, [userId, propertyId]);

  // Filter entries based on selected filters
  useEffect(() => {
    let filtered = knowledgeEntries;

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(entry => entry.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  }, [knowledgeEntries, selectedLevel, selectedCategory, searchQuery]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fundamental':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'best_practices':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'advanced':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal':
        return <Scale className="h-4 w-4 text-red-500" />;
      case 'financial':
        return <Calculator className="h-4 w-4 text-green-500" />;
      case 'tax':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'process':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'fundamental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'best_practices':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'financial':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tax':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'process':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ is_read: true })
        .eq('id', entryId);

      if (error) {
        console.error('Error marking as read:', error);
        return;
      }

      setKnowledgeEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, isRead: true } : entry
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Base de Conocimiento</h2>
            <p className="text-muted-foreground">Asesoría legal y financiera personalizada</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredEntries.length} entradas
        </Badge>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en la base de conocimiento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex space-x-2">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedLevel === 'fundamental' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('fundamental')}
            >
              <Shield className="h-4 w-4 mr-1" />
              Fundamental
            </Button>
            <Button
              variant={selectedLevel === 'best_practices' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('best_practices')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mejores Prácticas
            </Button>
            <Button
              variant={selectedLevel === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel('advanced')}
            >
              <Star className="h-4 w-4 mr-1" />
              Avanzado
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todas
            </Button>
            <Button
              variant={selectedCategory === 'legal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('legal')}
            >
              <Scale className="h-4 w-4 mr-1" />
              Legal
            </Button>
            <Button
              variant={selectedCategory === 'financial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('financial')}
            >
              <Calculator className="h-4 w-4 mr-1" />
              Financiero
            </Button>
            <Button
              variant={selectedCategory === 'tax' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('tax')}
            >
              <FileText className="h-4 w-4 mr-1" />
              Fiscal
            </Button>
            <Button
              variant={selectedCategory === 'process' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('process')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Proceso
            </Button>
          </div>
        </div>
      </Card>

      {/* Knowledge Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No hay entradas de conocimiento
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedLevel !== 'all' || selectedCategory !== 'all'
                ? 'No se encontraron entradas con los filtros seleccionados'
                : 'La base de conocimiento se generará automáticamente mientras usas la plataforma'
              }
            </p>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
                !entry.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
              onClick={() => markAsRead(entry.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getLevelIcon(entry.level)}
                    {getCategoryIcon(entry.category)}
                    <h3 className="text-lg font-semibold text-foreground">
                      {entry.title}
                    </h3>
                    {!entry.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {entry.content}
                  </p>

                  <div className="flex items-center space-x-2 mb-4">
                    <Badge className={getLevelColor(entry.level)}>
                      {entry.level === 'fundamental' ? 'Fundamental' :
                       entry.level === 'best_practices' ? 'Mejores Prácticas' : 'Avanzado'}
                    </Badge>
                    <Badge className={getCategoryColor(entry.category)}>
                      {entry.category === 'legal' ? 'Legal' :
                       entry.category === 'financial' ? 'Financiero' :
                       entry.category === 'tax' ? 'Fiscal' : 'Proceso'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {entry.source === 'ai_generated' ? 'IA' : 'Manual'}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(entry.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
