import { getIntlLocale } from '../i18n';
import { supabase } from '../lib/supabase';
import { appendAiPromptDisclaimer } from '@/lib/ai/append-prompt-disclaimer';

// Reuse XAI service from documentAnalysis
class XAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      console.log('🤖 Calling xAI API for legal document generation');

      const fullPrompt = appendAiPromptDisclaimer(prompt);

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-4-fast-reasoning',
          messages: [{ role: 'user', content: fullPrompt }],
          temperature: 0.3, // Lower temperature for more consistent legal documents
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('xAI API error response:', errorText);
        throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ xAI API response received');

      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      throw new Error('Invalid response format from xAI');
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }
}

export interface PropertyData {
  id: string;
  title: string;
  address: string;
  city: string;
  area: number;
  price: number;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  strata?: number;
  year_built?: number;
  // Información adicional del estudio de títulos
  registration_info?: {
    folio_number?: string;
    registration_date?: string;
    notary_name?: string;
    notary_number?: string;
    folio_status?: string;
    annotations?: Array<{
      annotation_number: string;
      date: string;
      radicacion: string;
      document: string;
      value?: number;
      specification: string;
      parties: string;
    }>;
  };
  legal_description?: string; // Descripción legal completa basada en CLYT y escrituras
}

export interface PartyData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  id_number?: string; // Cédula de ciudadanía
  nationality?: string;
  address?: string;
  dob?: string; // Fecha de nacimiento
  marital_status?: string;
  occupation?: string;
}

export interface OfferData {
  id: string;
  offer_price: number;
  payment_method: string;
  closing_date: string;
  conditions?: string[];
  financing_details?: any;
  down_payment?: number;
}

export interface CaseData {
  id: string;
  property: PropertyData;
  buyer: PartyData;
  seller: PartyData;
  lawyer: PartyData;
  offer: OfferData;
}

export class LegalDocumentGenerationService {
  private static instance: LegalDocumentGenerationService;
  private xaiService: XAIService | null = null;

  private constructor() {
    const apiKey = (import.meta as any).env?.VITE_XAI_API_KEY || '';
    if (apiKey) {
      this.xaiService = new XAIService(apiKey);
    } else {
      console.warn('XAI API key not found. Legal document generation will not work.');
    }
  }

  public static getInstance(): LegalDocumentGenerationService {
    if (!LegalDocumentGenerationService.instance) {
      LegalDocumentGenerationService.instance = new LegalDocumentGenerationService();
    }
    return LegalDocumentGenerationService.instance;
  }

