import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useVisitAvailability } from '../../hooks/useVisitAvailability';
import { supabase } from '../../lib/supabase';
import { useVisits } from '../../hooks/useVisits';
import { format, addDays, isSameDay } from 'date-fns';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { formatCurrency } from '../../utils/format';

interface VisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  visitPrice?: number;
}

export const VisitBookingModal: React.FC<VisitBookingModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  propertyAddress,
  visitPrice = 49000
}) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
  const { availability, blockedDates, fetchAvailability, fetchBlockedDates } = useVisitAvailability(propertyId);
  const { createVisitRequest } = useVisits();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchAvailability();
      fetchBlockedDates();
    }
  }, [isOpen, propertyId, fetchAvailability, fetchBlockedDates]);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate, availability]);

  const generateAvailableTimes = async () => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_active);

    if (!dayAvailability) {
      setAvailableTimes([]);
      return;
    }

    // Enforce max visits per day based on existing bookings
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { count, error } = await supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .eq('scheduled_date', dateStr)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error counting visits:', error);
      }

      const maxPerDay = dayAvailability.max_visits_per_day ?? 3;
      if ((count || 0) >= maxPerDay) {
        setAvailableTimes([]);
        return;
      }
    } catch (err) {
      console.error('Error enforcing max visits per day:', err);
      // Continue to show times if count fails
    }

    // Generate time slots (every hour)
    const times: string[] = [];
    const startHour = parseInt(dayAvailability.start_time.split(':')[0]);
    const endHour = parseInt(dayAvailability.end_time.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    setAvailableTimes(times);
  };

  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const hasAvailability = availability.some(a => a.day_of_week === dayOfWeek && a.is_active);
    
    if (!hasAvailability) return false;

    // Check if date is blocked
    const isBlocked = blockedDates.some(blocked => 
      isSameDay(new Date(blocked.blocked_date), date)
    );

    if (isBlocked) return false;

    // Check advance booking requirement
    const minAdvanceDays = availability.find(a => a.day_of_week === dayOfWeek)?.advance_booking_days || 1;
    const minDate = addDays(new Date(), minAdvanceDays);

    return date >= minDate;
  };

  const handleBookVisit = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    if (!ndaAccepted) {
      return;
    }

    setLoading(true);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const result = await createVisitRequest(propertyId, dateStr, selectedTime);

      if (result.success) {
        onClose();
        // Reset form
        setSelectedDate(undefined);
        setSelectedTime('');
        setNdaAccepted(false);
      }
    } catch (err) {
      console.error('Error booking visit:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAvailability = availability.length > 0 && availability.some(a => a.is_active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('visits.schedule')}</DialogTitle>
          <DialogDescription>
            {propertyTitle} - {propertyAddress}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!hasAvailability ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('visits.noAvailability')}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Visit Price */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">{t('visits.visitCost')}</span>
                </div>
                <span className="text-lg font-bold">
                  {formatCurrency(visitPrice)}
                </span>
              </div>

              {/* Available Days Info */}
              <div className="space-y-2">
                <Label>{t('visits.availableDays')}</Label>
                <div className="flex flex-wrap gap-2">
                  {availability
                    .filter(a => a.is_active)
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((slot) => (
                      <Badge key={slot.id} variant="outline">
                        {format(new Date(2023, 0, 1 + slot.day_of_week), 'EEEE', { locale: dateLocale })}: {slot.start_time} - {slot.end_time}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>{t('visits.selectADate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : t('visits.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={dateLocale}
                      disabled={(date) => !isDateAvailable(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              {selectedDate && availableTimes.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('visits.selectATime')}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && availableTimes.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('visits.noTimesForDate')}
                  </AlertDescription>
                </Alert>
              )}

              {/* NDA Agreement */}
              {selectedDate && selectedTime && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold">{t('visits.ndaTitle')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('visits.ndaBody')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nda"
                          checked={ndaAccepted}
                          onCheckedChange={(checked) => setNdaAccepted(checked as boolean)}
                        />
                        <label
                          htmlFor="nda"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('visits.ndaAccept')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedDate && selectedTime && ndaAccepted && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t('visits.summaryTitle')}</strong>
                    <br />
                    {t('visits.summaryDate', { date: format(selectedDate, 'PPP', { locale: dateLocale }), time: selectedTime })}
                    <br />
                    {t('visits.summaryCost', { amount: formatCurrency(visitPrice) })}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleBookVisit}
            disabled={!selectedDate || !selectedTime || !ndaAccepted || loading || !hasAvailability}
          >
            {loading ? t('visits.booking') : t('visits.confirmVisit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

