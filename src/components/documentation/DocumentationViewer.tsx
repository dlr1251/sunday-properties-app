import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Estructura de navegación: User Docs (usuario) y Tech Docs (desarrolladores)
// pathEn: ruta en docs/en/ cuando difiere de path
const docStructure = {
  'index': { path: 'index.md', titleKey: 'docs.nav.index', icon: Home },
  'userDocs': {
    titleKey: 'docs.userDocs',
    icon: BookOpen,
    children: {
      'user-index': { path: 'user/index.md', pathEn: 'user/index.md', titleKey: 'docs.userIndex', icon: FileText },
      'user-types': { path: 'user/tipos-usuario.md', pathEn: 'user/user-types.md', titleKey: 'docs.userTypes', icon: FileText },
      'register': { path: 'user/registro.md', pathEn: 'user/register.md', titleKey: 'docs.register', icon: FileText },
      'verify': { path: 'user/verificacion.md', pathEn: 'user/verification.md', titleKey: 'docs.verify', icon: FileText },
      'visits': { path: 'user/visitas.md', pathEn: 'user/visits.md', titleKey: 'docs.visits', icon: Eye },
      'reschedule-visits': { path: 'user/reagendar-visitas.md', pathEn: 'user/reschedule-visits.md', titleKey: 'docs.rescheduleVisits', icon: Eye },
      'make-offer': { path: 'user/hacer-oferta.md', pathEn: 'user/make-offer.md', titleKey: 'docs.makeOffer', icon: Handshake },
      'counteroffer': { path: 'user/contraoferta.md', pathEn: 'user/counteroffer.md', titleKey: 'docs.counteroffer', icon: Handshake },
      'accept-offer': { path: 'user/aceptar-oferta.md', pathEn: 'user/accept-offer.md', titleKey: 'docs.acceptOffer', icon: Handshake },
      'sign-docs': { path: 'user/firmar-documentos.md', pathEn: 'user/sign-docs.md', titleKey: 'docs.signDocs', icon: FileText },
      'upload-property': { path: 'user/publicar-propiedad.md', pathEn: 'user/publish-property.md', titleKey: 'docs.nav.uploadProperty', icon: FileText },
      'edit-property': { path: 'user/editar-propiedad.md', pathEn: 'user/edit-property.md', titleKey: 'docs.editProperty', icon: FileText },
      'contact-lawyer': { path: 'user/contactar-abogado.md', pathEn: 'user/contact-lawyer.md', titleKey: 'docs.contactLawyer', icon: Scale },
      'terms': { path: 'user/terminos-y-condiciones.md', pathEn: 'user/terms-and-conditions.md', titleKey: 'docs.terms', icon: FileText },
      'privacy': { path: 'user/privacidad.md', pathEn: 'user/privacy.md', titleKey: 'docs.privacy', icon: FileText },
    }
  },
  'techDocs': {
    titleKey: 'docs.techDocs',
    icon: FileText,
    children: {
      'tech-index': { path: 'tech/index.md', pathEn: 'tech/index.md', titleKey: 'docs.techIndex', icon: FileText },
      'installation': { path: 'tech/instalacion.md', pathEn: 'tech/installation.md', titleKey: 'docs.installation', icon: FileText },
      'db-schema': { path: 'tech/esquema.md', pathEn: 'tech/schema.md', titleKey: 'docs.dbSchema', icon: FileText },
      'concepts': { path: 'tech/conceptos.md', pathEn: 'tech/concepts.md', titleKey: 'docs.concepts', icon: FileText },
      'architecture': { path: 'tech/arquitectura.md', pathEn: 'tech/architecture.md', titleKey: 'docs.architecture', icon: FileText },
      'api-auth': { path: 'tech/api-autenticacion.md', pathEn: 'tech/authentication.md', titleKey: 'docs.apiAuth', icon: FileText },
      'api-properties': { path: 'tech/api-propiedades.md', pathEn: 'tech/properties.md', titleKey: 'docs.apiProperties', icon: FileText },
      'api-offers': { path: 'tech/api-ofertas.md', pathEn: 'tech/offers.md', titleKey: 'docs.apiOffers', icon: FileText },
      'api-visits': { path: 'tech/api-visitas.md', pathEn: 'tech/visits.md', titleKey: 'docs.apiVisits', icon: FileText },
      'deployment': { path: 'tech/despliegue.md', pathEn: 'tech/deployment.md', titleKey: 'docs.deployment', icon: FileText },
      'migrations': { path: 'tech/migraciones.md', pathEn: 'tech/migrations.md', titleKey: 'docs.migrations', icon: FileText },
      'monitoring': { path: 'tech/monitoreo.md', pathEn: 'tech/monitoring.md', titleKey: 'docs.monitoring', icon: FileText },
    }
  },
};

