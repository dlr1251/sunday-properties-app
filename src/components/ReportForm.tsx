import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Flag, AlertTriangle, Upload, X, FileText } from 'lucide-react';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  reportedPropertyId?: string;
  reportedVisitId?: string;
  reportedUserName?: string;
  reportedPropertyTitle?: string;
  trigger?: React.ReactNode;
}

export function ReportForm({
  isOpen,
  onClose,
  reportedUserId,
  reportedPropertyId,
  reportedVisitId,
  reportedUserName,
  reportedPropertyTitle,
  trigger
}: ReportFormProps) {
  const [formData, setFormData] = useState({
    report_type: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    evidence_files: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleFileUpload = (files: FileList) => {
    const maxFiles = 5;
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

    const newFiles = Array.from(files).filter(file => {
      if (file.size > maxFileSize) {
        toast.error(`Archivo ${file.name} es demasiado grande. Máximo 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de archivo no permitido: ${file.name}`);
        return false;
      }
      return true;
    });

    if (formData.evidence_files.length + newFiles.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidence_files: [...prev.evidence_files, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence_files: prev.evidence_files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.report_type || !formData.title || !formData.description) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!acceptTerms) {
      toast.error('Debes aceptar los términos para enviar la denuncia');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload evidence files if any
      let evidenceUrls: string[] = [];

      if (formData.evidence_files.length > 0) {
        for (const file of formData.evidence_files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `reports/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);

          evidenceUrls.push(urlData.publicUrl);
        }
      }

      // Create the report
      const { error } = await supabase.from('reports').insert({
        reporter_id: (await supabase.auth.getUser()).data.user?.id,
        reported_user_id: reportedUserId,
        reported_property_id: reportedPropertyId,
        reported_visit_id: reportedVisitId,
        report_type: formData.report_type,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : null
      });

      if (error) throw error;

      toast.success('Denuncia enviada exitosamente. Nuestro equipo la revisará pronto.');
      onClose();

      // Reset form
      setFormData({
        report_type: '',
        title: '',
        description: '',
        priority: 'medium',
        evidence_files: []
      });
      setAcceptTerms(false);

    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error('Error al enviar la denuncia. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam o contenido no deseado',
      fraud: 'Fraude o actividad sospechosa',
      inappropriate_content: 'Contenido inapropiado',
      harassment: 'Acoso o comportamiento ofensivo',
      fake_listing: 'Anuncio falso o engañoso',
      scam: 'Posible estafa',
      copyright_violation: 'Violación de derechos de autor',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  return (
    <>
      {trigger && (
        <div onClick={() => {}}>
          {trigger}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              Reportar Contenido
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reported Content Info */}
            {(reportedUserName || reportedPropertyTitle) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estás reportando:</strong>
                  {reportedUserName && <div>Usuario: {reportedUserName}</div>}
                  {reportedPropertyTitle && <div>Propiedad: {reportedPropertyTitle}</div>}
                </AlertDescription>
              </Alert>
            )}

            {/* Report Type */}
            <div>
              <Label htmlFor="report_type">Tipo de Denuncia *</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de denuncia..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam o contenido no deseado</SelectItem>
                  <SelectItem value="fraud">Fraude o actividad sospechosa</SelectItem>
                  <SelectItem value="inappropriate_content">Contenido inapropiado</SelectItem>
                  <SelectItem value="harassment">Acoso o comportamiento ofensivo</SelectItem>
                  <SelectItem value="fake_listing">Anuncio falso o engañoso</SelectItem>
                  <SelectItem value="scam">Posible estafa</SelectItem>
                  <SelectItem value="copyright_violation">Violación de derechos de autor</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Título de la Denuncia *</Label>
              <Input
                id="title"
                placeholder="Breve descripción del problema..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descripción Detallada *</Label>
              <Textarea
                id="description"
                placeholder="Explica detalladamente el problema, incluyendo cuándo ocurrió, qué sucedió y por qué crees que viola las normas..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/2000 caracteres
              </p>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja - Problema menor</SelectItem>
                  <SelectItem value="medium">Media - Requiere atención</SelectItem>
                  <SelectItem value="high">Alta - Problema serio</SelectItem>
                  <SelectItem value="critical">Crítica - Violación grave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Evidence Upload */}
            <div>
              <Label>Evidencia (opcional)</Label>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Arrastra archivos aquí o{' '}
                      <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        selecciona archivos
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 5 archivos, 10MB cada uno. Formatos: JPG, PNG, GIF, PDF
                    </p>
                  </div>
                </div>

                {/* File List */}
                {formData.evidence_files.length > 0 && (
                  <div className="space-y-2">
                    {formData.evidence_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(1)}MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="accept_terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="accept_terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los términos y condiciones *
                </label>
                <p className="text-xs text-muted-foreground">
                  Confirmo que esta denuncia es veraz y no tiene fines maliciosos.
                  Las denuncias falsas pueden resultar en la suspensión de mi cuenta.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Denuncia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ReportForm;
