import React, { useState, useEffect } from "react";
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
import { Clock, User, Phone, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useVerification } from "../hooks/verification/useVerification";
import { supabase } from "../lib/supabase";
import { VisitPaymentModal } from "./visits/VisitPaymentModal";
import { SuccessModal } from "./ui/success-modal";
import { useNavigate } from "react-router-dom";
import { VISIT_PAYMENT_AMOUNT } from "../services/stripe";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  propertyId: string;
  onVisitScheduled?: (visitData: any) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function ScheduleVisitModal({
  open,
  onOpenChange,
  propertyTitle,
  propertyId,
  onVisitScheduled,
}: ScheduleVisitModalProps) {
  const { user, profile } = useAuth();
  const { verificationStatus } = useVerification();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingVisitData, setPendingVisitData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(new Date());
      setSelectedTime("");
      setNotes("");
    }
  }, [open]);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && propertyId) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, propertyId]);

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      // For now, always use default slots since the database function needs fixing
      // TODO: Integrate with actual availability system once database function is working
      const defaultSlots = [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
      ];

      setAvailableSlots(defaultSlots);

      // Future implementation with working database function:
      /*
      const { data, error } = await supabase
        .rpc('get_available_time_slots', {
          p_property_id: propertyId,
          p_date: date.toISOString().split('T')[0]
        });

      if (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots(defaultSlots);
        return;
      }

      const slots: TimeSlot[] = [];
      if (data && Array.isArray(data)) {
        data.forEach(slot => {
          const [startTime] = slot.split('-');
          slots.push({ time: startTime, available: true });
        });
      }

      setAvailableSlots(slots.length > 0 ? slots : defaultSlots);
      */
    } catch (error) {
      console.error('Error:', error);
      setAvailableSlots([
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSchedule = async () => {
    console.log('🔵 handleSchedule called', { selectedDate, selectedTime, user: !!user, verificationStatus });
    
    if (!selectedDate || !selectedTime) {
      console.log('❌ Missing date or time');
      toast.error("Por favor selecciona fecha y hora");
      return;
    }

    if (!user) {
      console.log('❌ No user');
      toast.error("Debes iniciar sesión para agendar una visita");
      return;
    }

    // Check if email is verified
    const emailConfirmedAt = (user as any)?.email_confirmed_at;
    console.log('📧 Email verification check:', { 
      emailConfirmedAt, 
      hasEmailConfirmed: !!emailConfirmedAt,
      userKeys: Object.keys(user || {})
    });
    
    if (!emailConfirmedAt) {
      console.log('❌ Email not verified');
      toast.error("Debes verificar tu email antes de agendar visitas");
      return;
    }

    // Check if user identity is verified
    if (verificationStatus !== 'verified') {
      console.log('❌ Identity not verified, status:', verificationStatus);
      toast.error("Debes verificar tu identidad antes de agendar visitas");
      return;
    }

    console.log('✅ All validations passed, creating visit...');
    setSubmitting(true);
    try {
      // Ensure we have a profile - profiles.id should equal user.id (1:1 relationship)
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      // Use user.id as visitor_id (profiles.id = auth.users.id in the schema)
      const visitorId = user.id;
      const scheduledDateStr = selectedDate.toISOString().split('T')[0];
      
      console.log('📝 Creating visit with data:', { 
        propertyId, 
        visitorId, 
        scheduled_date: scheduledDateStr, 
        scheduled_time: selectedTime,
        notes: notes || null
      });
      
      // Create a pending visit before payment so we can attach payment to it
      const { data, error } = await supabase
        .from('visits')
        .insert({
          property_id: propertyId,
          visitor_id: visitorId, // This should reference profiles.id which equals auth.users.id
          scheduled_date: scheduledDateStr,
          scheduled_time: selectedTime,
          notes: notes || null,
          status: 'pending',
          paid: false,
          visit_price: 49000,
        })
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            owner_id
          )
        `)
        .single();

      if (error) {
        console.error('❌ Supabase error creating visit:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Visit created successfully:', data);

      // Prepare visit data for payment modal
      const visitData = {
        id: data.id,
        propertyTitle,
        scheduledDate: data.scheduled_date,
        scheduledTime: data.scheduled_time,
      };

      console.log('💳 Setting up payment modal with visit data:', visitData);
      setPendingVisitData(visitData);
      setShowPaymentModal(true);
      console.log('✅ Payment modal should open now');
    } catch (err: any) {
      console.error('❌ Error creating pending visit:', err);
      console.error('Error stack:', err.stack);
      toast.error(err.message || 'No se pudo crear la visita');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!pendingVisitData || !user) return;

    setSubmitting(true);
    try {
      // Get existing visit to preserve notes
      const { data: existingVisit } = await supabase
        .from('visits')
        .select('notes')
        .eq('id', pendingVisitData.id)
        .single();

      // Prepare payment info note
      const paymentNote = `\n[PAYMENT] ID: ${paymentData.paymentIntentId}, Amount: ${paymentData.amount || VISIT_PAYMENT_AMOUNT} COP, Date: ${new Date().toLocaleString('es-CO')}`;
      const existingNotes = (existingVisit as any)?.notes || '';
      const updatedNotes = existingNotes 
        ? `${existingNotes}${paymentNote}`
        : paymentNote.trim();

      // Update the pending visit after successful payment
      // Note: payment_id and payment_amount columns don't exist in visits table
      // We store payment info in notes field
      const { error } = await (supabase
        .from('visits')
        .update({
          status: 'confirmed',
          paid: true,
          payment_method: 'card',
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingVisitData.id) as any);

      if (error) {
        console.error('Error updating visit after payment:', error);
        throw error;
      }

      // Get property owner to create notification
      const { data: propertyData, error: propError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single();
      
      if (propError) {
        console.error('Error fetching property owner:', propError);
      } else if (propertyData?.owner_id) {
        // Create notification for property owner
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: propertyData.owner_id,
            type: 'visit_request',
            title: 'Nueva visita agendada',
            message: `Se ha agendado una visita para "${propertyTitle}" el ${pendingVisitData.scheduledDate} a las ${pendingVisitData.scheduledTime}`,
            data: {
              visit_id: pendingVisitData.id,
              property_id: propertyId,
              visitor_id: user.id,
              scheduled_date: pendingVisitData.scheduledDate,
              scheduled_time: pendingVisitData.scheduledTime
            },
            read: false
          });
        
        if (notifError) {
          console.error('Error creating notification for owner:', notifError);
          // Don't throw - notification failure shouldn't fail the visit
        } else {
          console.log('✅ Notification created for property owner:', propertyData.owner_id);
        }
      } else {
        console.warn('Property owner not found for property:', propertyId);
      }

      if (onVisitScheduled) {
        await onVisitScheduled({
          ...pendingVisitData,
          paymentData,
        });
      }

      // Close payment modal and schedule modal
      setShowPaymentModal(false);
      onOpenChange(false);

      // Reset form
      setSelectedDate(new Date());
      setSelectedTime("");
      setNotes("");
      setPendingVisitData(null);

      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error confirming visit after payment:', error);
      toast.error(error.message || 'Error al confirmar la visita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to dashboard visits tab
    navigate('/dashboard?tab=visits');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl lg:max-w-7xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-['Inter:Black',_sans-serif] font-black text-xl sm:text-2xl">
              Agendar Visita
            </DialogTitle>
            <p className="text-muted-foreground text-sm sm:text-base">{propertyTitle}</p>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 py-4">
            {/* Left Column - Calendar */}
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-sm sm:text-base">Selecciona una fecha</Label>
                <Card className="p-2 sm:p-4">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md w-full"
                    />
                  </div>
                </Card>
              </div>

            {selectedDate && (
              <div>
                <Label className="mb-3 block flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="h-4 w-4" />
                  Horarios disponibles
                </Label>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={
                          selectedTime === slot.time
                            ? "bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b] text-sm sm:text-base"
                            : "text-sm sm:text-base"
                        }
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  * Horarios en gris no están disponibles
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-4">
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Inicio de sesión requerido</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Debes iniciar sesión y verificar tu email para agendar visitas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-3 block">Información Adicional</Label>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notas adicionales (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="¿Algo que debamos saber sobre tu visita?"
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

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={submitting || !user}
              className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b] w-full sm:w-auto"
            >
              {submitting ? "Agendando..." : "Confirmar Visita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {pendingVisitData && (
        <VisitPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          visitData={pendingVisitData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="¡Visita Agendada Exitosamente!"
        message={`Tu visita a "${propertyTitle}" ha sido confirmada. Recibirás los detalles por email y podrás gestionarla desde tu dashboard.`}
        redirectTo="/dashboard?tab=visits"
        redirectLabel="Ir a Mis Visitas"
      />
    </>
  );
}
