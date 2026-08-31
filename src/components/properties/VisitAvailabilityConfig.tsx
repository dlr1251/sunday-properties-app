import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';

interface VisitAvailabilityConfigProps {
  propertyId: string;
  onComplete?: () => void;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export const VisitAvailabilityConfig: React.FC<VisitAvailabilityConfigProps> = ({
  propertyId,
  onComplete
}) => {
  const { t } = useTranslation();
  const dateLocale = useDateFnsLocale();
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
      const defaultSchedules = [1, 2, 3, 4, 5, 6, 0];

      const promises = defaultSchedules.map(day =>
        saveAvailability(
          day,
          '08:00',
          '18:00',
          1,
          3
        )
      );

      await Promise.all(promises);
      toast.success(t('properties.wizard.availability.defaultsCreated'));
    } catch (error) {
      console.error('Error creating default availability:', error);
      toast.error(t('properties.wizard.availability.defaultsError'));
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
    const key = DAY_KEYS[dayOfWeek];
    return key ? t(`properties.wizard.availability.days.${key}`) : t('properties.wizard.availability.unknownDay');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('properties.wizard.availability.title')}
          </CardTitle>
          <CardDescription>
            {t('properties.wizard.availability.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Availability Schedule */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold">{t('properties.wizard.availability.schedulesTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('properties.wizard.availability.schedulesHint')}
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('properties.wizard.availability.addSchedule')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('properties.wizard.availability.addTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('properties.wizard.availability.addDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('properties.wizard.availability.dayOfWeek')}</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                      >
                        {DAY_KEYS.map((key, value) => (
                          <option key={value} value={value}>
                            {t(`properties.wizard.availability.days.${key}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('properties.wizard.availability.startTime')}</Label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('properties.wizard.availability.endTime')}</Label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('properties.wizard.availability.advanceDays')}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={advanceBookingDays}
                        onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('properties.wizard.availability.advanceHint', { count: advanceBookingDays })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('properties.wizard.availability.maxVisits')}</Label>
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
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSaveAvailability}>
                      {t('common.save')}
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
                  {t('properties.wizard.availability.emptyTitle')}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('properties.wizard.availability.emptyHint')}
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
                        {t('properties.wizard.availability.creatingDefaults')}
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        {t('properties.wizard.availability.createDefaults')}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t('properties.wizard.availability.createDefaultsHint')}
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
                              {t('properties.wizard.availability.active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t('properties.wizard.availability.inactive')}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm lg:text-base">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          {t('properties.wizard.availability.slotSummary', { max: slot.max_visits_per_day, days: slot.advance_booking_days })}
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
                <h3 className="text-lg font-semibold">{t('properties.wizard.availability.blockedTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('properties.wizard.availability.blockedHint')}
                </p>
              </div>
              <Dialog open={showBlockDateDialog} onOpenChange={setShowBlockDateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Ban className="h-4 w-4 mr-2" />
                    {t('properties.wizard.availability.blockDate')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('properties.wizard.availability.blockDateTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('properties.wizard.availability.blockDateDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('properties.wizard.availability.date')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : t('properties.wizard.availability.selectDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={dateLocale}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('properties.wizard.availability.reasonOptional')}</Label>
                      <Textarea
                        placeholder={t('properties.wizard.availability.reasonPlaceholder')}
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBlockDateDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleBlockDate} disabled={!selectedDate}>
                      {t('properties.wizard.availability.block')}
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
                        {format(new Date(blocked.blocked_date), 'PPP', { locale: dateLocale })}
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
                {t('properties.wizard.availability.continue')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

