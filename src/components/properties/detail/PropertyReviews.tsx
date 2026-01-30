import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Star, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select } from '../../ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PropertyReviewsProps {
  propertyId: string;
  userId?: string;
}

interface Review {
  id: string;
  property_rating: number;
  service_rating: number;
  overall_satisfaction: number;
  purchase_interest?: number;
  comments?: string;
  is_anonymous: boolean;
  created_at: string;
  user_profile?: {
    full_name: string;
  };
}

export const PropertyReviews: React.FC<PropertyReviewsProps> = ({ propertyId, userId }) => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviewsAndStats();
    checkIfReviewed();
  }, [propertyId, user?.id]);

  const fetchReviewsAndStats = async () => {
    try {
      setLoading(true);

      // Fetch reviews - need to get visit feedback for this property
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('id')
        .eq('property_id', propertyId)
        .eq('status', 'completed');

      if (visitsError) throw visitsError;

      const visitIds = visitsData?.map((v: any) => v.id) || [];

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('visit_feedback')
        .select('*')
        .in('visit_id', visitIds);

      if (reviewsError) throw reviewsError;

      // Transform reviews data
      const transformedReviews = reviewsData?.map((review: any) => ({
        ...review,
        user_profile: review.user_id ? { full_name: 'Usuario' } : null,
      })) || [];

      setReviews(transformedReviews);

      // Fetch stats using the database function
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_property_feedback_stats',
        { property_id: propertyId }
      );

      if (statsError) throw statsError;
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const checkIfReviewed = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visit_feedback')
        .select('id')
        .eq('user_id', user.id)
        .eq('visit_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      setHasReviewed(!!data);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviewsAndStats();
    checkIfReviewed();
    toast.success('Tu reseña ha sido publicada');
  };

  const filteredAndSortedReviews = [...reviews]
    .filter((review) => (filterRating ? review.overall_satisfaction === filterRating : true))
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0; // Add helpful sorting logic here
    });

  const renderStarRating = (average: number, total: number) => {
    const fullStars = Math.floor(average);
    const hasHalfStar = average % 1 >= 0.5;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < fullStars
                  ? 'fill-yellow-400 text-yellow-400'
                  : i === fullStars && hasHalfStar
                  ? 'fill-yellow-400/50 text-yellow-400/50'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-2xl font-bold">{average.toFixed(1)}</span>
        <span className="text-gray-500">({total} reseñas)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Reseñas y Calificaciones</h2>
            {stats && (
              <div className="flex items-center gap-4">
                {renderStarRating(stats.avg_overall_satisfaction, stats.total_reviews)}
              </div>
            )}
          </div>

          {user && !hasReviewed && (
            <Button onClick={() => setShowReviewForm(true)}>
              Escribir Reseña
            </Button>
          )}
        </div>

        {/* Rating Distribution */}
        {stats && (
          <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.rating_distribution?.[`${rating}_stars`] || 0;
              const percentage = stats.total_reviews
                ? (count / stats.total_reviews) * 100
                : 0;

              return (
                <div key={rating} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium">{rating}</span>
                  </div>
                  <div className="h-32 bg-gray-200 rounded relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filterRating || 'all'}
              onChange={(e) =>
                setFilterRating(e.target.value === 'all' ? null : Number(e.target.value))
              }
            >
              <option value="all">Todas las calificaciones</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
            >
              <option value="recent">Más recientes</option>
              <option value="helpful">Más útiles</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.property_rating}
                serviceRating={review.service_rating}
                overallSatisfaction={review.overall_satisfaction}
                purchaseInterest={review.purchase_interest}
                comments={review.comments || undefined}
                createdAt={review.created_at}
                isAnonymous={review.is_anonymous}
                userName={review.user_profile?.full_name}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No hay reseñas para mostrar</p>
              {filterRating && <p className="text-sm mt-2">Intenta con un filtro diferente</p>}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          propertyId={propertyId}
          onSubmit={handleReviewSubmitted}
        />
      )}
    </Card>
  );
};

