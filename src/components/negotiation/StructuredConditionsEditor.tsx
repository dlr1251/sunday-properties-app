import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  CheckCircle,
  X,
  MessageSquare,
  History,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { offerConditionsService, ConditionType, ConditionStatus, ConditionProposer } from '../../services/offerConditions.service';
import { OfferCondition } from '../../types/database';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StructuredConditionsEditorProps {
  offerId: string;
  offer: any;
  property: any;
  userRole: 'buyer' | 'seller' | 'lawyer';
  onConditionAdded?: (condition: OfferCondition) => void;
  onConditionUpdated?: (condition: OfferCondition) => void;
}

export const StructuredConditionsEditor: React.FC<StructuredConditionsEditorProps> = ({
  offerId,
  offer,
  property,
  userRole,
  onConditionAdded,
  onConditionUpdated
}) => {
  const [conditions, setConditions] = useState<OfferCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [newCondition, setNewCondition] = useState<any>({
    type: 'custom',
    displayText: '',
    notes: ''
  });

  const { user } = useAuth();

  // Load conditions
  const loadConditions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await offerConditionsService.getConditionsByOffer(offerId);
      if (result.ok) {
        setConditions(result.data);
      }
    } catch (error) {
      console.error('Error loading conditions:', error);
      toast.error('Error al cargar condiciones');
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const ts = await offerConditionsService.getConditionTemplates(property?.property_type);
        setTemplates(ts);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };
    loadTemplates();
  }, [property?.property_type]);

  // Load conditions on mount
  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

  // Handle accept condition
  const handleAcceptCondition = async (condition: OfferCondition) => {
    setLoading(true);
    try {
      const result = await offerConditionsService.updateConditionStatus({
        conditionId: condition.id,
        status: 'accepted'
      });

      if (result.ok) {
        await loadConditions();
        onConditionUpdated?.(result.data);
        toast.success('Condición aceptada');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al aceptar condición');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject condition
  const handleRejectCondition = async (condition: OfferCondition) => {
    setLoading(true);
    try {
      const result = await offerConditionsService.updateConditionStatus({
        conditionId: condition.id,
        status: 'rejected'
      });

      if (result.ok) {
        await loadConditions();
        onConditionUpdated?.(result.data);
        toast.success('Condición rechazada');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al rechazar condición');
    } finally {
      setLoading(false);
    }
  };

  // Handle counter condition
  const handleCounterCondition = async (condition: OfferCondition) => {
    // TODO: Implement counter dialog
    toast.info('Funcionalidad de contraoferta próximamente');
  };

  // Handle add condition
  const handleAddCondition = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      const result = await offerConditionsService.createCondition({
        offerId,
        conditionType: newCondition.type,
        conditionKey: newCondition.type,
        conditionValue: { description: newCondition.displayText },
        conditionDisplayText: newCondition.displayText,
        proposedBy: userRole,
        proposerUserId: user.id,
        notes: newCondition.notes,
        priority: 50
      });

      if (result.ok) {
        await loadConditions();
        onConditionAdded?.(result.data);
        toast.success('Condición agregada');
        setShowAddDialog(false);
        setNewCondition({ type: 'custom', displayText: '', notes: '' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar condición');
    } finally {
      setLoading(false);
    }
  };

  // Get status variant
  const getStatusVariant = (status: ConditionStatus): 'default' | 'secondary' | 'success' | 'warning' => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'warning';
      case 'countered': return 'secondary';
      default: return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: ConditionStatus): string => {
    switch (status) {
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'countered': return 'Contraofertada';
      case 'proposed': return 'Propuesta';
      case 'withdrawn': return 'Retirada';
      default: return status;
    }
  };

  // Get proposer label
  const getProposerLabel = (proposedBy: ConditionProposer): string => {
    switch (proposedBy) {
      case 'buyer': return 'Comprador';
      case 'seller': return 'Vendedor';
      case 'lawyer': return 'Abogado';
      case 'agent': return 'Agente';
      default: return proposedBy;
    }
  };

  // Get condition type label
  const getConditionTypeLabel = (type: ConditionType): string => {
    const labels: Record<ConditionType, string> = {
      price: 'Precio',
      payment_method: 'Método de Pago',
      closing_date: 'Fecha de Cierre',
      delivery_date: 'Fecha de Entrega',
      deed_signing_date: 'Fecha de Firma de Escritura',
      notary_costs_distribution: 'Distribución de Gastos Notariales',
      promesa_compraventa_terms: 'Términos de Promesa',
      inspection_contingency: 'Inspección Técnica',
      financing_contingency: 'Aprobación de Financiación',
      appraisal_contingency: 'Avalúo',
      title_contingency: 'Estudio de Títulos',
      repairs_required: 'Reparaciones',
      appliances_included: 'Electrodomésticos',
      custom: 'Personalizada'
    };
    return labels[type] || type;
  };

  // Render condition card
  const renderConditionCard = (condition: OfferCondition) => {
    const canEdit = (
      (userRole === 'buyer' && condition.proposed_by === 'seller') ||
      (userRole === 'seller' && condition.proposed_by === 'buyer')
    );
    
    return (
      <Card key={condition.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {getConditionTypeLabel(condition.condition_type)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {condition.condition_display_text}
              </p>
            </div>
            <Badge variant={getStatusVariant(condition.status)}>
              {getStatusLabel(condition.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Condition details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Propuesto por:</span>
              <span className="font-medium">{getProposerLabel(condition.proposed_by)}</span>
            </div>
            
            {condition.npv_impact && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Impacto VPN:</span>
                <span className={cn(
                  "font-medium flex items-center gap-1",
                  condition.npv_impact > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {condition.npv_impact > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  ${Math.abs(condition.npv_impact).toLocaleString()}
                </span>
              </div>
            )}
            
            {condition.risk_impact && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Riesgo:</span>
                <div className="flex items-center gap-2">
                  <Progress value={condition.risk_impact} className="w-20 h-2" />
                  <span className="text-xs">{condition.risk_impact}%</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          {canEdit && condition.status === 'proposed' && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleAcceptCondition(condition)}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCounterCondition(condition)}
                disabled={loading}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Contraofertar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRejectCondition(condition)}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" />
                Rechazar
              </Button>
            </div>
          )}
          
          {/* Condition history */}
          {condition.parent_condition_id && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2"
              onClick={() => {
                toast.info('Historial de condición próximamente');
              }}
            >
              <History className="w-4 h-4 mr-1" />
              Ver historial
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Condiciones de la Oferta</h3>
        <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Añadir Condición
        </Button>
      </div>
      
      {/* Conditions list */}
      {loading && conditions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Cargando condiciones...</div>
      ) : conditions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay condiciones en esta oferta
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map(renderConditionCard)}
        </div>
      )}
      
      {/* Add condition dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nueva Condición</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo de Condición</Label>
              <Select
                value={newCondition.type}
                onValueChange={(value) => setNewCondition({ ...newCondition, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.key} value={t.type}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={newCondition.displayText}
                onChange={(e) => setNewCondition({ ...newCondition, displayText: e.target.value })}
                placeholder="Describe la condición..."
                rows={3}
              />
            </div>

            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={newCondition.notes}
                onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddCondition}
              disabled={loading || !newCondition.displayText}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

