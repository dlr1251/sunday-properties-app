import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Search,
  Menu,
  X,
  Home,
  FileText,
  Eye,
  Handshake,
  Scale,
  MessageSquare,
  LayoutDashboard,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

// Estructura de navegación de documentación
const docStructure = {
  'index': { path: 'index.md', title: 'Inicio', icon: Home },
  'getting-started': { path: 'getting-started.md', title: 'Inicio Rápido', icon: FileText },
  'properties': {
    title: 'Propiedades',
    icon: Home,
    children: {
      'upload-property': { path: 'properties/upload-property.md', title: 'Subir Propiedad', icon: FileText },
      'manage-properties': { path: 'properties/manage-properties.md', title: 'Gestionar Propiedades', icon: Eye },
    }
  },
  'visits': {
    title: 'Visitas',
    icon: Eye,
    children: {
      'schedule-visits': { path: 'visits/schedule-visits.md', title: 'Agendar Visitas', icon: FileText },
      'manage-visits': { path: 'visits/manage-visits.md', title: 'Gestionar Visitas', icon: Eye },
    }
  },
  'negotiations': {
    title: 'Negociaciones',
    icon: Handshake,
    children: {
      'create-offers': { path: 'negotiations/create-offers.md', title: 'Crear Ofertas', icon: FileText },
      'counter-offers': { path: 'negotiations/counter-offers.md', title: 'Contraofertas', icon: Handshake },
    }
  },
  'legal': {
    title: 'Legal',
    icon: Scale,
    children: {
      'cases': { path: 'legal/cases.md', title: 'Casos Legales', icon: FileText },
      'documents': { path: 'legal/documents.md', title: 'Documentos Legales', icon: FileText },
    }
  },
  'communication': {
    title: 'Comunicación',
    icon: MessageSquare,
    children: {
      'chat': { path: 'communication/chat.md', title: 'Sistema de Chat', icon: MessageSquare },
    }
  },
  'dashboards': {
    title: 'Dashboards',
    icon: LayoutDashboard,
    children: {
      'user-dashboard': { path: 'dashboards/user-dashboard.md', title: 'Dashboard Usuario', icon: LayoutDashboard },
      'seller-dashboard': { path: 'dashboards/seller-dashboard.md', title: 'Dashboard Vendedor', icon: LayoutDashboard },
      'agent-dashboard': { path: 'dashboards/agent-dashboard.md', title: 'Dashboard Agente', icon: LayoutDashboard },
      'lawyer-dashboard': { path: 'dashboards/lawyer-dashboard.md', title: 'Dashboard Abogado', icon: LayoutDashboard },
      'admin-dashboard': { path: 'dashboards/admin-dashboard.md', title: 'Dashboard Admin', icon: LayoutDashboard },
    }
  },
  'faq': { path: 'faq.md', title: 'Preguntas Frecuentes', icon: FileText },
  'troubleshooting': { path: 'troubleshooting.md', title: 'Solución de Problemas', icon: FileText },
};

// Función helper fuera del componente para evitar problemas de inicialización
const findDocConfig = (id: string): { path: string; title: string; icon: any } | null => {
  // Buscar en estructura plana
  if (docStructure[id as keyof typeof docStructure] && 'path' in docStructure[id as keyof typeof docStructure]) {
    return docStructure[id as keyof typeof docStructure] as { path: string; title: string; icon: any };
  }
  
  // Buscar en hijos
  for (const key in docStructure) {
    const item = docStructure[key as keyof typeof docStructure];
    if ('children' in item && item.children) {
      if (item.children[id as keyof typeof item.children]) {
        return item.children[id as keyof typeof item.children];
      }
    }
  }
  
  return null;
};