  /**
   * Generate Letter of Intent (Carta de Intención)
   */
  public async generateLetterOfIntent(caseData: CaseData): Promise<string> {
    if (!this.xaiService) {
      throw new Error('XAI service not initialized');
    }

    const prompt = `Eres un abogado colombiano especializado en derecho inmobiliario. Genera una Carta de Intención (Letter of Intent) profesional y completa en español para la siguiente transacción inmobiliaria:

**INFORMACIÓN DE LA PROPIEDAD:**
- Dirección: ${caseData.property.address}, ${caseData.property.city}
- Tipo: ${this.translatePropertyType(caseData.property.property_type)}
- Área: ${caseData.property.area} m²
${caseData.property.bedrooms ? `- Habitaciones: ${caseData.property.bedrooms}` : ''}
${caseData.property.bathrooms ? `- Baños: ${caseData.property.bathrooms}` : ''}
${caseData.property.strata ? `- Estrato: ${caseData.property.strata}` : ''}
- Precio de Lista: ${this.formatCurrency(caseData.property.price)}

**COMPRADOR:**
- Nombre: ${caseData.buyer.full_name}
- Email: ${caseData.buyer.email}
${caseData.buyer.phone ? `- Teléfono: ${caseData.buyer.phone}` : ''}
${caseData.buyer.id_number ? `- Cédula: ${caseData.buyer.id_number}` : ''}

**VENDEDOR:**
- Nombre: ${caseData.seller.full_name}
- Email: ${caseData.seller.email}
${caseData.seller.phone ? `- Teléfono: ${caseData.seller.phone}` : ''}
${caseData.seller.id_number ? `- Cédula: ${caseData.seller.id_number}` : ''}

**TÉRMINOS DE LA OFERTA:**
- Precio Ofrecido: ${this.formatCurrency(caseData.offer.offer_price)}
- Método de Pago: ${this.translatePaymentMethod(caseData.offer.payment_method)}
- Fecha de Cierre Propuesta: ${this.formatDate(caseData.offer.closing_date)}
${caseData.offer.down_payment ? `- Cuota Inicial: ${this.formatCurrency(caseData.offer.down_payment)}` : ''}
${caseData.offer.conditions && caseData.offer.conditions.length > 0 ? `- Condiciones Especiales: ${caseData.offer.conditions.join(', ')}` : ''}

**ABOGADO ASIGNADO:**
- Nombre: ${caseData.lawyer.full_name}
- Email: ${caseData.lawyer.email}

**INSTRUCCIONES:**
1. Genera una Carta de Intención formal y profesional siguiendo las normas legales colombianas
2. Incluye todas las cláusulas estándar para transacciones inmobiliarias en Colombia
3. Menciona que esta carta NO es vinculante legalmente pero expresa la intención seria de compra
4. Incluye secciones para: Identificación de las partes, Descripción del inmueble, Precio y forma de pago, Plazo para firma de promesa de compraventa, Condiciones suspensivas (si aplican), Gastos y costos
5. Usa lenguaje legal apropiado pero claro
6. Incluye espacios para firmas al final
7. Fecha el documento con la fecha actual
8. Formato profesional con encabezados y numeración

Genera SOLO el contenido del documento, sin introducciones ni explicaciones adicionales.`;

    return await this.xaiService.generateText(prompt);
  }

