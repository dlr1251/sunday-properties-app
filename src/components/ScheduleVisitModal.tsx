import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "02:00 PM", available: true },
  { time: "03:00 PM", available: true },
  { time: "04:00 PM", available: false },
  { time: "05:00 PM", available: true },
];

export function ScheduleVisitModal({
  open,
  onOpenChange,
  propertyTitle,
}: ScheduleVisitModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor selecciona fecha y hora");
      return;
    }
    
    if (!name || !phone || !email) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    toast.success(
      `Visita agendada para ${selectedDate.toLocaleDateString('es-CO')} a las ${selectedTime}`
    );
    
    // Reset form
    setSelectedDate(new Date());
    setSelectedTime("");
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Inter:Black',_sans-serif] font-black text-[20px]">
            Agendar Visita
          </DialogTitle>
          <p className="text-muted-foreground">{propertyTitle}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Calendar */}
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Selecciona una fecha</Label>
              <Card className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md"
                />
              </Card>
            </div>

            {selectedDate && (
              <div>
                <Label className="mb-3 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horarios disponibles
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={
                        selectedTime === slot.time
                          ? "bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
                          : ""
                      }
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Horarios en gris no están disponibles
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Información de Contacto</Label>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre Completo *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notas adicionales (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="¿Algo que debamos saber?"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {selectedDate && selectedTime && (
              <Card className="p-4 bg-[#f4f4f4]">
                <p className="font-bold text-sm mb-2">Resumen de tu visita</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    {selectedDate.toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Hora:</span> {selectedTime}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Propiedad:</span> {propertyTitle}
                  </p>
                </div>
                <Badge className="mt-3 bg-[#ff9b4e] text-black">
                  Confirmación por email
                </Badge>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSchedule}
            className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
          >
            Confirmar Visita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
