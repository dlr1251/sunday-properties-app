import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Scale, 
  Calculator, 
  FileText, 
  TrendingUp,
  Shield,
  CheckCircle,
  Star,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { KnowledgeBaseEntry, AdvisorySession } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface AdvisoryAssistantProps {
  userId: string;
  propertyId?: string;
  context: {
    type: 'property_upload' | 'offer_creation' | 'negotiation' | 'contract_review';
    data: Record<string, any>;
  };
  onAdviceGenerated?: (advice: KnowledgeBaseEntry) => void;
}

interface AdvisoryContent {
  title: string;
  content: string;
  level: 'fundamental' | 'best_practices' | 'advanced';
  category: 'legal' | 'financial' | 'tax' | 'process';
  suggestions: string[];
  warnings?: string[];
  tips?: string[];
}

export const AdvisoryAssistant: React.FC<AdvisoryAssistantProps> = ({
  userId,
  propertyId,
  context,
  onAdviceGenerated
}) => {
  const [advisoryContent, setAdvisoryContent] = useState<AdvisoryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  // Generate advisory content based on context
  useEffect(() => {
    const generateAdvisory = async () => {
      setLoading(true);
      
      try {
        // Call Supabase function to generate AI advisory
        const { data, error } = await supabase.rpc('generate_ai_advisory', {
          p_user_id: userId,
          p_property_id: propertyId,
          p_context: context,
          p_level: 'fundamental' // Start with fundamental level
        });

        if (error) {
          console.error('Error generating advisory:', error);
          // Fallback to static content
          setAdvisoryContent(generateStaticAdvisory(context));
          return;
        }

        if (data) {
          setAdvisoryContent(data);
        } else {
          setAdvisoryContent(generateStaticAdvisory(context));
        }
      } catch (error) {
        console.error('Error:', error);
        setAdvisoryContent(generateStaticAdvisory(context));
      } finally {
        setLoading(false);
      }
    };

    generateAdvisory();
  }, [userId, propertyId, context]);

  const generateStaticAdvisory = (context: any): AdvisoryContent => {
    switch (context.type) {
      case 'property_upload':
        return {
          title: 'Recomendaciones para Publicar tu Propiedad',
          content: 'Te ayudamos a configurar las mejores condiciones de venta para maximizar el interés de compradores y cerrar una transacción exitosa.',
          level: 'fundamental',
          category: 'process',
          suggestions: [
            'Establece un precio competitivo basado en el mercado local',
            'Configura condiciones de pago flexibles para atraer más compradores',
            'Considera incluir gastos notariales en el precio para facilitar la venta',
            'Añade fotos de alta calidad que muestren los mejores aspectos de la propiedad'
          ],
          warnings: [
            'Evita sobrepreciar la propiedad - esto puede alejar compradores',
            'Asegúrate de tener todos los documentos legales en orden antes de publicar'
          ],
          tips: [
            'El precio debe estar entre el 95-105% del valor de mercado',
            'Incluye información detallada sobre la ubicación y servicios cercanos'
          ]
        };

      case 'offer_creation':
        return {
          title: 'Guía para Crear una Oferta Atractiva',
          content: 'Aprende a estructurar tu oferta para maximizar las posibilidades de aceptación y crear una propuesta que destaque entre la competencia.',
          level: 'best_practices',
          category: 'financial',
          suggestions: [
            'Incluye un precio competitivo pero realista',
            'Propón condiciones de pago claras y factibles',
            'Establece un plazo de cierre razonable',
            'Menciona tu capacidad de pago y financiación'
          ],
          warnings: [
            'No ofrezcas un precio demasiado bajo - puede parecer poco serio',
            'Evita condiciones muy restrictivas que limiten la flexibilidad'
          ],
          tips: [
            'Una oferta del 95-98% del precio de venta suele ser bien recibida',
            'Incluye una carta de presentación personalizada'
          ]
        };

      case 'negotiation':
        return {
          title: 'Estrategias de Negociación Inteligente',
          content: 'Domina las técnicas de negociación inmobiliaria para alcanzar acuerdos beneficiosos para todas las partes involucradas.',
          level: 'advanced',
          category: 'process',
          suggestions: [
            'Mantén la comunicación abierta y profesional',
            'Sé flexible en aspectos menores para ganar en los importantes',
            'Documenta todos los acuerdos por escrito',
            'Considera el timing del mercado en tus decisiones'
          ],
          warnings: [
            'No presiones demasiado - puede romper la negociación',
            'Evita cambios de última hora sin justificación'
          ],
          tips: [
            'El 80% de las negociaciones se cierran en las primeras 3 rondas',
            'Siempre ten un plan B preparado'
          ]
        };

      case 'contract_review':
        return {
          title: 'Revisión Legal de Contratos',
          content: 'Asegúrate de que todos los documentos legales estén correctamente estructurados y protejan tus intereses.',
          level: 'fundamental',
          category: 'legal',
          suggestions: [
            'Revisa todas las cláusulas antes de firmar',
            'Verifica que los datos personales y de la propiedad sean correctos',
            'Asegúrate de entender todas las obligaciones y derechos',
            'Consulta con un abogado especializado si tienes dudas'
          ],
          warnings: [
            'Nunca firmes un documento sin leerlo completamente',
            'Presta atención especial a las cláusulas de penalización'
          ],
          tips: [
            'Los contratos deben incluir fecha de vencimiento clara',
            'Todas las modificaciones deben ser por escrito'
          ]
        };

      default:
        return {
          title: 'Asesoría Personalizada',
          content: 'Te proporcionamos recomendaciones específicas para tu situación actual.',
          level: 'fundamental',
          category: 'process',
          suggestions: ['Revisa la información proporcionada', 'Consulta con un profesional si tienes dudas']
        };
    }
  };

  const saveAdviceToKnowledgeBase = async (content: AdvisoryContent) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: userId,
          property_id: propertyId,
          category: content.category,
          level: content.level,
          title: content.title,
          content: content.content,
          context: context,
          source: 'ai_generated'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving advice:', error);
        return;
      }

      if (onAdviceGenerated && data) {
        onAdviceGenerated(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const recordFeedback = async (rating: 'helpful' | 'not_helpful') => {
    if (!advisoryContent) return;

    setFeedback(rating);

    try {
      await supabase
        .from('advisory_sessions')
        .insert({
          user_id: userId,
          property_id: propertyId,
          session_type: context.type,
          context: context,
          advice_given: advisoryContent,
          user_feedback: { rating },
          effectiveness_score: rating === 'helpful' ? 5 : 1
        });
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fundamental':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'best_practices':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'advanced':
        return <Star className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal':
        return <Scale className="h-4 w-4 text-red-500" />;
      case 'financial':
        return <Calculator className="h-4 w-4 text-green-500" />;
      case 'tax':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'process':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'fundamental':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'best_practices':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Generando asesoría personalizada...</span>
        </div>
      </Card>
    );
  }

  if (!advisoryContent) {
    return null;
  }

  // Save advice to knowledge base
  useEffect(() => {
    if (advisoryContent) {
      saveAdviceToKnowledgeBase(advisoryContent);
    }
  }, [advisoryContent]);

  return (
    <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              {getLevelIcon(advisoryContent.level)}
              <span>{advisoryContent.title}</span>
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getLevelColor(advisoryContent.level)}>
                {advisoryContent.level === 'fundamental' ? 'Fundamental' :
                 advisoryContent.level === 'best_practices' ? 'Mejores Prácticas' : 'Avanzado'}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                {getCategoryIcon(advisoryContent.category)}
                <span className="ml-1">
                  {advisoryContent.category === 'legal' ? 'Legal' :
                   advisoryContent.category === 'financial' ? 'Financiero' :
                   advisoryContent.category === 'tax' ? 'Fiscal' : 'Proceso'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-muted-foreground mb-4">
        {advisoryContent.content}
      </p>

      {isExpanded && (
        <div className="space-y-4">
          {/* Suggestions */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Recomendaciones
            </h4>
            <ul className="space-y-2">
              {advisoryContent.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          {advisoryContent.warnings && advisoryContent.warnings.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                <div className="font-semibold text-orange-800 mb-2">Advertencias importantes:</div>
                <ul className="space-y-1">
                  {advisoryContent.warnings.map((warning, index) => (
                    <li key={index} className="text-orange-700 text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {advisoryContent.tips && advisoryContent.tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                Consejos Pro
              </h4>
              <ul className="space-y-2">
                {advisoryContent.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">¿Te resultó útil esta asesoría?</span>
            <div className="flex space-x-2">
              <Button
                variant={feedback === 'helpful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => recordFeedback('helpful')}
                disabled={feedback !== null}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Útil
              </Button>
              <Button
                variant={feedback === 'not_helpful' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => recordFeedback('not_helpful')}
                disabled={feedback !== null}
              >
                <X className="h-4 w-4 mr-1" />
                No útil
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