  /**
   * Generate Promesa de Compraventa
   */
  public async generatePromesaCompraventa(caseData: CaseData): Promise<string> {
    if (!this.xaiService) {
      throw new Error('XAI service not initialized');
    }

    const prompt = `Eres un abogado colombiano especializado en derecho inmobiliario. Genera una Promesa de Compraventa completa y legalmente vinculante en español para la siguiente transacción:

**INFORMACIÓN DE LA PROPIEDAD:**
- Dirección: ${caseData.property.address}, ${caseData.property.city}
- Tipo: ${this.translatePropertyType(caseData.property.property_type)}
- Área: ${caseData.property.area} m²
${caseData.property.bedrooms ? `- Habitaciones: ${caseData.property.bedrooms}` : ''}
${caseData.property.bathrooms ? `- Baños: ${caseData.property.bathrooms}` : ''}
${caseData.property.strata ? `- Estrato: ${caseData.property.strata}` : ''}
${caseData.property.year_built ? `- Año de Construcción: ${caseData.property.year_built}` : ''}
${caseData.property.legal_description ? `- Descripción Legal: ${caseData.property.legal_description}` : ''}
${caseData.property.registration_info ? `
**INFORMACIÓN REGISTRAL (Basada en CLYT):**
${caseData.property.registration_info.folio_number ? `- Número de Folio: ${caseData.property.registration_info.folio_number}` : ''}
${caseData.property.registration_info.registration_date ? `- Fecha de Registro: ${this.formatDate(caseData.property.registration_info.registration_date)}` : ''}
${caseData.property.registration_info.notary_name ? `- Notaría: ${caseData.property.registration_info.notary_name}` : ''}
${caseData.property.registration_info.notary_number ? `- Número de Notaría: ${caseData.property.registration_info.notary_number}` : ''}
${caseData.property.registration_info.folio_status ? `- Estado del Folio: ${caseData.property.registration_info.folio_status}` : ''}
${caseData.property.registration_info.annotations && caseData.property.registration_info.annotations.length > 0 ? `- Anotaciones Registradas: ${caseData.property.registration_info.annotations.map(a => `${a.annotation_number} (${a.date}): ${a.specification}`).join('; ')}` : ''}
` : ''}

**COMPRADOR (PROMITENTE COMPRADOR):**
- Nombre Completo: ${caseData.buyer.full_name}
${caseData.buyer.id_number ? `- Cédula de Ciudadanía: ${caseData.buyer.id_number}` : ''}
${caseData.buyer.nationality ? `- Nacionalidad: ${caseData.buyer.nationality}` : ''}
${caseData.buyer.dob ? `- Fecha de Nacimiento: ${this.formatDate(caseData.buyer.dob)}` : ''}
${caseData.buyer.address ? `- Dirección: ${caseData.buyer.address}` : ''}
- Email: ${caseData.buyer.email}
${caseData.buyer.phone ? `- Teléfono: ${caseData.buyer.phone}` : ''}
${caseData.buyer.marital_status ? `- Estado Civil: ${caseData.buyer.marital_status}` : ''}
${caseData.buyer.occupation ? `- Ocupación: ${caseData.buyer.occupation}` : ''}

**VENDEDOR (PROMITENTE VENDEDOR):**
- Nombre Completo: ${caseData.seller.full_name}
${caseData.seller.id_number ? `- Cédula de Ciudadanía: ${caseData.seller.id_number}` : ''}
${caseData.seller.nationality ? `- Nacionalidad: ${caseData.seller.nationality}` : ''}
${caseData.seller.dob ? `- Fecha de Nacimiento: ${this.formatDate(caseData.seller.dob)}` : ''}
${caseData.seller.address ? `- Dirección: ${caseData.seller.address}` : ''}
- Email: ${caseData.seller.email}
${caseData.seller.phone ? `- Teléfono: ${caseData.seller.phone}` : ''}
${caseData.seller.marital_status ? `- Estado Civil: ${caseData.seller.marital_status}` : ''}
${caseData.seller.occupation ? `- Ocupación: ${caseData.seller.occupation}` : ''}

**TÉRMINOS ACORDADOS:**
- Precio de Venta: ${this.formatCurrency(caseData.offer.offer_price)}
- Método de Pago: ${this.translatePaymentMethod(caseData.offer.payment_method)}
- Fecha de Cierre: ${this.formatDate(caseData.offer.closing_date)}
${caseData.offer.down_payment ? `- Cuota Inicial: ${this.formatCurrency(caseData.offer.down_payment)}` : ''}
${caseData.offer.conditions && caseData.offer.conditions.length > 0 ? `- Condiciones Especiales: ${caseData.offer.conditions.join(', ')}` : ''}

**INSTRUCCIONES:**
1. Genera una Promesa de Compraventa completa siguiendo el Código Civil Colombiano
2. Incluye TODAS las cláusulas obligatorias según la ley colombiana:
   - Identificación completa de las partes
   - Descripción detallada del inmueble
   - Precio y forma de pago
   - Plazo para otorgar la escritura pública
   - Obligaciones de cada parte
   - Cláusula penal (multa por incumplimiento)
   - Paz y salvo de servicios públicos y administración
   - Tradición del inmueble
   - Gastos notariales y de registro
   - Condiciones suspensivas y resolutorias
   - Solución de controversias
3. Este documento ES LEGALMENTE VINCULANTE
4. Incluye referencias al Código Civil Colombiano donde sea apropiado
5. Formato profesional con numeración de cláusulas
6. Espacios para firmas, huellas y testigos
7. Fecha actual

Genera SOLO el contenido del documento legal, sin introducciones.`;

    return await this.xaiService.generateText(prompt);
  }

