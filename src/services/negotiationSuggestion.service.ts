import { DocumentAnalysisService } from './documentAnalysis';

export interface NegotiationConditions {
  // Estructura de pagos por etapas
  stages: PaymentStage[];
  
  // Plazos entre etapas
  timeframes: {
    opcionToPromesa: number; // días entre opción y promesa
    promesaToEscrituras: number; // días entre promesa y escrituras
  };
  
  // Método de pago sugerido
  suggestedPaymentMethod: string;
  
  // Información adicional
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface PaymentStage {
  name: string;
  type: 'opcion' | 'promesa' | 'escrituras';
  percentage: number; // Porcentaje del precio total
  amount: number; // Monto calculado
  description: string;
  contingencies?: string[]; // Condiciones asociadas
}

// Base de datos de precios por m2 para diferentes zonas de Medellín
const PRICE_PER_M2_BY_ZONE: Record<string, number> = {
  'el-poblado': 6000000, // $6M COP/m2
  'laureles': 3500000, // $3.5M COP/m2
  'envigado': 3200000, // $3.2M COP/m2
  'sabaneta': 2800000, // $2.8M COP/m2
  'bello': 2500000, // $2.5M COP/m2
  'default': 3000000, // $3M COP/m2 promedio
};

export class NegotiationSuggestionService {
  private static instance: NegotiationSuggestionService;
  
  private constructor() {}
  
  public static getInstance(): NegotiationSuggestionService {
    if (!NegotiationSuggestionService.instance) {
      NegotiationSuggestionService.instance = new NegotiationSuggestionService();
    }
    return NegotiationSuggestionService.instance;
  }
  
  /**
   * Genera sugerencias de condiciones de negociación usando IA
   */
  async generateConditions(
    propertyData: {
      area: number;
      neighborhood: string;
      price: number;
      propertyType: string;
    },
    userPreferences: {
      liquidityTimeframe: string; // 'fast' | 'normal' | 'flexible'
      liquidityAmount: number; // Porcentaje de liquidez inmediata
      riskTolerance: 'low' | 'medium' | 'high';
    }
  ): Promise<NegotiationConditions> {
    console.log('🤖 Generating negotiation conditions with AI...', { propertyData, userPreferences });
    
    // Calcular precio por m2
    const pricePerM2 = propertyData.price / propertyData.area;
    const neighborhoodKey = propertyData.neighborhood.toLowerCase().replace(/\s+/g, '-');
    const marketPricePerM2 = PRICE_PER_M2_BY_ZONE[neighborhoodKey] || PRICE_PER_M2_BY_ZONE['default'];
    const marketComparison = (pricePerM2 / marketPricePerM2) * 100; // Porcentaje vs mercado
    
    // Generar condiciones con IA usando Grok
    const prompt = this.buildPrompt(propertyData, userPreferences, {
      pricePerM2,
      marketPricePerM2,
      marketComparison
    });
    
    try {
      const documentAnalysisService = DocumentAnalysisService.getInstance() as any;
      if (!documentAnalysisService.xaiService) {
        console.warn('⚠️ XAI service not available, using default conditions');
        return this.generateDefaultConditions(propertyData.price);
      }
      
      console.log('📤 Sending prompt to Grok...');
      const response = await documentAnalysisService.xaiService.generateText(prompt);
      console.log('✅ Grok response received:', response);
      
      // Parsear respuesta JSON
      const suggested = this.parseAISuggestions(response, propertyData.price);
      console.log('📋 Parsed suggestions:', suggested);
      
      return suggested;
      
    } catch (error) {
      console.error('❌ Error generating AI suggestions:', error);
      // Fallback a condiciones por defecto
      return this.generateDefaultConditions(propertyData.price);
    }
  }
  
