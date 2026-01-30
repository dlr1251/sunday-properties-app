import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Ban
} from 'lucide-react';
import { useVisitAvailability } from '../../hooks/useVisitAvailability';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VisitAvailabilityConfigProps {
  propertyId: string;
  onComplete?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export const VisitAvailabilityConfig: React.FC<VisitAvailabilityConfigProps> = ({
  propertyId,
  onComplete
}) => {
  const {
    availability,
    blockedDates,
    loading,
    fetchAvailability,
    fetchBlockedDates,
    saveAvailability,
    deleteAvailability,
    toggleAvailability,
    addBlockedDate,
    removeBlockedDate
  } = useVisitAvailability(propertyId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBlockDateDialog, setShowBlockDateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [advanceBookingDays, setAdvanceBookingDays] = useState(1);
  const [maxVisitsPerDay, setMaxVisitsPerDay] = useState(3);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [blockReason, setBlockReason] = useState('');
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchAvailability();
      fetchBlockedDates();
    }
  }, [propertyId, fetchAvailability, fetchBlockedDates]);

  // Create default availability schedules (Monday-Sunday, 8am-6pm)
  const createDefaultAvailability = async () => {
    setCreatingDefaults(true);
    try {
      // Create availability for each day of the week (0=Sunday, 6=Saturday)
      const defaultSchedules = [
        { day: 1, label: 'Lunes' },    // Monday
        { day: 2, label: 'Martes' },   // Tuesday
        { day: 3, label: 'Miércoles' }, // Wednesday
        { day: 4, label: 'Jueves' },   // Thursday
        { day: 5, label: 'Viernes' },  // Friday
        { day: 6, label: 'Sábado' },   // Saturday
        { day: 0, label: 'Domingo' }   // Sunday
      ];

      const promises = defaultSchedules.map(schedule =>
        saveAvailability(
          schedule.day,
          '08:00', // 8am
          '18:00', // 6pm
          1,       // 1 day advance booking
          3        // max 3 visits per day
        )
      );

      await Promise.all(promises);
      toast.success('Horarios por defecto creados exitosamente');
    } catch (error) {
      console.error('Error creating default availability:', error);
      toast.error('Error al crear horarios por defecto');
    } finally {
      setCreatingDefaults(false);
    }
  };

  const handleSaveAvailability = async () => {
    const success = await saveAvailability(
      selectedDay,
      startTime,
      endTime,
      advanceBookingDays,
      maxVisitsPerDay
    );

    if (success) {
      setShowAddDialog(false);
      // Reset form
      setSelectedDay(1);
      setStartTime('09:00');
      setEndTime('17:00');
      setAdvanceBookingDays(1);
      setMaxVisitsPerDay(3);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const success = await addBlockedDate(dateStr, blockReason);

    if (success) {
      setShowBlockDateDialog(false);
      setSelectedDate(undefined);
      setBlockReason('');
    }
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || 'Desconocido';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración de Disponibilidad para Visitas
          </CardTitle>
          <CardDescription>
            Define los horarios en los que los compradores pueden agendar visitas a tu propiedad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Availability Schedule */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold">Horarios Disponibles</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configura los días y horarios en que los compradores pueden visitar tu propiedad
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Disponibilidad</DialogTitle>
                    <DialogDescription>
                      Configura un horario para recibir visitas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Día de la Semana</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hora Inicio</Label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora Fin</Label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Días de anticipación requeridos</Label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={advanceBookingDays}
                        onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Los compradores deben agendar con al menos {advanceBookingDays} día(s) de anticipación
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Máximo de visitas por día</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={maxVisitsPerDay}
                        onChange={(e) => setMaxVisitsPerDay(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveAvailability}>
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availability.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No has configurado horarios de disponibilidad
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Los compradores necesitan horarios disponibles para agendar visitas
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={createDefaultAvailability}
                    disabled={creatingDefaults}
                    className="w-full sm:w-auto"
                  >
                    {creatingDefaults ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando horarios...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Crear Horarios por Defecto (8am-6pm)
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Crea horarios de Lunes a Domingo de 8:00 AM a 6:00 PM que podrás editar después
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="text-sm">
                            {getDayLabel(slot.day_of_week)}
                          </Badge>
                          {slot.is_active ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm lg:text-base">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Máx. {slot.max_visits_per_day} visitas/día • {slot.advance_booking_days} día(s) anticipación
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slot.is_active}
                        onCheckedChange={(checked) => toggleAvailability(slot.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAvailability(slot.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Dates */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Fechas Bloqueadas</h3>
                <p className="text-sm text-muted-foreground">
                  Bloquea fechas específicas en las que no quieres recibir visitas
                </p>
              </div>
              <Dialog open={showBlockDateDialog} onOpenChange={setShowBlockDateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Ban className="h-4 w-4 mr-2" />
                    Bloquear Fecha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bloquear Fecha</DialogTitle>
                    <DialogDescription>
                      Selecciona una fecha en la que no quieres recibir visitas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={es}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Motivo (opcional)</Label>
                      <Textarea
                        placeholder="Ej: Mantenimiento programado"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBlockDateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleBlockDate} disabled={!selectedDate}>
                      Bloquear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {blockedDates.length > 0 && (
              <div className="space-y-2">
                {blockedDates.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(blocked.blocked_date), 'PPP', { locale: es })}
                      </p>
                      {blocked.reason && (
                        <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlockedDate(blocked.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onComplete && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