interface DocumentationViewerProps {
  defaultDoc?: string;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ defaultDoc = 'index' }) => {
  const { docId } = useParams<{ docId?: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['properties', 'visits', 'negotiations', 'legal']));

  const currentDoc = docId || defaultDoc;
  const docConfig = findDocConfig(currentDoc);

  useEffect(() => {
    if (docConfig?.path) {
      loadDocument(docConfig.path);
    }
  }, [currentDoc, docConfig?.path]);

  const loadDocument = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar desde archivos estáticos en public/docs/
      const response = await fetch(`/docs/${path}`);
      
      if (!response.ok) {
        throw new Error(`No se pudo cargar el documento: ${path}`);
      }
      
      const text = await response.text();
      setContent(text);
    } catch (err) {
      console.error('Error loading document:', err);
      // Fallback: mostrar mensaje de error útil
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo cargar el documento. Asegúrate de que el archivo existe en /docs/${path}`);
      setContent(`# Documento no encontrado\n\nEl documento "${path}" no está disponible en este momento.\n\n**Error:** ${errorMessage}\n\nPor favor, navega a otro documento desde el menú lateral o contacta soporte si el problema persiste.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToDoc = (docId: string) => {
    navigate(`/docs/${docId}`);
  };

  const renderNavItem = (key: string, item: any, level: number = 0) => {
    const isActive = currentDoc === key;
    const hasChildren = 'children' in item && item.children;
    const isExpanded = expandedSections.has(key);
    const Icon = item.icon || FileText;

    if (hasChildren) {
      return (
        <div key={key} className={`mb-1 ${level > 0 ? 'ml-4' : ''}`}>
          <button
            onClick={() => toggleSection(key)}
            className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors ${
              isActive ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-gray-700" />}
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
            </div>
            <ChevronRight 
              className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </button>
          {isExpanded && item.children && (
            <div className="mt-1 ml-2">
              {Object.entries(item.children).map(([childKey, childItem]: [string, any]) => (
                <button
                  key={childKey}
                  onClick={() => navigateToDoc(childKey)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors text-left ${
                    currentDoc === childKey ? 'bg-primary/10 text-primary font-medium' : 'text-gray-800'
                  }`}
                >
                  {childItem.icon && <childItem.icon className="w-4 h-4" />}
                  <span className="text-sm">{childItem.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={key}
        onClick={() => navigateToDoc(key)}
        className={`w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors text-left ${
          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-800'
        } ${level > 0 ? 'ml-4' : ''}`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm">{item.title}</span>
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg text-gray-900">Documentación</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {Object.entries(docStructure).map(([key, item]) => renderNavItem(key, item))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Bar */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            {docConfig && (
              <div className="flex items-center gap-2">
                {docConfig.icon && <docConfig.icon className="w-5 h-5 text-primary" />}
                <h1 className="text-xl font-semibold text-gray-900">{docConfig.title}</h1>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/docs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="bg-white">
                <CardContent className="p-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-sm">
                <CardContent className="p-8 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800 prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ node, ...props }: any) => {
                        const href = props.href;
                        if (href?.startsWith('../') || href?.startsWith('./')) {
                          // Convertir enlaces relativos a rutas de documentación
                          const docPath = href.replace(/^\.\.?\//, '').replace(/\.md$/, '');
                          return (
                            <a
                              {...props}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                navigateToDoc(docPath);
                              }}
                              className="text-primary hover:text-primary/80 hover:underline font-medium"
                            />
                          );
                        }
                        return <a {...props} className="text-primary hover:text-primary/80 hover:underline font-medium" />;
                      },
                      h1: ({ node, ...props }: any) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />,
                      h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                      h3: ({ node, ...props }: any) => <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2" {...props} />,
                      h4: ({ node, ...props }: any) => <h4 className="text-lg font-semibold text-gray-900 mt-3 mb-2" {...props} />,
                      p: ({ node, ...props }: any) => <p className="text-gray-800 leading-7 mb-4" {...props} />,
                      li: ({ node, ...props }: any) => <li className="text-gray-800 mb-1" {...props} />,
                      strong: ({ node, ...props }: any) => <strong className="text-gray-900 font-semibold" {...props} />,
                      code: ({ node, ...props }: any) => {
                        const isInline = !props.className;
                        if (isInline) {
                          return <code className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />;
                        }
                        return <code {...props} />;
                      },
                      blockquote: ({ node, ...props }: any) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-4" {...props} />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