// Función helper fuera del componente para evitar problemas de inicialización
type DocConfigItem = { path: string; pathEn?: string; titleKey: string; icon: any };
const findDocConfig = (id: string): DocConfigItem | null => {
  // Buscar en estructura plana
  if (docStructure[id as keyof typeof docStructure] && 'path' in docStructure[id as keyof typeof docStructure]) {
    return docStructure[id as keyof typeof docStructure] as DocConfigItem;
  }
  
  // Buscar en hijos
  for (const key in docStructure) {
    const item = docStructure[key as keyof typeof docStructure];
    if ('children' in item && item.children) {
      if (item.children[id as keyof typeof item.children]) {
        return item.children[id as keyof typeof item.children] as DocConfigItem;
      }
    }
  }
  
  return null;
};

/** Resuelve la ruta del documento según el idioma (EN usa pathEn cuando existe). */
const getDocPath = (config: DocConfigItem | null, lang: string): string | null => {
  if (!config?.path) return null;
  if (lang === 'en' && config.pathEn) return config.pathEn;
  return config.path;
};

interface DocumentationViewerProps {
  defaultDoc?: string;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ defaultDoc = 'index' }) => {
  const { docId } = useParams<{ docId?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['userDocs', 'techDocs']));

  const currentDoc = docId || defaultDoc;
  const docConfig = findDocConfig(currentDoc);
  const currentLang = i18n.resolvedLanguage || i18n.language || 'es';
  const docPath = getDocPath(docConfig, currentLang);

  useEffect(() => {
    if (docPath) {
      loadDocument(docPath);
    } else {
      setLoading(false);
      setContent('');
      setError(null);
    }
  }, [currentDoc, docPath, currentLang]);

  const loadDocument = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar desde archivos estáticos bilingües en public/docs/<lang>/
      const langPath = `${currentLang}/${path}`;
      const response = await fetch(`/docs/${langPath}`);
      
      if (!response.ok) {
        throw new Error(t('docs.notFound'));
      }
      
      const text = await response.text();
      const looksLikeHtml = /^\s*<(\!DOCTYPE|html|meta|script|link)\s/i.test(text) || /<\/html>\s*$/i.test(text);
      if (looksLikeHtml) {
        throw new Error('El servidor devolvió HTML en lugar del documento. Ejecuta `npm run copy-docs` y reinicia el servidor.');
      }
      setContent(text);
    } catch (err) {
      console.error('Error loading document:', err);
      const errorMessage = err instanceof Error ? err.message : t('common.error');
      setError(errorMessage);
      setContent(`# ${t('docs.notFound')}\n\n${errorMessage}\n\n${t('common.tryAgain')}`);
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
    const title = item.titleKey ? t(item.titleKey) : item.title;

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
              <span className="text-sm font-medium text-gray-900">{title}</span>
            </div>
            <ChevronRight 
              className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          </button>
          {isExpanded && item.children && (
            <div className="mt-1 ml-2">
              {Object.entries(item.children).map(([childKey, childItem]: [string, any]) => {
                const childTitle = childItem.titleKey ? t(childItem.titleKey) : childItem.title;
                return (
                  <button
                    key={childKey}
                    onClick={() => navigateToDoc(childKey)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors text-left ${
                      currentDoc === childKey ? 'bg-primary/10 text-primary font-medium' : 'text-gray-800'
                    }`}
                  >
                    {childItem.icon && <childItem.icon className="w-4 h-4" />}
                    <span className="text-sm">{childTitle}</span>
                  </button>
                );
              })}
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
        <span className="text-sm">{title}</span>
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
                <h2 className="font-semibold text-lg text-gray-900">{t('docs.title')}</h2>
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
                placeholder={t('docs.search')}
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
                <h1 className="text-xl font-semibold text-gray-900">{t(docConfig.titleKey)}</h1>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/docs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('docs.backToIndex')}
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

