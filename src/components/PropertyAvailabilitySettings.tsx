import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Clock,
  Plus,
  X,
  Save,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AvailabilitySlot {
  id?: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  exceptions?: any[];
}

interface PropertyAvailabilitySettingsProps {
  propertyId?: string;
  onSave?: () => void;
}

const weekdays = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export const PropertyAvailabilitySettings: React.FC<PropertyAvailabilitySettingsProps> = ({
  propertyId,
  onSave
}) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({
    weekday: 1,
    start_time: '09:00',
    end_time: '17:00'
  });

  const fetchAvailability = async () => {
    // Validar que propertyId existe antes de hacer la consulta
    if (!propertyId) {
      console.warn('PropertyAvailabilitySettings: propertyId is undefined');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', propertyId)
        .order('weekday', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      toast.error('Error cargando disponibilidad: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    // Validar que propertyId existe antes de guardar
    if (!propertyId) {
      toast.error('No se puede guardar: ID de propiedad no válido');
      return;
    }

    setSaving(true);
    try {
      // Delete existing slots
      const { error: deleteError } = await supabase
        .from('property_availability')
        .delete()
        .eq('property_id', propertyId);

      if (deleteError) throw deleteError;

      // Insert new slots
      if (availability.length > 0) {
        const { error: insertError } = await supabase
          .from('property_availability')
          .insert(
            availability.map(slot => ({
              property_id: propertyId,
              weekday: slot.weekday,
              start_time: slot.start_time,
              end_time: slot.end_time,
              exceptions: slot.exceptions || []
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success('Disponibilidad guardada correctamente');
      onSave?.();
    } catch (error: any) {
      toast.error('Error guardando disponibilidad: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    // Check if slot already exists for this weekday
    const exists = availability.some(slot => slot.weekday === newSlot.weekday);
    if (exists) {
      toast.error('Ya existe un horario para este día');
      return;
    }

    setAvailability(prev => [...prev, { ...newSlot }]);
    setNewSlot({
      weekday: 1,
      start_time: '09:00',
      end_time: '17:00'
    });
  };

  const removeSlot = (index: number) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev => prev.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const getWeekdayLabel = (weekday: number) => {
    return weekdays.find(w => w.value === weekday)?.label || 'Desconocido';
  };

  const getWeekdaySlots = (weekday: number) => {
    return availability.filter(slot => slot.weekday === weekday);
  };

  useEffect(() => {
    if (propertyId) {
      fetchAvailability();
    } else {
      setLoading(false);
    }
  }, [propertyId]);

  if (!propertyId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-6 w-6 mx-auto mb-4 opacity-50" />
            <p>No se ha seleccionado una propiedad</p>
            <p className="text-sm mt-2">Por favor selecciona una propiedad para configurar su disponibilidad</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Cargando disponibilidad...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disponibilidad para Visitas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current availability overview */}
          <div className="space-y-4">
            <h4 className="font-medium">Horarios Configurados</h4>
            {availability.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay horarios configurados</p>
                <p className="text-sm">Los visitantes no podrán agendar visitas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weekdays.map(day => {
                  const daySlots = getWeekdaySlots(day.value);
                  return (
                    <Card key={day.value} className={`border-2 ${daySlots.length > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-2">{day.label}</h5>
                        {daySlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No disponible</p>
                        ) : (
                          <div className="space-y-2">
                            {daySlots.map((slot, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded p-2 border">
                                <span className="text-sm font-mono">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSlot(availability.findIndex(s => s === slot))}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add new slot */}
          <Card className="border-dashed border-2">
            <CardContent className="p-4">
              <h4 className="font-medium mb-4">Agregar Nuevo Horario</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Día de la semana</Label>
                  <Select
                    value={newSlot.weekday.toString()}
                    onValueChange={(value) => setNewSlot(prev => ({ ...prev, weekday: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdays.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hora inicio</Label>
                  <Input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Hora fin</Label>
                  <Input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={addSlot} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={saveAvailability} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Información sobre disponibilidad</h4>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Los horarios configurados son cuando los visitantes pueden agendar citas</li>
                <li>• Puedes configurar múltiples franjas horarias por día</li>
                <li>• Si no configuras horarios, nadie podrá agendar visitas</li>
                <li>• Los visitantes solo verán propiedades con horarios disponibles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
