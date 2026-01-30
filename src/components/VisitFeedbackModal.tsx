import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface VisitFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: string;
  propertyTitle: string;
  onSubmit?: () => void;
}

const StarRating: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {value === 0 ? 'Selecciona una calificación' :
         value === 1 ? 'Muy malo' :
         value === 2 ? 'Malo' :
         value === 3 ? 'Regular' :
         value === 4 ? 'Bueno' :
         'Excelente'}
      </div>
    </div>
  );
};

export function VisitFeedbackModal({
  open,
  onOpenChange,
  visitId,
  propertyTitle,
  onSubmit
}: VisitFeedbackModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    propertyRating: 0,
    serviceRating: 0,
    overallSatisfaction: 0,
    purchaseInterest: 0,
    comments: '',
    anonymous: true
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar feedback');
      return;
    }

    // Validate required ratings
    if (feedback.propertyRating === 0 || feedback.serviceRating === 0 || feedback.overallSatisfaction === 0) {
      toast.error('Por favor completa todas las calificaciones requeridas');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('visit_feedback')
        .insert({
          visit_id: visitId,
          user_id: feedback.anonymous ? null : user.id,
          property_rating: feedback.propertyRating,
          service_rating: feedback.serviceRating,
          overall_satisfaction: feedback.overallSatisfaction,
          purchase_interest: feedback.purchaseInterest,
          comments: feedback.comments || null,
          is_anonymous: feedback.anonymous
        });

      if (error) throw error;

      toast.success('¡Gracias por tu feedback! Nos ayuda a mejorar.');
      onOpenChange(false);
      onSubmit?.();

      // Reset form
      setFeedback({
        propertyRating: 0,
        serviceRating: 0,
        overallSatisfaction: 0,
        purchaseInterest: 0,
        comments: '',
        anonymous: true
      });
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error('Error al enviar el feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Don't reset form here so user can continue later if they accidentally close
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            ¿Cómo fue tu visita?
          </DialogTitle>
          <p className="text-muted-foreground">
            Tu feedback nos ayuda a mejorar nuestros servicios para {propertyTitle}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property Rating */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.propertyRating}
                onChange={(value) => setFeedback(prev => ({ ...prev, propertyRating: value }))}
                label="¿Cómo calificarías la propiedad?"
              />
            </CardContent>
          </Card>

          {/* Service Rating */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.serviceRating}
                onChange={(value) => setFeedback(prev => ({ ...prev, serviceRating: value }))}
                label="¿Cómo calificarías el servicio recibido?"
              />
            </CardContent>
          </Card>

          {/* Overall Satisfaction */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.overallSatisfaction}
                onChange={(value) => setFeedback(prev => ({ ...prev, overallSatisfaction: value }))}
                label="¿Cuál es tu satisfacción general con la visita?"
              />
            </CardContent>
          </Card>

          {/* Purchase Interest */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.purchaseInterest}
                onChange={(value) => setFeedback(prev => ({ ...prev, purchaseInterest: value }))}
                label="¿Cuál es tu interés en comprar esta propiedad?"
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios adicionales (opcional)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Comparte tus impresiones, sugerencias o cualquier detalle adicional..."
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Anonymous Option */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enviar de forma anónima</Label>
                  <p className="text-sm text-muted-foreground">
                    Tu identidad no será visible en los resultados agregados
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(prev => ({ ...prev, anonymous: !prev.anonymous }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    feedback.anonymous ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feedback.anonymous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Privacidad del Feedback</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Los resultados agregados se comparten con el vendedor para mejorar el servicio.
                  Los comentarios individuales son confidenciales y solo se usan para análisis interno.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Más tarde
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || feedback.propertyRating === 0 || feedback.serviceRating === 0 || feedback.overallSatisfaction === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VisitFeedbackModal;
