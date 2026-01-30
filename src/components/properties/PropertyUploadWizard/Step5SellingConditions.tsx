import React, { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Edit2, Save, X } from 'lucide-react';
import type { PropertyData, PaymentStage } from './types';

interface Step5SellingConditionsProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onPriceChange: (value: string) => void;
  onVisitPriceChange: (value: string) => void;
  onCommissionChange: (value: string) => void;
  onAcceptsCryptoChange: (checked: boolean) => void;
  onFinancingChange: (checked: boolean) => void;
  onPaymentStagesChange?: (stages: PaymentStage[]) => void;
  onTimeframesChange?: (timeframes: { opcionToPromesa: number; promesaToEscrituras: number }) => void;
}

export const Step5SellingConditions: React.FC<Step5SellingConditionsProps> = ({
  propertyData,
  formatPrice,
  onPriceChange,
  onVisitPriceChange,
  onCommissionChange,
  onAcceptsCryptoChange,
  onFinancingChange,
  onPaymentStagesChange,
  onTimeframesChange,
}) => {
  console.log('💰 Step5SellingConditions rendering with data:', propertyData);

  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editedStages, setEditedStages] = useState<PaymentStage[]>([]);
  const [editedTimeframes, setEditedTimeframes] = useState(propertyData.stageTimeframes || { opcionToPromesa: 15, promesaToEscrituras: 30 });

  // Initialize edited stages when paymentStages are available
  useEffect(() => {
    if (propertyData.paymentStages) {
      setEditedStages(propertyData.paymentStages);
    }
  }, [propertyData.paymentStages]);

  const handleNumericInputChange = useCallback((handler: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔢 Numeric input changed:', e.target.value);
    handler(e.target.value);
  }, []);

  const handleCheckboxChange = useCallback((handler: (checked: boolean) => void) => (checked: boolean | "indeterminate") => {
    console.log('☑️ Checkbox changed:', checked);
    handler(!!checked);
  }, []);

  const handlePercentageChange = useCallback((stageIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedStages(prev => {
      const newStages = [...prev];
      newStages[stageIndex] = {
        ...newStages[stageIndex],
        percentage: numValue,
        amount: (propertyData.price * numValue) / 100
      };
      return newStages;
    });
  }, [propertyData.price]);

  const handleDaysChange = useCallback((field: 'opcionToPromesa' | 'promesaToEscrituras', value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedTimeframes(prev => ({
      ...prev,
      [field]: numValue
    }));
  }, []);

  const saveChanges = () => {
    console.log('💾 Saving changes:', { editedStages, editedTimeframes });
    
    // Propagate changes to parent component
    if (onPaymentStagesChange) {
      onPaymentStagesChange(editedStages);
    }
    if (onTimeframesChange) {
      onTimeframesChange(editedTimeframes);
    }
    
    setEditingStage(null);
  };

  const cancelEdit = () => {
    setEditedStages(propertyData.paymentStages || []);
    setEditedTimeframes(propertyData.stageTimeframes || { opcionToPromesa: 15, promesaToEscrituras: 30 });
    setEditingStage(null);
  };

  const totalPercentage = editedStages.reduce((sum, stage) => sum + stage.percentage, 0);
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01; // Allow small rounding differences

  return (
    <div className="space-y-6">
      {/* Basic Price Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio de Venta (COP) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={propertyData.price}
            onChange={handleNumericInputChange(onPriceChange)}
          />
          {propertyData.price > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatPrice(propertyData.price)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="visitPrice">Precio de Visita (COP)</Label>
          <Input
            id="visitPrice"
            type="number"
            min="0"
            value={propertyData.visitPrice}
            onChange={handleNumericInputChange(onVisitPriceChange)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Precio recomendado: $49,000 COP
          </p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Opciones de Pago</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptsCrypto"
            checked={propertyData.acceptsCrypto}
            onCheckedChange={handleCheckboxChange(onAcceptsCryptoChange)}
          />
          <Label htmlFor="acceptsCrypto">Acepta pagos en criptomonedas</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="financing"
            checked={propertyData.financing}
            onCheckedChange={handleCheckboxChange(onFinancingChange)}
          />
          <Label htmlFor="financing">Ofrece opciones de financiación</Label>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">Comisión de la Plataforma</h4>
        <p className="text-sm text-muted-foreground">
          Comisión del {propertyData.commission}% sobre el valor de venta
        </p>
        {propertyData.price > 0 && (
          <p className="text-lg font-semibold text-primary mt-2">
            {formatPrice(propertyData.price * (propertyData.commission / 100))}
          </p>
        )}
      </div>

      {/* Payment Stages */}
      {propertyData.paymentStages && propertyData.paymentStages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Condiciones de Pago por Etapas</Label>
              {propertyData.paymentStages && !editingStage && (
                <Badge variant="outline">Generadas con IA</Badge>
              )}
            </div>
            {!editingStage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingStage('all')}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>

          {editingStage ? (
            <>
              {/* Editable Stages */}
              {editedStages.map((stage, index) => (
                <Card key={stage.type} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-semibold text-base">{stage.name}</h5>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label className="text-sm">Porcentaje (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={stage.percentage}
                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Monto (COP)</Label>
                      <Input
                        type="text"
                        value={formatPrice(stage.amount)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  {stage.contingencies && stage.contingencies.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Condiciones:</Label>
                      <ul className="space-y-1">
                        {stage.contingencies.map((contingency, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {contingency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}

              {/* Timeframe Configuration */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <Label className="text-base font-semibold mb-3 block">Plazos Entre Etapas</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Días Opción → Promesa</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editedTimeframes.opcionToPromesa}
                      onChange={(e) => handleDaysChange('opcionToPromesa', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Días Promesa → Escrituras</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editedTimeframes.promesaToEscrituras}
                      onChange={(e) => handleDaysChange('promesaToEscrituras', e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Total Percentage Warning */}
              {!isValidTotal && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⚠️ Los porcentajes deben sumar 100% (actual: {totalPercentage.toFixed(1)}%)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={saveChanges} disabled={!isValidTotal}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Read-only View */}
              {propertyData.paymentStages.map((stage) => (
                <Card key={stage.type} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-base">{stage.name}</h5>
                        <Badge variant="secondary">{stage.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatPrice(stage.amount)}
                      </p>
                    </div>
                  </div>

                  {stage.contingencies && stage.contingencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <Label className="text-sm font-semibold mb-2 block">Condiciones:</Label>
                      <ul className="space-y-1">
                        {stage.contingencies.map((contingency, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {contingency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}

              {/* Timeframe Summary */}
              {propertyData.stageTimeframes && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <Label className="text-sm font-semibold mb-2 block">Plazos Entre Etapas</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Opción → Promesa</p>
                      <p className="font-semibold">{propertyData.stageTimeframes.opcionToPromesa} días</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Promesa → Escrituras</p>
                      <p className="font-semibold">{propertyData.stageTimeframes.promesaToEscrituras} días</p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {!propertyData.paymentStages && propertyData.price > 0 && propertyData.area > 0 && (
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Generando condiciones con IA...</span>
        </div>
      )}
    </div>
  );
};