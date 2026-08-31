import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSubmit: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    property: 0,
    service: 0,
    overall: 0,
    purchase: 0,
  });
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const handleStarClick = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const StarRatingInput: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
    required?: boolean;
  }> = ({ value, onChange, label, required = false }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i < value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200 hover:fill-yellow-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className="ml-2 text-sm text-gray-600">{value}/5</span>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('properties.detail.reviewForm.mustLogin'));
      return;
    }

    if (ratings.overall === 0 || ratings.property === 0 || ratings.service === 0) {
      toast.error(t('properties.detail.reviewForm.completeRatings'));
      return;
    }

    setLoading(true);
    try {
      // First, find the visit for this property
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .select('id')
        .eq('property_id', propertyId)
        .eq('visitor_id', user.id)
        .maybeSingle();

      if (visitError) throw visitError;

      if (!visit) {
        toast.error(t('properties.detail.reviewForm.mustVisit'));
        return;
      }

      // Submit the review
      const { error: reviewError } = await supabase.from('visit_feedback').insert({
        visit_id: visit.id,
        user_id: isAnonymous ? null : user.id,
        property_rating: ratings.property,
        service_rating: ratings.service,
        overall_satisfaction: ratings.overall,
        purchase_interest: ratings.purchase > 0 ? ratings.purchase : null,
        comments: comments || null,
        is_anonymous: isAnonymous,
      });

      if (reviewError) throw reviewError;

      onSubmit();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(t('properties.detail.reviewForm.submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('properties.detail.reviewForm.title')}</h2>
              <p className="text-gray-600 text-sm">
                {t('properties.detail.reviewForm.subtitle')}
              </p>
            </div>

            <div className="space-y-6">
              {/* Overall Rating */}
              <StarRatingInput
                value={ratings.overall}
                onChange={(value) => setRatings((prev) => ({ ...prev, overall: value }))}
                label={t('properties.detail.reviewForm.overall')}
                required
              />

              {/* Property Rating */}
              <StarRatingInput
                value={ratings.property}
                onChange={(value) => setRatings((prev) => ({ ...prev, property: value }))}
                label={t('properties.detail.reviewForm.propertyQuality')}
                required
              />

              {/* Service Rating */}
              <StarRatingInput
                value={ratings.service}
                onChange={(value) => setRatings((prev) => ({ ...prev, service: value }))}
                label={t('properties.detail.reviewForm.sellerService')}
                required
              />

              {/* Purchase Interest */}
              <StarRatingInput
                value={ratings.purchase}
                onChange={(value) => setRatings((prev) => ({ ...prev, purchase: value }))}
                label={t('properties.detail.reviewForm.purchaseInterest')}
              />

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('properties.detail.reviewForm.comments')}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('properties.detail.reviewForm.commentsPlaceholder')}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{t('properties.detail.reviewForm.charCount', { count: comments.length })}</p>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  {t('properties.detail.reviewForm.anonymous')}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? t('common.sending') : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('properties.detail.reviewForm.publish')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Dialog>
  );
};

