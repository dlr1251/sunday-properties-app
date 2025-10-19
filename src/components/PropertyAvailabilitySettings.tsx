import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Clock, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PropertyAvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: string[];
}

const initialSchedule: DaySchedule[] = [
  { day: "Lunes", enabled: true, slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
  { day: "Martes", enabled: true, slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
  { day: "Miércoles", enabled: true, slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
  { day: "Jueves", enabled: true, slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
  { day: "Viernes", enabled: true, slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
  { day: "Sábado", enabled: true, slots: ["10:00 AM - 02:00 PM"] },
  { day: "Domingo", enabled: false, slots: [] },
];

const timeOptions = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

export function PropertyAvailabilitySettings({
  open,
  onOpenChange,
  propertyTitle,
}: PropertyAvailabilitySettingsProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [visitDuration, setVisitDuration] = useState(60); // minutes
  const [maxVisitsPerDay, setMaxVisitsPerDay] = useState(5);
  const [advanceBooking, setAdvanceBooking] = useState(24); // hours

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    setSchedule(newSchedule);
  };

  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push("09:00 AM - 10:00 AM");
    setSchedule(newSchedule);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    toast.success("Disponibilidad actualizada exitosamente");
    onOpenChange(false);
  };

  const applyToAll = () => {
    const mondaySlots = schedule[0].slots;
    const newSchedule = schedule.map((day, index) => ({
      ...day,
      slots: index === 6 ? day.slots : [...mondaySlots], // Don't apply to Sunday
      enabled: index === 6 ? day.enabled : true,
    }));
    setSchedule(newSchedule);
    toast.success("Horario de lunes aplicado a todos los días");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Inter:Black',_sans-serif] font-black text-[20px]">
            Configurar Disponibilidad de Visitas
          </DialogTitle>
          <p className="text-muted-foreground">{propertyTitle}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-bold">Configuración General</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración de Visita (min)</Label>
                  <select
                    id="duration"
                    value={visitDuration}
                    onChange={(e) => setVisitDuration(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>60 minutos</option>
                    <option value={90}>90 minutos</option>
                    <option value={120}>120 minutos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxVisits">Máximo Visitas/Día</Label>
                  <select
                    id="maxVisits"
                    value={maxVisitsPerDay}
                    onChange={(e) => setMaxVisitsPerDay(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={3}>3 visitas</option>
                    <option value={5}>5 visitas</option>
                    <option value={8}>8 visitas</option>
                    <option value={10}>10 visitas</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advance">Reserva Anticipada (hrs)</Label>
                  <select
                    id="advance"
                    value={advanceBooking}
                    onChange={(e) => setAdvanceBooking(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                    <option value={48}>48 horas</option>
                    <option value={72}>72 horas</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Horario Semanal
              </h3>
              <Button variant="outline" size="sm" onClick={applyToAll}>
                Aplicar lunes a todos los días
              </Button>
            </div>

            <div className="space-y-2">
              {schedule.map((daySchedule, dayIndex) => (
                <Card key={daySchedule.day}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={daySchedule.enabled}
                            onCheckedChange={() => toggleDay(dayIndex)}
                          />
                          <Label className="font-bold w-24">{daySchedule.day}</Label>
                          {!daySchedule.enabled && (
                            <Badge variant="outline" className="text-muted-foreground">
                              No disponible
                            </Badge>
                          )}
                        </div>
                        {daySchedule.enabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addTimeSlot(dayIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar horario
                          </Button>
                        )}
                      </div>

                      {daySchedule.enabled && daySchedule.slots.length > 0 && (
                        <div className="flex flex-wrap gap-2 ml-12">
                          {daySchedule.slots.map((slot, slotIndex) => (
                            <Badge
                              key={slotIndex}
                              className="bg-[#2dc97b] text-[#150f0f] pr-1 gap-2"
                            >
                              <Clock className="h-3 w-3" />
                              {slot}
                              <button
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                className="hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <Card className="bg-[#f4f4f4]">
            <CardContent className="pt-6">
              <h4 className="font-bold mb-3">Plantillas Rápidas</h4>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  Solo Fines de Semana
                </Button>
                <Button variant="outline" size="sm">
                  Lunes a Viernes
                </Button>
                <Button variant="outline" size="sm">
                  Solo Mañanas
                </Button>
                <Button variant="outline" size="sm">
                  Solo Tardes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#ff9b4e] text-black hover:bg-[#ff8a35]"
          >
            Guardar Disponibilidad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
