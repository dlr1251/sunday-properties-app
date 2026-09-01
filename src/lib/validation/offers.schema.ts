import { z } from 'zod';

// Offer status enum
export const OfferStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'countered',
  'expired'
]);

// Payment method enum
export const PaymentMethodSchema = z.enum([
  'cash',
  'financing',
  'crypto',
  'mixed'
]);

export const TransactionTypeSchema = z.enum(['sale', 'rental']);

// Create offer schema
const saleOfferSchema = z.object({
  transactionType: z.literal('sale'),
  propertyId: z.string().uuid('ID de propiedad inválido'),
  offerPrice: z.number().positive('El precio de oferta debe ser mayor a 0'),
  originalPrice: z.number().positive('El precio original debe ser mayor a 0'),
  paymentMethod: PaymentMethodSchema,
  financingDetails: z.object({
    downPayment: z.number().min(0, 'El enganche no puede ser negativo'),
    loanAmount: z.number().min(0, 'El monto del préstamo no puede ser negativo'),
    interestRate: z.number().min(0, 'La tasa de interés no puede ser negativa'),
    loanTerm: z.number().min(1, 'El plazo del préstamo debe ser al menos 1 año'),
    bank: z.string().optional(),
  }).optional(),
  cryptoDetails: z.object({
    currency: z.string().min(1, 'La moneda cripto es requerida'),
    amount: z.number().positive('La cantidad debe ser mayor a 0'),
    walletAddress: z.string().min(1, 'La dirección de wallet es requerida'),
  }).optional(),
  closingDate: z.string().min(1, 'La fecha de cierre es requerida'),
  conditions: z.array(z.string()).default([]),
  message: z.string().optional(),
});

const rentalOfferSchema = z.object({
  transactionType: z.literal('rental'),
  propertyId: z.string().uuid('ID de propiedad inválido'),
  monthlyRent: z.number().positive('El canon mensual debe ser mayor a 0'),
  leaseStartDate: z.string().min(1, 'La fecha de inicio es requerida'),
  leaseTermMonths: z.number().min(1, 'El plazo del contrato debe ser al menos 1 mes'),
  deposit: z.number().min(0).optional(),
  adminFee: z.number().min(0).optional(),
  utilitiesIncluded: z.array(z.string()).default([]),
  petsPolicy: z.string().optional(),
  conditions: z.array(z.string()).default([]),
  message: z.string().optional(),
});

export const createOfferSchema = z.discriminatedUnion('transactionType', [saleOfferSchema, rentalOfferSchema]);

// Counter offer schema
const saleCounterOfferSchema = z.object({
  transactionType: z.literal('sale'),
  originalOfferId: z.string().uuid('ID de oferta original inválido'),
  counterPrice: z.number().positive('El precio de contraoferta debe ser mayor a 0'),
  paymentMethod: PaymentMethodSchema,
  financingDetails: z.object({
    downPayment: z.number().min(0, 'El enganche no puede ser negativo'),
    loanAmount: z.number().min(0, 'El monto del préstamo no puede ser negativo'),
    interestRate: z.number().min(0, 'La tasa de interés no puede ser negativa'),
    loanTerm: z.number().min(1, 'El plazo del préstamo debe ser al menos 1 año'),
    bank: z.string().optional(),
  }).optional(),
  cryptoDetails: z.object({
    currency: z.string().min(1, 'La moneda cripto es requerida'),
    amount: z.number().positive('La cantidad debe ser mayor a 0'),
    walletAddress: z.string().min(1, 'La dirección de wallet es requerida'),
  }).optional(),
  closingDate: z.string().min(1, 'La fecha de cierre es requerida'),
  conditions: z.array(z.string()).default([]),
  message: z.string().optional(),
  reason: z.string().optional(),
});

const rentalCounterOfferSchema = z.object({
  transactionType: z.literal('rental'),
  originalOfferId: z.string().uuid('ID de oferta original inválido'),
  monthlyRent: z.number().positive('El canon mensual debe ser mayor a 0'),
  leaseStartDate: z.string().min(1, 'La fecha de inicio es requerida'),
  leaseTermMonths: z.number().min(1, 'El plazo del contrato debe ser al menos 1 mes'),
  deposit: z.number().min(0).optional(),
  adminFee: z.number().min(0).optional(),
  utilitiesIncluded: z.array(z.string()).default([]),
  petsPolicy: z.string().optional(),
  conditions: z.array(z.string()).default([]),
  message: z.string().optional(),
  reason: z.string().optional(),
});

export const counterOfferSchema = z.discriminatedUnion('transactionType', [saleCounterOfferSchema, rentalCounterOfferSchema]);

// Update offer status schema
export const updateOfferStatusSchema = z.object({
  offerId: z.string().uuid('ID de oferta inválido'),
  status: OfferStatusSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// Offer filters schema
export const offerFiltersSchema = z.object({
  status: z.string().optional(),
  propertyId: z.string().uuid().optional(),
  buyerId: z.string().uuid().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Type exports
export type OfferStatus = z.infer<typeof OfferStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type CounterOfferInput = z.infer<typeof counterOfferSchema>;
export type UpdateOfferStatusInput = z.infer<typeof updateOfferStatusSchema>;
export type OfferFilters = z.infer<typeof offerFiltersSchema>;
