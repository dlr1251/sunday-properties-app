import { supabase } from '../supabase';
import { Result, ok, err, tryCatch } from '../lib/utils/result';
import { AppError, createDatabaseError, createNotFoundError, createValidationError } from '../lib/utils/errors';
import { logError } from '../lib/utils/logger';
import { OfferCondition } from '../types/database';

export type ConditionType =
  | 'price'
  | 'payment_method'
  | 'closing_date'
  | 'delivery_date'
  | 'deed_signing_date'
  | 'notary_costs_distribution'
  | 'promesa_compraventa_terms'
  | 'inspection_contingency'
  | 'financing_contingency'
  | 'appraisal_contingency'
  | 'title_contingency'
  | 'repairs_required'
  | 'appliances_included'
  | 'custom';

export type ConditionStatus = 'proposed' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
export type ConditionProposer = 'buyer' | 'seller' | 'agent' | 'lawyer';

export interface CreateConditionInput {
  offerId: string;
  conditionType: ConditionType;
  conditionKey: string;
  conditionValue: any;
  conditionDisplayText: string;
  proposedBy: ConditionProposer;
  proposerUserId: string;
  npvImpact?: number;
  riskImpact?: number;
  priority?: number;
  notes?: string;
  parentConditionId?: string;
}

export interface UpdateConditionStatusInput {
  conditionId: string;
  status: ConditionStatus;
  counterValue?: any;
  notes?: string;
}

export interface ConditionTemplate {
  type: ConditionType;
  key: string;
  label: string;
  description: string;
  defaultValue: any;
  defaultRiskImpact: number;
  defaultPriority: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export class OfferConditionsService {
  private static instance: OfferConditionsService;

  private constructor() {}

  public static getInstance(): OfferConditionsService {
    if (!OfferConditionsService.instance) {
      OfferConditionsService.instance = new OfferConditionsService();
    }
    return OfferConditionsService.instance;
  }

  /**
   * Create a new condition
   */
  async createCondition(input: CreateConditionInput): Promise<Result<OfferCondition, AppError>> {
    return tryCatch(async () => {
      // 1. Validate interdependencies
      const validation = await this.validateConditionInterdependencies(input.offerId, input);
      if (!validation.valid) {
        throw createValidationError(
          `Invalid condition: ${validation.errors.join(', ')}`,
          'condition_validation',
          validation
        );
      }

      // 2. Get current version for this condition key
      const versionResult = await this.getCurrentVersion(input.offerId, input.conditionKey);
      const nextVersion = versionResult.ok ? versionResult.data + 1 : 1;

      // 3. Insert condition
      const { data, error } = await supabase
        .from('offer_conditions')
        .insert({
          offer_id: input.offerId,
          condition_type: input.conditionType,
          condition_key: input.conditionKey,
          condition_value: input.conditionValue,
          condition_display_text: input.conditionDisplayText,
          status: 'proposed' as ConditionStatus,
          proposed_by: input.proposedBy,
          proposer_user_id: input.proposerUserId,
          npv_impact: input.npvImpact,
          risk_impact: input.riskImpact,
          priority: input.priority || 50,
          parent_condition_id: input.parentConditionId,
          version: nextVersion,
          notes: input.notes
        })
        .select()
        .single();

      if (error) {
        logError('Failed to create condition', { input, error });
        throw createDatabaseError('Error al crear la condición', error);
      }

      // 4. Trigger NPV recalculation if enabled
      await this.triggerNPVRecalculation(input.offerId);

      // 5. Create notification for other party
      await this.notifyConditionCreated(data);

      return data;
    });
  }

  /**
   * Get all conditions for an offer
   */
  async getConditionsByOffer(offerId: string): Promise<Result<OfferCondition[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offer_conditions')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch conditions', { offerId, error });
        throw createDatabaseError('Error al cargar las condiciones', error);
      }

