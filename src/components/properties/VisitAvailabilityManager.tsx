import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VisitAvailability {
  id: string;
  property_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  advance_booking_days: number;
  max_visits_per_day: number;
  is_active: boolean;
}

interface VisitAvailabilityManagerProps {
  propertyId: string;
  onClose?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

export const VisitAvailabilityManager: React.FC<VisitAvailabilityManagerProps> = ({
  propertyId,
  onClose
}) => {
  const [availabilities, setAvailabilities] = useState<VisitAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [advanceDays, setAdvanceDays] = useState(1);
  const [maxVisits, setMaxVisits] = useState(3);

  useEffect(() => {
    fetchAvailabilities();
    fetchPropertySettings();
  }, [propertyId]);

  const fetchAvailabilities = async () => {
    try {
      const { data, error } = await supabase
        .from('property_visit_availability')
        .select('*')
        .eq('property_id', propertyId)
        .order('day_of_week');

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error: any) {
      console.error('Error fetching availabilities:', error);
      toast.error('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('visit_availability_enabled, auto_confirm_visits')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      if (data) {
        setGlobalEnabled(data.visit_availability_enabled || false);
        setAutoConfirm(data.auto_confirm_visits || false);
      }
    } catch (error: any) {
      console.error('Error fetching property settings:', error);
    }
  };

  const addAvailability = () => {
    const newAvailability: Partial<VisitAvailability> = {
      property_id: propertyId,
      day_of_week: 1,
      start_time: '09:00',
      end_time: '18:00',
      advance_booking_days: advanceDays,
      max_visits_per_day: maxVisits,
      is_active: true
    };
    
    setAvailabilities([...availabilities, newAvailability as VisitAvailability]);
  };

  const updateAvailability = (index: number, updates: Partial<VisitAvailability>) => {
    const updated = [...availabilities];
    updated[index] = { ...updated[index], ...updates };
    setAvailabilities(updated);
  };

  const removeAvailability = (index: number) => {
    const updated = availabilities.filter((_, i) => i !== index);
    setAvailabilities(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update property settings
      const { error: settingsError } = await supabase
        .from('properties')
        .update({
          visit_availability_enabled: globalEnabled,
          auto_confirm_visits: autoConfirm
        })
        .eq('id', propertyId);

      if (settingsError) throw settingsError;

      // Save availabilities
      for (const availability of availabilities) {
        const { id, ...data } = availability;
        
        if (id) {
          // Update existing
          const { error } = await supabase
            .from('property_visit_availability')
            .update(data)
            .eq('id', id);
          
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('property_visit_availability')
            .insert(data);
          
          if (error) throw error;
        }
      }

      toast.success('Disponibilidad guardada exitosamente');
      await fetchAvailabilities();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast.error('Error al guardar disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configurar Disponibilidad para Visitas
          </CardTitle>
          <CardDescription>
            Define cuándo y cómo los usuarios pueden solicitar visitas a tu propiedad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Habilitar sistema de visitas</Label>
              <p className="text-sm text-gray-500">
                Permite que usuarios soliciten visitas a esta propiedad
              </p>
            </div>
            <Switch
              checked={globalEnabled}
              onCheckedChange={setGlobalEnabled}
            />
          </div>

          {globalEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advance-days">Días de anticipación</Label>
                  <Input
                    id="advance-days"
                    type="number"
                    min="0"
                    value={advanceDays}
                    onChange={(e) => setAdvanceDays(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500">
                    Días mínimos para solicitar visita
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-visits">Máximo de visitas por día</Label>
                  <Input
                    id="max-visits"
                    type="number"
                    min="1"
                    value={maxVisits}
                    onChange={(e) => setMaxVisits(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-gray-500">
                    Visitas simultáneas permitidas
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Confirmación automática</Label>
                  <p className="text-sm text-gray-500">
                    Las solicitudes se confirman automáticamente
                  </p>
                </div>
                <Switch
                  checked={autoConfirm}
                  onCheckedChange={setAutoConfirm}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {globalEnabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Horarios disponibles</CardTitle>
                <CardDescription>
                  Define los días y horarios cuando las visitas están disponibles
                </CardDescription>
              </div>
              <Button onClick={addAvailability} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Horario
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {availabilities.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay horarios configurados. Agrega horarios para permitir visitas.
                </AlertDescription>
              </Alert>
            ) : (
              availabilities.map((availability, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={availability.is_active}
                        onCheckedChange={(checked) =>
                          updateAvailability(index, { is_active: checked as boolean })
                        }
                      />
                      <span className="font-medium">Activo</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAvailability(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Día</Label>
                      <select
                        value={availability.day_of_week}
                        onChange={(e) =>
                          updateAvailability(index, { day_of_week: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Inicio
                      </Label>
                      <Input
                        type="time"
                        value={availability.start_time}
                        onChange={(e) =>
                          updateAvailability(index, { start_time: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Fin
                      </Label>
                      <Input
                        type="time"
                        value={availability.end_time}
                        onChange={(e) =>
                          updateAvailability(index, { end_time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 justify-end">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[150px]"
        >
          {saving ? (
            'Guardando...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

