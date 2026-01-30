import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  User,
  Users,
  Settings,
  Bell,
  RefreshCw
} from 'lucide-react';

interface OfferValidity {
  durationDays: number;
  startDate: string;
  endDate: string;
  modifiableBy: 'buyer' | 'seller' | 'both' | 'neither';
  autoExtend: boolean;
  autoExtendDays: number;
  autoExtendConditions: string[];
  notifyBeforeExpiry: boolean;
  notificationDays: number;
  expiryActions: string[];
  customConditions?: string;
}

interface OfferValiditySectionProps {
  validity: OfferValidity;
  onValidityChange: (validity: OfferValidity) => void;
  className?: string;
}

export function OfferValiditySection({
  validity,
  onValidityChange,
  className = ''
}: OfferValiditySectionProps) {

  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateEndDate = (startDate: string, durationDays: number): string => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + durationDays);
    return start.toISOString().split('T')[0];
  };

  const updateValidity = (updates: Partial<OfferValidity>) => {
    const newValidity = { ...validity, ...updates };

    // Recalcular endDate si cambian startDate o durationDays
    if (updates.startDate || updates.durationDays) {
      newValidity.endDate = calculateEndDate(
        newValidity.startDate,
        newValidity.durationDays
      );
    }

    onValidityChange(newValidity);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(validity.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = () => {
    const total = validity.durationDays;
    const remaining = getTimeRemaining();
    const elapsed = total - remaining;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getStatusColor = () => {
    const remaining = getTimeRemaining();
    if (remaining > 7) return 'text-green-600';
    if (remaining > 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModifiableByLabel = (modifiableBy: string) => {
    switch (modifiableBy) {
      case 'buyer': return 'Solo el comprador';
      case 'seller': return 'Solo el vendedor';
      case 'both': return 'Ambos (comprador y vendedor)';
      case 'neither': return 'Ninguno (fijo)';
      default: return modifiableBy;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeRemaining = getTimeRemaining();
  const progressPercentage = getProgressPercentage();
  const isExpiringSoon = timeRemaining <= 7;
  const isExpired = timeRemaining <= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Validez de la Oferta
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Vista Simple' : 'Vista Avanzada'}
            </Button>
          </div>
        </CardTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {isExpired ? 'EXPIRADA' : `${timeRemaining} días restantes`}
            </div>
            <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'default'}>
              {isExpired ? 'Expirada' : isExpiringSoon ? 'Por expirar' : 'Vigente'}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-600">
            Desde {formatDate(validity.startDate)} hasta {formatDate(validity.endDate)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (días) *</Label>
            <Input
              id="duration"
              type="number"
              value={validity.durationDays}
              onChange={(e) => updateValidity({ durationDays: Number(e.target.value) })}
              min={1}
              max={365}
            />
            <p className="text-xs text-gray-500">
              Duración típica: 30-90 días para ofertas inmobiliarias
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de inicio *</Label>
            <Input
              id="startDate"
              type="date"
              value={validity.startDate}
              onChange={(e) => updateValidity({ startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="modifiableBy">¿Quién puede modificar la validez?</Label>
          <Select
            value={validity.modifiableBy}
            onValueChange={(value: 'buyer' | 'seller' | 'both' | 'neither') =>
              updateValidity({ modifiableBy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Solo el comprador</SelectItem>
              <SelectItem value="seller">Solo el vendedor</SelectItem>
              <SelectItem value="both">Ambos (comprador y vendedor)</SelectItem>
              <SelectItem value="neither">Ninguno (duración fija)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {getModifiableByLabel(validity.modifiableBy)}
          </p>
        </div>

        {/* Sección avanzada */}
        {showAdvanced && (
          <div className="space-y-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración Avanzada
            </h4>

            {/* Extensión automática */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="autoExtend"
                  checked={validity.autoExtend}
                  onCheckedChange={(checked) => updateValidity({ autoExtend: !!checked })}
                />
                <Label htmlFor="autoExtend" className="font-medium">
                  Extensión automática de validez
                </Label>
              </div>

              {validity.autoExtend && (
                <div className="ml-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="autoExtendDays">Días adicionales</Label>
                      <Input
                        id="autoExtendDays"
                        type="number"
                        value={validity.autoExtendDays}
                        onChange={(e) => updateValidity({ autoExtendDays: Number(e.target.value) })}
                        min={1}
                        max={90}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Condiciones para extensión automática</Label>
                    <div className="space-y-2">
                      {[
                        'Ambas partes han firmado documentos previos',
                        'Pago inicial recibido',
                        'Inspección técnica completada',
                        'Crédito aprobado (si aplica)',
                        'Documentos legales en revisión'
                      ].map((condition, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            id={`condition-${index}`}
                            checked={validity.autoExtendConditions.includes(condition)}
                            onCheckedChange={(checked) => {
                              const newConditions = checked
                                ? [...validity.autoExtendConditions, condition]
                                : validity.autoExtendConditions.filter(c => c !== condition);
                              updateValidity({ autoExtendConditions: newConditions });
                            }}
                          />
                          <Label htmlFor={`condition-${index}`} className="text-sm">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notificaciones */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notifyBeforeExpiry"
                  checked={validity.notifyBeforeExpiry}
                  onCheckedChange={(checked) => updateValidity({ notifyBeforeExpiry: !!checked })}
                />
                <Label htmlFor="notifyBeforeExpiry" className="font-medium">
                  Notificaciones de vencimiento
                </Label>
              </div>

              {validity.notifyBeforeExpiry && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="notificationDays">Días antes del vencimiento</Label>
                    <Input
                      id="notificationDays"
                      type="number"
                      value={validity.notificationDays}
                      onChange={(e) => updateValidity({ notificationDays: Number(e.target.value) })}
                      min={1}
                      max={30}
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Se enviarán recordatorios por email y notificaciones en la plataforma
                  </p>
                </div>
              )}
            </div>

            {/* Acciones al vencer */}
            <div className="space-y-3">
              <Label>Acciones automáticas al vencer</Label>
              <div className="space-y-2">
                {[
                  'Marcar oferta como expirada',
                  'Notificar a ambas partes',
                  'Archivar negociación',
                  'Liberar fondos de arras (si aplica)',
                  'Generar reporte de vencimiento'
                ].map((action, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      id={`action-${index}`}
                      checked={validity.expiryActions.includes(action)}
                      onCheckedChange={(checked) => {
                        const newActions = checked
                          ? [...validity.expiryActions, action]
                          : validity.expiryActions.filter(a => a !== action);
                        updateValidity({ expiryActions: newActions });
                      }}
                    />
                    <Label htmlFor={`action-${index}`} className="text-sm">
                      {action}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Condiciones personalizadas */}
            <div className="space-y-2">
              <Label htmlFor="customConditions">Condiciones personalizadas</Label>
              <textarea
                id="customConditions"
                value={validity.customConditions || ''}
                onChange={(e) => updateValidity({ customConditions: e.target.value })}
                placeholder="Condiciones especiales para la validez de la oferta..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Alertas y recomendaciones */}
        <div className="space-y-3">
          {isExpired && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>¡Oferta expirada!</strong> Esta oferta ya no es válida.
                Contacta con la otra parte para renegociar los términos.
              </AlertDescription>
            </Alert>
          )}

          {isExpiringSoon && !isExpired && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                <strong>Oferta por expirar:</strong> Quedan {timeRemaining} días.
                Considera extender la validez o acelerar el proceso de negociación.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recomendación legal:</strong> En Colombia, las ofertas inmobiliarias
              deben tener una duración razonable (30-90 días) según el Código Civil.
              Duraciones muy cortas pueden ser consideradas de mala fe.
            </AlertDescription>
          </Alert>

          {validity.modifiableBy === 'both' && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Ambas partes pueden modificar:</strong> Tanto comprador como vendedor
                pueden solicitar extensiones de plazo. Se recomienda documentar todas las modificaciones.
              </AlertDescription>
            </Alert>
          )}

          {validity.autoExtend && validity.autoExtendConditions.length === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Has activado extensión automática pero no has definido condiciones.
                La oferta podría extenderse indefinidamente sin control.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Resumen de configuración */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resumen de Validez
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Duración:</span>
              <p>{validity.durationDays} días</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Modificable por:</span>
              <p>{getModifiableByLabel(validity.modifiableBy)}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Extensión automática:</span>
              <p>{validity.autoExtend ? 'Activada' : 'Desactivada'}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Notificaciones:</span>
              <p>{validity.notifyBeforeExpiry ? `${validity.notificationDays} días antes` : 'Desactivadas'}</p>
            </div>
          </div>

          {validity.customConditions && (
            <div className="mt-3">
              <span className="text-blue-700 font-medium">Condiciones especiales:</span>
              <p className="text-sm mt-1">{validity.customConditions}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