  private buildPrompt(
    propertyData: any,
    userPreferences: any,
    marketData: any
  ): string {
    return `Analiza esta propiedad en Medellín, Colombia y sugiere condiciones de negociación óptimas.

DATOS DE LA PROPIEDAD:
- Tipo: ${propertyData.propertyType}
- Área: ${propertyData.area} m²
- Barrio: ${propertyData.neighborhood}
- Precio: $${propertyData.price.toLocaleString('es-CO')} COP
- Precio por m²: $${marketData.pricePerM2.toLocaleString('es-CO')} COP/m²
- Precio promedio mercado zona: $${marketData.marketPricePerM2.toLocaleString('es-CO')} COP/m²
- Comparación vs mercado: ${marketData.marketComparison.toFixed(0)}%

PREFERENCIAS DEL VENDEDOR:
- Liquidez esperada: ${userPreferences.liquidityTimeframe}
- Porcentaje de liquidez inmediata: ${userPreferences.liquidityAmount}%
- Tolerancia al riesgo: ${userPreferences.riskTolerance}

CONTEXTO COLOMBIANO:
- Práctica común: Opción de compra (5-10%) → Promesa de compraventa (20-30%) → Escrituras públicas (70-80%)
- Plazos típicos: 15-30 días entre opción y promesa, 30-90 días entre promesa y escrituras
- Validación de documentos y firmas son estándar en cada etapa

RESPONDE EN FORMATO JSON:
{
  "stages": [
    {
      "name": "Opción de Compra",
      "type": "opcion",
      "percentage": número del 5 al 15,
      "description": "descripción breve",
      "contingencies": ["lista", "de condiciones"]
    },
    {
      "name": "Promesa de Compraventa",
      "type": "promesa",
      "percentage": número del 20 al 35,
      "description": "descripción breve",
      "contingencies": ["lista", "de condiciones"]
    },
    {
      "name": "Firma de Escrituras",
      "type": "escrituras",
      "percentage": número restante para 100,
      "description": "descripción breve",
      "contingencies": ["lista", "de condiciones"]
    }
  ],
  "timeframes": {
    "opcionToPromesa": número de días sugerido,
    "promesaToEscrituras": número de días sugerido
  },
  "suggestedPaymentMethod": "método sugerido",
  "reasoning": "breve explicación de por qué estas condiciones",
  "riskLevel": "low/medium/high",
  "confidence": número del 0 al 1
}

IMPORTANTE: 
- Los porcentajes deben sumar exactamente 100%
- Considera el contexto de Medellín, Colombia
- Adapta según la tolerancia al riesgo del vendedor
- Si es liquidez "fast", sugiere más % en las primeras etapas

Responde SOLO con JSON válido sin comentarios.`;
  }
  
  private parseAISuggestions(response: string, totalPrice: number): NegotiationConditions {
    try {
      // Limpiar respuesta y extraer JSON
      const cleaned = response.trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validar y ajustar porcentajes
      const stages = this.validateAndNormalizeStages(parsed.stages, totalPrice);
      
      return {
        stages,
        timeframes: {
          opcionToPromesa: parsed.timeframes?.opcionToPromesa || 15,
          promesaToEscrituras: parsed.timeframes?.promesaToEscrituras || 30
        },
        suggestedPaymentMethod: parsed.suggestedPaymentMethod || 'transferencia_bancaria',
        reasoning: parsed.reasoning || 'Condiciones generadas automáticamente',
        riskLevel: parsed.riskLevel || 'medium',
        confidence: parsed.confidence || 0.7
      };
      
    } catch (error) {
      console.error('❌ Error parsing AI suggestions:', error);
      // Fallback a condiciones por defecto
      return this.generateDefaultConditions(totalPrice);
    }
  }
  
  private validateAndNormalizeStages(stages: any[], totalPrice: number): PaymentStage[] {
    // Calcular total de porcentajes
    const totalPercent = stages.reduce((sum, stage) => sum + (stage.percentage || 0), 0);
    
    // Normalizar si no suman 100
    const normalizedStages = stages.map(stage => ({
      ...stage,
      percentage: (stage.percentage / totalPercent) * 100
    }));
    
    // Calcular montos
    return normalizedStages.map(stage => ({
      name: stage.name,
      type: stage.type,
      percentage: stage.percentage,
      amount: (totalPrice * stage.percentage) / 100,
      description: stage.description || '',
      contingencies: stage.contingencies || []
    }));
  }
  
  public generateDefaultConditions(totalPrice: number): NegotiationConditions {
    return {
      stages: [
        {
          name: 'Opción de Compra',
          type: 'opcion',
          percentage: 5,
          amount: (totalPrice * 5) / 100,
          description: 'Señal o pago inicial para reservar la propiedad',
          contingencies: [
            'Validación de documentos',
            'Firma de carta de intención',
            'Confirmación de identidad',
            'Verificación de capacidad económica'
          ]
        },
        {
          name: 'Promesa de Compraventa',
          type: 'promesa',
          percentage: 25,
          amount: (totalPrice * 25) / 100,
          description: 'Avance adicional que formaliza la intención de compra',
          contingencies: [
            'Firma de promesa de compraventa',
            'Aprobación de crédito (si aplica)',
            'Avalúo satisfactorio',
            'Inspección y revisión documental'
          ]
        },
        {
          name: 'Firma de Escrituras Públicas',
          type: 'escrituras',
          percentage: 70,
          amount: (totalPrice * 70) / 100,
          description: 'Pago final y entrega de la propiedad',
          contingencies: [
            'Firma de escrituras públicas ante notaría',
            'Transferencia del título de propiedad',
            'Pago completo de saldo',
            'Entrega de llaves y posesión'
          ]
        }
      ],
      timeframes: {
        opcionToPromesa: 15,
        promesaToEscrituras: 30
      },
      suggestedPaymentMethod: 'transferencia_bancaria',
      reasoning: 'Condiciones estándar de mercado colombiano con balances conservadores',
      riskLevel: 'low',
      confidence: 0.95
    };
  }
}

// Export singleton instance
export const negotiationSuggestionService = NegotiationSuggestionService.getInstance();