      return data || [];
    });
  }

  /**
   * Get condition by ID
   */
  async getConditionById(conditionId: string): Promise<Result<OfferCondition, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offer_conditions')
        .select('*')
        .eq('id', conditionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Condition', conditionId);
        }
        logError('Failed to fetch condition', { conditionId, error });
        throw createDatabaseError('Error al cargar la condición', error);
      }

      return data;
    });
  }

  /**
   * Update condition status
   */
  async updateConditionStatus(
    input: UpdateConditionStatusInput
  ): Promise<Result<OfferCondition, AppError>> {
    return tryCatch(async () => {
      // Get existing condition
      const conditionResult = await this.getConditionById(input.conditionId);
      if (!conditionResult.ok) {
        return conditionResult;
      }

      const existingCondition = conditionResult.data;

      // Build update data
      const updateData: any = {
        status: input.status,
        notes: input.notes || existingCondition.notes
      };

      // Handle counter case - create new condition
      if (input.status === 'countered' && input.counterValue) {
        const counterResult = await this.createCondition({
          offerId: existingCondition.offer_id,
          conditionType: existingCondition.condition_type,
          conditionKey: existingCondition.condition_key,
          conditionValue: input.counterValue,
          conditionDisplayText: input.counterValue.description || existingCondition.condition_display_text,
          proposedBy: this.getCounterProposer(existingCondition.proposed_by),
          proposerUserId: existingCondition.proposer_user_id!, // This should be updated by caller
          npvImpact: input.counterValue.npvImpact,
          riskImpact: input.counterValue.riskImpact,
          priority: existingCondition.priority,
          parentConditionId: existingCondition.id
        });

        if (!counterResult.ok) {
          return counterResult;
        }

        // Update original condition
        const { data, error } = await supabase
          .from('offer_conditions')
          .update({ status: 'countered' })
          .eq('id', input.conditionId)
          .select()
          .single();

        if (error) {
          logError('Failed to update condition status', { input, error });
          throw createDatabaseError('Error al actualizar el estado de la condición', error);
        }

        // Trigger NPV recalculation
        await this.triggerNPVRecalculation(existingCondition.offer_id);

        // Notify about counter
        await this.notifyConditionCountered(existingCondition, counterResult.data);

        return data;
      }

      // For accept/reject/withdraw, just update status
      const { data, error } = await supabase
        .from('offer_conditions')
        .update(updateData)
        .eq('id', input.conditionId)
        .select()
        .single();

      if (error) {
        logError('Failed to update condition status', { input, error });
        throw createDatabaseError('Error al actualizar el estado de la condición', error);
      }

      // Trigger NPV recalculation
      await this.triggerNPVRecalculation(existingCondition.offer_id);

      // Notify about status change
      await this.notifyConditionStatusChanged(data);

      return data;
    });
  }

  /**
   * Validate condition interdependencies
   */
  async validateConditionInterdependencies(
    offerId: string,
    newCondition: CreateConditionInput
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get existing conditions
      const conditionsResult = await this.getConditionsByOffer(offerId);
      const existingConditions = conditionsResult.ok ? conditionsResult.data : [];

      // Rule 1: deed_signing_date must be before or equal to delivery_date
      if (newCondition.conditionKey === 'deed_signing_date') {
        const deliveryCondition = existingConditions.find(c => c.condition_key === 'delivery_date');
        if (deliveryCondition && deliveryCondition.status === 'accepted') {
          const deedDate = new Date(newCondition.conditionValue.date);
          const deliveryDate = new Date(deliveryCondition.condition_value.date);
          if (deedDate > deliveryDate) {
            errors.push('La fecha de firma de escritura no puede ser posterior a la fecha de entrega');
          }
        }
      }

      // Rule 2: delivery_date must be after or equal to closing_date
      if (newCondition.conditionKey === 'delivery_date') {
        // Get offer to check closing date
        const { data: offer } = await supabase
          .from('offers')
          .select('closing_date')
          .eq('id', offerId)
          .single();

        if (offer) {
          const deliveryDate = new Date(newCondition.conditionValue.date);
          const closingDate = new Date(offer.closing_date);
          if (deliveryDate < closingDate) {
            errors.push('La fecha de entrega no puede ser anterior a la fecha de cierre');
          }
        }
      }

      // Rule 3: No duplicate condition keys (unless countering)
      if (!newCondition.parentConditionId) {
        const duplicate = existingConditions.find(
          c => c.condition_key === newCondition.conditionKey && c.status !== 'rejected'
        );
        if (duplicate) {
          errors.push(`La condición ${newCondition.conditionKey} ya existe para esta oferta`);
        }
      }

      // Warning: Check if payment method conflicts
      if (newCondition.conditionType === 'payment_method') {
        warnings.push('Cambiar el método de pago afectará el cálculo del VPN');
      }

      // Warning: Check if dates are very far in the future
      if (['closing_date', 'delivery_date', 'deed_signing_date'].includes(newCondition.conditionType)) {
        const dateValue = new Date(newCondition.conditionValue.date);
        const daysDiff = (dateValue.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          warnings.push('Las fechas muy lejanas aumentan el riesgo y afectan el VPN');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logError('Error validating interdependencies', { offerId, newCondition, error });
      return {
        valid: false,
        errors: ['Error al validar las interdependencias de las condiciones']
      };
    }
  }

  /**
   * Get condition templates for a property type
   */
  async getConditionTemplates(propertyType?: string): Promise<ConditionTemplate[]> {
    const templates: ConditionTemplate[] = [
      {
        type: 'inspection_contingency',
        key: 'inspection_contingency',
        label: 'Inspección Técnica',
        description: 'Inspección técnica del inmueble con derecho a cancelar si hay problemas estructurales',
        defaultValue: { description: '', required: true, days: 15 },
        defaultRiskImpact: 15,
        defaultPriority: 80
      },
      {
        type: 'financing_contingency',
        key: 'financing_contingency',
        label: 'Aprobación de Financiación',
        description: 'Contingente a aprobación de crédito hipotecario',
        defaultValue: { description: '', required: true, days: 30 },
        defaultRiskImpact: 25,
        defaultPriority: 70
      },
      {
        type: 'appraisal_contingency',
        key: 'appraisal_contingency',
        label: 'Avalúo',
        description: 'Contingente a que el avalúo alcance el precio acordado',
        defaultValue: { description: '', required: true, days: 21 },
        defaultRiskImpact: 20,
        defaultPriority: 65
      },
      {
        type: 'title_contingency',
        key: 'title_contingency',
        label: 'Estudio de Títulos',
        description: 'Contingente a que el estudio de títulos sea satisfactorio',
        defaultValue: { description: '', required: true, days: 30 },
        defaultRiskImpact: 10,
        defaultPriority: 90
      },
      {
        type: 'repairs_required',
        key: 'repairs_required',
        label: 'Reparaciones Requeridas',
        description: 'Reparaciones que el vendedor debe realizar antes del cierre',
        defaultValue: { description: '', estimated_cost: 0 },
        defaultRiskImpact: 10,
        defaultPriority: 50
      },
      {
        type: 'appliances_included',
        key: 'appliances_included',
        label: 'Electrodomésticos Incluidos',
        description: 'Electrodomésticos o equipamiento que se incluyen en la venta',
        defaultValue: { description: '', items: [] },
        defaultRiskImpact: 0,
        defaultPriority: 30
      },
      {
        type: 'notary_costs_distribution',
        key: 'notary_costs_distribution',
        label: 'Distribución de Gastos Notariales',
        description: 'Distribución de gastos notariales y de registro entre comprador y vendedor',
        defaultValue: { buyer_percentage: 50, seller_percentage: 50 },
        defaultRiskImpact: 5,
        defaultPriority: 60
      },
      {
        type: 'promesa_compraventa_terms',
        key: 'promesa_compraventa_terms',
        label: 'Términos de Promesa de Compraventa',
        description: 'Términos específicos para la promesa de compraventa',
        defaultValue: { description: '' },
        defaultRiskImpact: 15,
        defaultPriority: 85
      }
    ];

    return templates;
  }

  /**
   * Get condition history
   */
  async getConditionHistory(
    conditionKey: string,
    offerId: string
  ): Promise<Result<OfferCondition[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offer_conditions')
        .select('*')
        .eq('offer_id', offerId)
        .eq('condition_key', conditionKey)
        .order('version', { ascending: false });

      if (error) {
        logError('Failed to fetch condition history', { conditionKey, offerId, error });
        throw createDatabaseError('Error al cargar el historial de la condición', error);
      }

      return data || [];
    });
  }

  /**
   * Delete a condition (soft delete by marking as withdrawn)
   */
  async deleteCondition(conditionId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('offer_conditions')
        .update({ status: 'withdrawn' })
        .eq('id', conditionId);

      if (error) {
        logError('Failed to delete condition', { conditionId, error });
        throw createDatabaseError('Error al eliminar la condición', error);
      }
    });
  }

  /**
   * Helper: Get current version for a condition key
   */
  private async getCurrentVersion(offerId: string, conditionKey: string): Promise<Result<number, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase.rpc('get_current_condition_version', {
        p_offer_id: offerId,
        p_condition_key: conditionKey
      });

      if (error) {
        logError('Failed to get condition version', { offerId, conditionKey, error });
        throw createDatabaseError('Error al obtener la versión de la condición', error);
      }

      return data || 0;
    });
  }

  /**
   * Helper: Get counter proposer (opposite of current proposer)
   */
  private getCounterProposer(proposedBy: ConditionProposer): ConditionProposer {
    const counterMap: Record<ConditionProposer, ConditionProposer> = {
      buyer: 'seller',
      seller: 'buyer',
      agent: 'agent',
      lawyer: 'lawyer'
    };
    return counterMap[proposedBy] || 'buyer';
  }

  /**
   * Helper: Trigger NPV recalculation
   */
  private async triggerNPVRecalculation(offerId: string): Promise<void> {
    try {
      // Update offer to trigger NPV calculation trigger
      await supabase
        .from('offers')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', offerId);
    } catch (error) {
      logError('Failed to trigger NPV recalculation', { offerId, error });
    }
  }

  /**
   * Helper: Create notification for new condition
   */
  private async notifyConditionCreated(condition: OfferCondition): Promise<void> {
    try {
      // Get offer to find other participants
      const { data: offer } = await supabase
        .from('offers')
        .select('buyer_id, property_id')
        .eq('id', condition.offer_id)
        .single();

      if (!offer) return;

      // Get property owner
      const { data: property } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', offer.property_id)
        .single();

      if (!property) return;

      // Determine who to notify
      const notifiableUserId = 
        condition.proposed_by === 'buyer' 
          ? property.owner_id 
          : offer.buyer_id;

      // Check if notifications table exists
      const { error: tableCheck } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (tableCheck) return; // Notifications table doesn't exist

      // Create notification
      await supabase.from('notifications').insert({
        user_id: notifiableUserId,
        type: 'offer_condition_proposed',
        title: 'Nueva Condición Propuesta',
        message: `Se ha propuesto una nueva condición: ${condition.condition_display_text}`,
        related_id: condition.offer_id,
        related_type: 'offer',
        data: { condition_id: condition.id }
      });
    } catch (error) {
      logError('Failed to create notification', { condition, error });
    }
  }

  /**
   * Helper: Notify about condition counter
   */
  private async notifyConditionCountered(
    originalCondition: OfferCondition,
    counterCondition: OfferCondition
  ): Promise<void> {
    // Similar to notifyConditionCreated but for counters
    // Implementation details...
  }

  /**
   * Helper: Notify about condition status change
   */
  private async notifyConditionStatusChanged(condition: OfferCondition): Promise<void> {
    // Similar notification logic
    // Implementation details...
  }
}

// Export singleton instance
export const offerConditionsService = OfferConditionsService.getInstance();

