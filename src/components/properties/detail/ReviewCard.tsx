import React from 'react';
import { Star, ThumbsUp, Clock } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface ReviewCardProps {
  rating: number;
  serviceRating: number;
  overallSatisfaction: number;
  purchaseInterest?: number;
  comments?: string;
  createdAt: string;
  isAnonymous: boolean;
  userName?: string;
  helpfulCount?: number;
  onHelpful?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  rating,
  serviceRating,
  overallSatisfaction,
  purchaseInterest,
  comments,
  createdAt,
  isAnonymous,
  userName,
  helpfulCount = 0,
  onHelpful,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 30) return `Hace ${diffInDays} días`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  const renderStars = (ratingValue: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < ratingValue
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {isAnonymous ? '?' : userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {isAnonymous ? 'Usuario Anónimo' : userName || 'Usuario'}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDate(createdAt)}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {renderStars(overallSatisfaction)}
          </Badge>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-gray-600 mb-1">Propiedad</p>
            <div className="flex items-center gap-1">{renderStars(rating)}</div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Servicio</p>
            <div className="flex items-center gap-1">{renderStars(serviceRating)}</div>
          </div>
          {purchaseInterest && (
            <div>
              <p className="text-gray-600 mb-1">Interés</p>
              <div className="flex items-center gap-1">{renderStars(purchaseInterest)}</div>
            </div>
          )}
        </div>

        {/* Comments */}
        {comments && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">{comments}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onHelpful}
            className="text-xs text-gray-600"
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Útil ({helpfulCount})
          </Button>
        </div>
      </div>
    </Card>
  );
};

