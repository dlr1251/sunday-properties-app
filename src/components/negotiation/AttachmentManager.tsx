import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  Image,
  Download,
  Trash2,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  offer_id: string;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface AttachmentManagerProps {
  offerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export function AttachmentManager({
  offerId,
  isOpen,
  onOpenChange,
  readOnly = false
}: AttachmentManagerProps) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen && offerId) {
      fetchAttachments();
    }
  }, [isOpen, offerId]);

  const fetchAttachments = async () => {
    if (!offerId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offer_attachments')
        .select('*')
        .eq('offer_id', offerId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Error al cargar archivos adjuntos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user || readOnly) return;

    const filesArray = Array.from(files);

    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    for (const file of filesArray) {
      if (file.size > maxSize) {
        toast.error(`El archivo ${file.name} es demasiado grande (máx. 10MB)`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido para ${file.name}`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `offer-attachments/${offerId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Save attachment record
        const { error: dbError } = await supabase
          .from('offer_attachments')
          .insert({
            offer_id: offerId,
            uploaded_by: user.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size
          });

        if (dbError) throw dbError;

        setUploadProgress(((i + 1) / filesArray.length) * 100);
      }

      toast.success('Archivos subidos exitosamente');
      await fetchAttachments();
      setUploadProgress(0);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = attachment.file_url;
      link.download = attachment.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  };

  const handleDelete = async (attachmentId: string, fileUrl: string) => {
    if (!user) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('offer_attachments')
        .delete()
        .eq('id', attachmentId)
        .eq('uploaded_by', user.id); // Only allow deleting own uploads

      if (dbError) throw dbError;

      // Delete from storage (optional - can be done via cleanup job)
      // For now, we'll leave files in storage and clean up periodically

      toast.success('Archivo eliminado');
      await fetchAttachments();
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      toast.error('Error al eliminar el archivo');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivos Adjuntos de la Oferta
          </DialogTitle>
          <p className="text-muted-foreground">
            Documentos compartidos durante la negociación
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Section */}
          {!readOnly && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subir Archivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">Subir documentos</p>
                      <p className="text-muted-foreground">
                        PDF, Word, imágenes (máx. 10MB cada uno)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                        disabled={uploading}
                      />
                      <Button
                        asChild
                        disabled={uploading}
                      >
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Seleccionar Archivos
                        </label>
                      </Button>
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subiendo archivos...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Archivos Adjuntos ({attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay archivos adjuntos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(attachment.file_type)}
                        <div>
                          <p className="font-medium">{attachment.file_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(attachment.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(attachment.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {attachment.file_type.split('/')[1]?.toUpperCase()}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {!readOnly && attachment.uploaded_by === user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attachment.id, attachment.file_url)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Directrices para Archivos</h4>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Sube documentos relevantes como escrituras, certificados, o propuestas detalladas</li>
                    <li>• Los archivos son visibles para ambas partes de la negociación</li>
                    <li>• Formatos permitidos: PDF, Word, imágenes, texto plano</li>
                    <li>• Tamaño máximo: 10MB por archivo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AttachmentManager;
