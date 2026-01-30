import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AnimatedCard } from '../animations/AnimatedCard';
import { AnimatedProgress } from '../animations/AnimatedProgress';
import { AnimatedList } from '../animations/AnimatedList';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Star,
  Award,
  Lightbulb,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
  Handshake
} from 'lucide-react';
import { Offer } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface NegotiationProgressProps {
  offerId: string;
  onProgressUpdate?: (progress: number) => void;
}

interface Milestone {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  weight: number;
  icon: React.ReactNode;
  nextAction?: string;
}

export const NegotiationProgress: React.FC<NegotiationProgressProps> = ({
  offerId,
  onProgressUpdate
}) => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffer = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .single();

        if (error) {
          console.error('Error loading offer:', error);
          return;
        }

        setOffer(data);
        calculateProgress(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [offerId]);

  const calculateProgress = (offerData: Offer) => {
    const milestonesData: Milestone[] = [
      {
        id: 'offer_sent',
        label: 'Oferta Enviada',
        description: 'La oferta inicial ha sido enviada al vendedor',
        completed: true,
        weight: 20,
        icon: <FileText className="h-4 w-4" />,
        nextAction: 'Esperando respuesta del vendedor'
      },
      {
        id: 'visit_completed',
        label: 'Visita Realizada',
        description: 'Se ha completado la visita a la propiedad',
        completed: offerData.milestones_completed?.visit_completed || false,
        weight: 15,
        icon: <Calendar className="h-4 w-4" />,
        nextAction: 'Programar visita si no se ha realizado'
      },
      {
        id: 'price_agreed',
        label: 'Precio Acordado',
        description: 'Ambas partes han acordado el precio final',
        completed: offerData.milestones_completed?.price_agreed || false,
        weight: 25,
        icon: <DollarSign className="h-4 w-4" />,
        nextAction: 'Negociar precio si no está acordado'
      },
      {
        id: 'payment_agreed',
        label: 'Pago Acordado',
        description: 'Se ha acordado el método y condiciones de pago',
        completed: offerData.milestones_completed?.payment_agreed || false,
        weight: 15,
        icon: <Handshake className="h-4 w-4" />,
        nextAction: 'Definir método de pago'
      },
      {
        id: 'closing_date_agreed',
        label: 'Fecha de Cierre Acordada',
        description: 'Se ha establecido la fecha de cierre de la transacción',
        completed: offerData.milestones_completed?.closing_date_agreed || false,
        weight: 10,
        icon: <Calendar className="h-4 w-4" />,
        nextAction: 'Acordar fecha de cierre'
      },
      {
        id: 'conditions_agreed',
        label: 'Condiciones Acordadas',
        description: 'Todas las condiciones especiales han sido acordadas',
        completed: offerData.milestones_completed?.conditions_agreed || false,
        weight: 10,
        icon: <CheckCircle className="h-4 w-4" />,
        nextAction: 'Revisar condiciones especiales'
      },
      {
        id: 'offer_accepted',
        label: 'Oferta Aceptada',
        description: 'La oferta ha sido formalmente aceptada',
        completed: offerData.status === 'accepted',
        weight: 5,
        icon: <Award className="h-4 w-4" />,
        nextAction: 'Proceder con la documentación'
      }
    ];

    setMilestones(milestonesData);

    // Calculate total progress
    const totalProgress = milestonesData.reduce((sum, milestone) => {
      return sum + (milestone.completed ? milestone.weight : 0);
    }, 0);

    setProgress(totalProgress);

    if (onProgressUpdate) {
      onProgressUpdate(totalProgress);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 100) return '¡Negociación completada!';
    if (progress >= 90) return 'Casi terminado';
    if (progress >= 70) return 'Muy avanzado';
    if (progress >= 50) return 'En progreso';
    if (progress >= 30) return 'Iniciando';
    return 'Primeros pasos';
  };

  const getNextSteps = () => {
    const incompleteMilestones = milestones.filter(m => !m.completed);
    if (incompleteMilestones.length === 0) {
      return ['¡Felicidades! La negociación está completa.'];
    }
    return incompleteMilestones.map(m => m.nextAction).filter(Boolean);
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 100) {
      return {
        message: '¡Excelente trabajo! Has completado exitosamente la negociación.',
        emoji: '🎉',
        color: 'text-green-600'
      };
    }
    if (progress >= 80) {
      return {
        message: '¡Estás muy cerca! Solo faltan algunos detalles por acordar.',
        emoji: '🚀',
        color: 'text-blue-600'
      };
    }
    if (progress >= 60) {
      return {
        message: '¡Buen progreso! La negociación avanza favorablemente.',
        emoji: '👍',
        color: 'text-blue-600'
      };
    }
    if (progress >= 40) {
      return {
        message: '¡Sigue así! Cada paso te acerca más al acuerdo.',
        emoji: '💪',
        color: 'text-yellow-600'
      };
    }
    return {
      message: '¡Comienza la negociación! Cada paso cuenta.',
      emoji: '🌟',
      color: 'text-orange-600'
    };
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!offer) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No se encontró la oferta
          </h3>
          <p className="text-muted-foreground">
            No se pudo cargar la información de progreso
          </p>
        </div>
      </Card>
    );
  }

  const motivational = getMotivationalMessage(progress);
  const nextSteps = getNextSteps();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Progreso de la Negociación</h3>
              <p className="text-sm text-muted-foreground">
                {getProgressLabel(progress)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getProgressColor(progress)}`}>
              {progress}%
            </div>
            <div className="text-sm text-muted-foreground">
              {milestones.filter(m => m.completed).length} de {milestones.length} hitos
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Inicio</span>
            <span>Negociación</span>
            <span>Acuerdo</span>
            <span>Completado</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className={`mt-4 p-4 rounded-lg bg-muted/50 ${motivational.color}`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{motivational.emoji}</span>
            <span className="font-medium">{motivational.message}</span>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Hitos de la Negociación</h4>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                milestone.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {milestone.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {milestone.icon}
                  <span className={`font-medium ${
                    milestone.completed ? 'text-green-800' : 'text-foreground'
                  }`}>
                    {milestone.label}
                  </span>
                  <Badge 
                    variant={milestone.completed ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {milestone.weight}%
                  </Badge>
                </div>
                <p className={`text-sm ${
                  milestone.completed ? 'text-green-700' : 'text-muted-foreground'
                }`}>
                  {milestone.description}
                </p>
                {!milestone.completed && milestone.nextAction && (
                  <p className="text-xs text-orange-600 mt-1">
                    <Lightbulb className="h-3 w-3 inline mr-1" />
                    {milestone.nextAction}
                  </p>
                )}
              </div>

              {milestone.completed && (
                <div className="flex-shrink-0">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-primary" />
            Próximos Pasos
          </h4>
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Celebration for 100% */}
      {progress >= 100 && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              ¡Negociación Completada!
            </h3>
            <p className="text-green-700">
              Has alcanzado todos los hitos de la negociación. ¡Excelente trabajo!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
