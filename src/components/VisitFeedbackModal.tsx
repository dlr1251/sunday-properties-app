import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const ratingLabels = [
    t('visits.feedback.selectRating'),
    t('visits.feedback.rating1'),
    t('visits.feedback.rating2'),
    t('visits.feedback.rating3'),
    t('visits.feedback.rating4'),
    t('visits.feedback.rating5'),
  ];
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
        {ratingLabels[value] || ratingLabels[0]}
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
  const { t } = useTranslation();
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
      toast.error(t('visits.feedback.loginRequired'));
      return;
    }

    // Validate required ratings
    if (feedback.propertyRating === 0 || feedback.serviceRating === 0 || feedback.overallSatisfaction === 0) {
      toast.error(t('visits.feedback.ratingsRequired'));
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

      toast.success(t('visits.feedback.success'));
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
      toast.error(t('visits.feedback.error'));
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
            {t('visits.feedback.title')}
          </DialogTitle>
          <p className="text-muted-foreground">
            {t('visits.feedback.subtitle', { property: propertyTitle })}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property Rating */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.propertyRating}
                onChange={(value) => setFeedback(prev => ({ ...prev, propertyRating: value }))}
                label={t('visits.feedback.propertyRating')}
              />
            </CardContent>
          </Card>

          {/* Service Rating */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.serviceRating}
                onChange={(value) => setFeedback(prev => ({ ...prev, serviceRating: value }))}
                label={t('visits.feedback.serviceRating')}
              />
            </CardContent>
          </Card>

          {/* Overall Satisfaction */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.overallSatisfaction}
                onChange={(value) => setFeedback(prev => ({ ...prev, overallSatisfaction: value }))}
                label={t('visits.feedback.overallSatisfaction')}
              />
            </CardContent>
          </Card>

          {/* Purchase Interest */}
          <Card>
            <CardContent className="pt-6">
              <StarRating
                value={feedback.purchaseInterest}
                onChange={(value) => setFeedback(prev => ({ ...prev, purchaseInterest: value }))}
                label={t('visits.feedback.purchaseInterest')}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('visits.feedback.comments')}
                </Label>
                <Textarea
                  id="comments"
                  placeholder={t('visits.feedback.commentsPlaceholder')}
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
                  <Label>{t('visits.feedback.anonymous')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('visits.feedback.anonymousHint')}
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
                <h4 className="font-semibold text-blue-900">{t('visits.feedback.privacyTitle')}</h4>
                <p className="text-blue-700 text-sm mt-1">
                  {t('visits.feedback.privacyBody')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('visits.feedback.later')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || feedback.propertyRating === 0 || feedback.serviceRating === 0 || feedback.overallSatisfaction === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? t('common.sending') : t('visits.feedback.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VisitFeedbackModal;
