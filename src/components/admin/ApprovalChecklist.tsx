import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Home, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Property } from '../../types/property';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ApprovalChecklistProps {
  property: Property;
  onApprove: (notes: string) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
}

interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  critical: boolean;
}

const checklistItems: ChecklistItem[] = [
  // Documentos Legales
  { id: 'doc_clyt', category: 'Documentos Legales', description: 'CLYT presentado y analizado por IA', critical: true },
  { id: 'doc_escritura', category: 'Documentos Legales', description: 'Escritura Pública presentada y analizada', critical: true },
  { id: 'doc_cedula', category: 'Documentos Legales', description: 'Cédula del propietario presentada', critical: true },
  { id: 'doc_sin_embargos', category: 'Documentos Legales', description: 'Sin anotaciones problemáticas (embargos, prohibiciones)', critical: true },
  
  // Información de Propiedad
  { id: 'info_direccion', category: 'Información de Propiedad', description: 'Dirección completa y verificable', critical: true },
  { id: 'info_precio', category: 'Información de Propiedad', description: 'Precio de venta o alquiler establecido', critical: true },
  { id: 'info_caracteristicas', category: 'Información de Propiedad', description: 'Características físicas documentadas', critical: false },
  { id: 'info_fotografias', category: 'Información de Propiedad', description: 'Fotografías de calidad disponibles', critical: false },
  
  // Análisis y Transparencia
  { id: 'analysis_disponible', category: 'Análisis y Transparencia', description: 'Análisis financiero básico disponible', critical: false },
  { id: 'analysis_ia', category: 'Análisis y Transparencia', description: 'Documentos legales analizados por IA correctamente', critical: false },
  { id: 'analysis_negociacion', category: 'Análisis y Transparencia', description: 'Términos de negociación configurados (si aplica)', critical: false },
  { id: 'analysis_consistencia', category: 'Análisis y Transparencia', description: 'Sin información contradictoria detectada', critical: true },
  
  // Estándares de Plataforma
  { id: 'standards_propietario', category: 'Estándares de Plataforma', description: 'Propietario verificado y en buen estado', critical: true },
  { id: 'standards_terminos', category: 'Estándares de Plataforma', description: 'Términos y condiciones aceptados', critical: true },
  { id: 'standards_disponibilidad', category: 'Estándares de Plataforma', description: 'Disponibilidad para visitas configurada', critical: false },
  { id: 'standards_politicas', category: 'Estándares de Plataforma', description: 'No viola políticas de contenido', critical: true },
];

export const ApprovalChecklist: React.FC<ApprovalChecklistProps> = ({
  property,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleToggle = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleApprove = () => {
    onApprove(adminNotes);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    onReject(rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  // Group items by category
  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Calculate progress
  const totalItems = checklistItems.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  const criticalItems = checklistItems.filter(item => item.critical);
  const criticalChecked = criticalItems.filter(item => checkedItems[item.id]).length;
  const allCriticalChecked = criticalChecked === criticalItems.length;

  const canApprove = allCriticalChecked && checkedCount >= Math.ceil(totalItems * 0.8); // At least 80% checked

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documentos Legales':
        return <FileText className="h-4 w-4" />;
      case 'Información de Propiedad':
        return <Home className="h-4 w-4" />;
      case 'Análisis y Transparencia':
        return <DollarSign className="h-4 w-4" />;
      case 'Estándares de Plataforma':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checklist de Aprobación</CardTitle>
              <CardDescription>
                Verificación de cumplimiento de estándares y políticas de Sunday Properties
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {checkedCount} / {totalItems} completados
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progreso general</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Warning if critical items not checked */}
      {!allCriticalChecked && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atención:</strong> Debes verificar todos los ítems críticos antes de aprobar esta propiedad.
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist Items by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <CardTitle className="text-lg">{category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    checkedItems[item.id] 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={() => handleToggle(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={item.id}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {item.description}
                      {item.critical && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Crítico
                        </Badge>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notas del Administrador
          </CardTitle>
          <CardDescription>
            Agrega notas internas sobre la aprobación (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ej: Documentos en excelente estado. Propietario verificado. Lista para publicar."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive"
              disabled={isLoading}
            >
              Rechazar Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Propiedad</DialogTitle>
              <DialogDescription>
                Proporciona una razón detallada para el rechazo. Esta información será visible para el propietario.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Ej: Documentos legales incompletos. Faltan: CLYT actualizado"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isLoading}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={handleApprove}
          disabled={!canApprove || isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            'Procesando...'
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprobar Propiedad
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 text-center">
        <p>
          Al aprobar esta propiedad, confirmas que cumple con los{' '}
          <a 
            href="/documents/terms-and-conditions" 
            target="_blank" 
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Términos y Condiciones <ExternalLink className="h-3 w-3" />
          </a>
          {' '}de Sunday Properties.
        </p>
      </div>
    </div>
  );
};