  /**
   * Generate Minuta de Escritura Pública
   */
  public async generateMinutaEscritura(caseData: CaseData): Promise<string> {
    if (!this.xaiService) {
      throw new Error('XAI service not initialized');
    }

    const prompt = `Eres un abogado colombiano especializado en derecho notarial. Genera una Minuta de Escritura Pública completa para la compraventa de inmueble:

**PROPIEDAD:**
- Dirección: ${caseData.property.address}, ${caseData.property.city}
- Tipo: ${this.translatePropertyType(caseData.property.property_type)}
- Área: ${caseData.property.area} m²
${caseData.property.year_built ? `- Año: ${caseData.property.year_built}` : ''}

**VENDEDOR:**
- Nombre: ${caseData.seller.full_name}
${caseData.seller.id_number ? `- CC: ${caseData.seller.id_number}` : ''}

**COMPRADOR:**
- Nombre: ${caseData.buyer.full_name}
${caseData.buyer.id_number ? `- CC: ${caseData.buyer.id_number}` : ''}

**VALOR DE LA TRANSACCIÓN:**
- Precio: ${this.formatCurrency(caseData.offer.offer_price)}

**INSTRUCCIONES:**
1. Genera una Minuta de Escritura Pública siguiendo el formato notarial colombiano
2. Incluye:
   - Comparecientes (identificación completa)
   - Antecedentes del inmueble
   - Objeto del contrato (compraventa)
   - Precio y forma de pago
   - Tradición y entrega material
   - Saneamiento por evicción
   - Declaraciones tributarias
   - Paz y salvos
   - Linderos y descripción del inmueble
3. Usa lenguaje notarial formal
4. Incluye referencias legales (Código Civil, Código de Comercio)
5. Formato para presentar ante notaría
6. Espacios para firmas notariales

Genera SOLO la minuta, sin explicaciones adicionales.`;

    return await this.xaiService.generateText(prompt);
  }

  /**
   * Generate Otrosí (Amendment)
   */
  public async generateOtrosi(
    originalDocType: 'promesa' | 'escritura',
    amendments: string[],
    caseData: CaseData
  ): Promise<string> {
    if (!this.xaiService) {
      throw new Error('XAI service not initialized');
    }

    const docTypeName = originalDocType === 'promesa' ? 'Promesa de Compraventa' : 'Escritura Pública';

    const prompt = `Eres un abogado colombiano. Genera un documento de OTROSÍ para modificar una ${docTypeName}:

**DOCUMENTO ORIGINAL:**
- Tipo: ${docTypeName}
- Partes: ${caseData.buyer.full_name} (Comprador) y ${caseData.seller.full_name} (Vendedor)
- Propiedad: ${caseData.property.address}, ${caseData.property.city}
- Precio Original: ${this.formatCurrency(caseData.offer.offer_price)}

**MODIFICACIONES A REALIZAR:**
${amendments.map((amendment, index) => `${index + 1}. ${amendment}`).join('\n')}

**INSTRUCCIONES:**
1. Genera un OTROSÍ formal siguiendo las normas colombianas
2. Referencia el documento original que se está modificando
3. Especifica claramente cada modificación
4. Mantiene vigentes todas las cláusulas no modificadas
5. Incluye:
   - Identificación de las partes
   - Referencia al documento original
   - Cláusulas de modificación numeradas
   - Ratificación de cláusulas no modificadas
   - Firmas y fecha
6. Lenguaje legal formal
7. Fecha actual

Genera SOLO el documento OTROSÍ, sin introducciones.`;

    return await this.xaiService.generateText(prompt);
  }

  /**
   * Save generated document to database and storage
   */
  public async saveDocument(
    caseId: string,
    documentType: 'promesa' | 'otrosi' | 'oferta' | 'escritura' | 'legal',
    title: string,
    content: string,
    createdBy: string
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // Save document content to case_documents table
      const { data, error } = await supabase
        .from('case_documents')
        .insert({
          case_id: caseId,
          document_type: documentType,
          title: title,
          description: `Generado automáticamente por IA`,
          document_url: '', // Will be updated after file upload
          status: 'draft',
          version: 1,
          modified_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Upload content as PDF to Supabase Storage
      // For now, we'll store the content in a temporary location
      // In production, you'd want to convert the text to PDF and upload it

      return { success: true, documentId: data.id };
    } catch (err) {
      console.error('Error saving document:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      };
    }
  }

  // Helper methods
  private translatePropertyType(type: string): string {
    const types: Record<string, string> = {
      'apartment': 'Apartamento',
      'house': 'Casa',
      'townhouse': 'Casa en Conjunto',
      'office': 'Oficina',
      'commercial': 'Local Comercial'
    };
    return types[type] || type;
  }

  private translatePaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      'cash': 'Contado',
      'financing': 'Financiación',
      'crypto': 'Criptomonedas',
      'mixed': 'Mixto'
    };
    return methods[method] || method;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}

// Export singleton instance
export const legalDocumentService = LegalDocumentGenerationService.getInstance();

