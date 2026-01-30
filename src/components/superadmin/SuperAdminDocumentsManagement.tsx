import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { FileText, Search, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ResourceDetailDialog } from './ResourceDetailDialog';

export function SuperAdminDocumentsManagement() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch from legal_documents and case_documents
      const [legalDocs, caseDocs] = await Promise.all([
        supabase
          .from('legal_documents')
          .select(`
            *,
            property:properties(id, title),
            offer:offers(id)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('case_documents')
          .select(`
            *,
            case:cases(id)
          `)
          .order('created_at', { ascending: false })
      ]);

      const allDocs = [
        ...(legalDocs.data || []).map((d: any) => ({ ...d, type: 'legal' })),
        ...(caseDocs.data || []).map((d: any) => ({ ...d, type: 'case' }))
      ];

      setDocuments(allDocs);
    } catch (error: any) {
      toast.error('Error al cargar documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, type: string) => {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;

    try {
      const table = type === 'legal' ? 'legal_documents' : 'case_documents';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', docId);

      if (error) throw error;
      toast.success('Documento eliminado exitosamente');
      fetchDocuments();
    } catch (error: any) {
      toast.error('Error al eliminar documento: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      signed: { label: 'Firmado', variant: 'default' as const },
      draft: { label: 'Borrador', variant: 'outline' as const },
      pending_signature: { label: 'Pendiente Firma', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'default' as const }
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestión de Documentos</h2>
        <p className="text-muted-foreground">
          Ver y gestionar todos los documentos legales del sistema
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocuments.length})</CardTitle>
          <CardDescription>Todos los documentos legales</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron documentos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Título</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Versión</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Creado</th>
                    <th className="text-right p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{doc.title || doc.document_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.property?.title || doc.case?.id || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{doc.document_type}</Badge>
                      </td>
                      <td className="p-4">{doc.version || 1}</td>
                      <td className="p-4">{getStatusBadge(doc.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDocumentId(doc.id);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.document_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.document_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id, doc.type)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <ResourceDetailDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setSelectedDocumentId(null);
          }
        }}
        resourceType="document"
        resourceId={selectedDocumentId}
        onUpdate={() => {
          fetchDocuments();
        }}
      />
    </div>
  );
}

