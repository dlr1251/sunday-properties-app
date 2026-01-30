import { legalDocumentService } from './legalDocumentGeneration';

export type NegotiationContext = {
  property: {
    address: string;
    city: string;
    area: number;
    price: number;
    property_type: string;
  };
  buyer: { full_name: string; email: string; phone?: string; id_number?: string };
  seller: { full_name: string; email: string; phone?: string; id_number?: string };
  offer: { offer_price: number; payment_method: string; closing_date: string; down_payment?: number; conditions?: string[] };
  lawyer?: { full_name: string; email: string };
};

export async function generatePromesaCompraventaDraft(ctx: NegotiationContext): Promise<string> {
  console.log('🤖 [grokDraft] Starting promesa compraventa draft generation');
  console.log('📋 [grokDraft] Context received:', ctx);

  try {
    const result = await legalDocumentService.generatePromesaCompraventa({
      id: 'neg-draft',
      property: ctx.property as any,
      buyer: ctx.buyer as any,
      seller: ctx.seller as any,
      lawyer: (ctx.lawyer || { full_name: 'Abogado', email: 'lawyer@example.com' }) as any,
      offer: ctx.offer as any
    });

    console.log('✅ [grokDraft] Promesa compraventa generated successfully, length:', result.length);
    console.log('📄 [grokDraft] First 200 characters:', result.substring(0, 200));

    return result;
  } catch (error) {
    console.error('💥 [grokDraft] Failed to generate promesa compraventa:', error);
    throw error;
  }
}


