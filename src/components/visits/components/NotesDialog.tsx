import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Visit } from '../../../lib/db/repositories/visits.repo';
import { VisitNotesInput } from '../../../lib/validation/visits.schema';
import { visitNotesSchema } from '../../../lib/validation/visits.schema';

interface NotesDialogProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onAddNotes: (input: VisitNotesInput) => void;
}

export const NotesDialog: React.FC<NotesDialogProps> = ({
  visit,
  isOpen,
  onClose,
  onAddNotes
}) => {
  const [formData, setFormData] = useState({
    notes: '',
    type: 'seller' as 'seller' | 'admin'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const input: VisitNotesInput = {
        visitId: visit.id,
        notes: formData.notes,
        type: formData.type
      };

      // Validate with Zod
      const validatedInput = visitNotesSchema.parse(input);
      
      await onAddNotes(validatedInput);
      
      // Reset form
      setFormData({
        notes: '',
        type: 'seller'
      });
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message || 'Error al agregar notas' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      notes: '',
      type: 'seller'
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Notas</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Nota</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'seller' | 'admin' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Nota del Vendedor</SelectItem>
                <SelectItem value="admin">Nota Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Escribe tus notas sobre esta visita..."
              rows={4}
              className={errors.notes ? 'border-red-500' : ''}
              required
            />
            {errors.notes && (
              <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
            )}
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
            <Button type="submit" disabled={loading || !formData.notes.trim()}>
              {loading ? 'Agregando...' : 'Agregar Notas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
