import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Visit } from '../../../lib/db/repositories/visits.repo';
import { RescheduleVisitInput } from '../../../lib/validation/visits.schema';
import { rescheduleVisitSchema } from '../../../lib/validation/visits.schema';

interface RescheduleDialogProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (input: RescheduleVisitInput) => void;
}

export const RescheduleDialog: React.FC<RescheduleDialogProps> = ({
  visit,
  isOpen,
  onClose,
  onReschedule
}) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    reason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const input: RescheduleVisitInput = {
        visitId: visit.id,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        reason: formData.reason || undefined
      };

      // Validate with Zod
      const validatedInput = rescheduleVisitSchema.parse(input);
      
      await onReschedule(validatedInput);
      
      // Reset form
      setFormData({
        scheduledDate: '',
        scheduledTime: '',
        reason: ''
      });
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message || 'Error al reprogramar la visita' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      scheduledDate: '',
      scheduledTime: '',
      reason: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar Visita</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="scheduledDate">Nueva Fecha</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className={errors.scheduledDate ? 'border-red-500' : ''}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.scheduledDate && (
              <p className="text-sm text-red-500 mt-1">{errors.scheduledDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="scheduledTime">Nueva Hora</Label>
            <Input
              id="scheduledTime"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className={errors.scheduledTime ? 'border-red-500' : ''}
              required
            />
            {errors.scheduledTime && (
              <p className="text-sm text-red-500 mt-1">{errors.scheduledTime}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Razón (opcional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Explica por qué necesitas reprogramar la visita..."
              rows={3}
            />
          </div>

          {errors.general && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {errors.general}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Reprogramando...' : 'Reprogramar Visita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
