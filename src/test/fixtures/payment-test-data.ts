/**
 * Datos de prueba para sistema de pagos colombianos
 * Basado en documentos reales del proyecto Sunday Proto
 * TODOS LOS DATOS SON DE PRUEBA Y NO REPRESENTAN INFORMACIÓN REAL
 */

import { ColombianPaymentStructure, PaymentSchedule, BankingDetails, FinancingDetails } from '@/types/payments';

// Datos de prueba de usuarios (basados en estructura real pero datos ficticios)
export const TEST_USERS = {
  buyer: {
    id: 'user_buyer_test_001',
    email: 'comprador.test@sunday.local',
    name: 'Carlos Rodríguez',
    phone: '+57 300 123 4567',
    role: 'verified' as const,
    verification_status: 'verified' as const,
    documents: {
      cedula: 'CC-12345678',
      rut: 'RUT-87654321',
      bank_account: '123-456789-0',
      bank_name: 'Bancolombia'
    }
  },
  seller: {
    id: 'user_seller_test_001',
    email: 'vendedor.test@sunday.local',
    name: 'María González',
    phone: '+57 301 987 6543',
    role: 'verified' as const,
    verification_status: 'verified' as const,
    documents: {
      cedula: 'CC-87654321',
      rut: 'RUT-12345678',
      bank_account: '987-654321-0',
      bank_name: 'Davivienda'
    }
  },
  lawyer: {
    id: 'user_lawyer_test_001',
    email: 'abogado.test@sunday.local',
    name: 'Dr. Juan Martínez',
    phone: '+57 302 555 1234',
    role: 'lawyer' as const,
    verification_status: 'verified' as const,
    specialization: 'Derecho Inmobiliario',
    license_number: 'ABC-123-XYZ'
  }
};

// Datos de prueba de propiedades (basados en estructura real pero datos ficticios)
export const TEST_PROPERTIES = {
  apartment_zocalo: {
    id: 'prop_zocalo_04_test',
    title: 'Apartamento Ejecutivo Zócalo 04',
    address: 'Carrera 7 #23-45, Zócalo, Medellín',
    city: 'Medellín',
    price: 650000000, // $650M COP
    property_type: 'apartment',
    area: 85,
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 1,
    year_built: 2018,
    owner_id: TEST_USERS.seller.id,
    agent_id: 'agent_test_001',
    status: 'published' as const,
    verified: true,
    coordinates: { lat: 6.2442, lng: -75.5812 },

    // Documentos legales de prueba
    legal_documents: {
      escritura_publica: {
        number: 'ESCR-12345-2023',
        date: '2023-02-15',
        notary: 'Notaría 12 de Medellín',
        notary_name: 'Dr. Pedro López',
        registration_number: 'REG-67890-2023'
      },
      certificado_tradicion_libertad: {
        date: '2024-10-01',
        registration_number: 'CTL-45678-2024',
        status: 'Libre de gravámenes',
        last_updated: '2024-10-01'
      },
      impuesto_predial: {
        year: 2024,
        amount: 2400000,
        paid_until: '2024-12-31',
        status: 'al_dia'
      },
      paz_y_salvo_administracion: {
        date: '2024-01-31',
        administration: 'Conjunto Residencial Zócalo',
        amount: 120000,
        status: 'al_dia'
      },
      certificado_vendedor: {
        document_type: 'cedula_ciudadania',
        number: TEST_USERS.seller.documents.cedula,
        expedition_date: '2010-05-20',
        expedition_place: 'Medellín, Colombia'
      }
    },

    // Historial de verificaciones
    verifications: [
      {
        id: 'ver_001',
        status: 'approved',
        submitted_at: '2024-01-15',
        reviewed_at: '2024-01-20',
        reviewed_by: TEST_USERS.lawyer.id,
        documents_verified: [
          'escritura_publica',
          'certificado_tradicion_libertad',
          'impuesto_predial'
        ]
      }
    ]
  },

  townhouse_poblado: {
    id: 'prop_poblado_mi_001_test',
    title: 'Casa en Condominio El Poblado',
    address: 'Carrera 35 #8-20, El Poblado, Medellín',
    city: 'Medellín',
    price: 950000000, // $950M COP
    property_type: 'townhouse',
    area: 120,
    bedrooms: 4,
    bathrooms: 3,
    parking_spaces: 2,
    year_built: 2020,
    owner_id: TEST_USERS.seller.id,
    status: 'published' as const,
    verified: true,
    coordinates: { lat: 6.2095, lng: -75.5678 }
  }
};

// Configuraciones de pago de prueba basadas en documentos reales
export const TEST_PAYMENT_CONFIGURATIONS: Record<string, ColombianPaymentStructure> = {
  // Basado en PROMESA_DE_COMPRAVENTA_ANGELA_LAMBARRI
  promesa_angela_lamabri: {
    method: 'transferencia_bancaria',
    totalAmount: 650000000,
    currency: 'COP',
    paymentSchedule: [
      {
        id: 'payment_001',
        date: '2024-11-15', // Fecha promesa
        amount: 65000000, // 10% = $65M
        description: 'Pago inicial (arras) en promesa de compraventa',
        paymentMethod: 'transferencia_bancaria',
        recipient: 'Cuenta Bancolombia a nombre de María González',
        verificationRequired: true,
        verificationStatus: 'pending',
        contingencies: [
          {
            type: 'credito_aprobado',
            description: 'Aprobación de crédito hipotecario',
            required: false,
            deadline: '2024-12-15'
          }
        ]
      },
      {
        id: 'payment_002',
        date: '2024-12-20', // Segundo pago
        amount: 195000000, // 30% = $195M
        description: 'Segundo pago tras aprobación de crédito',
        paymentMethod: 'transferencia_bancaria',
        recipient: 'Cuenta Bancolombia a nombre de María González',
        verificationRequired: true,
        contingencies: [
          {
            type: 'credito_aprobado',
            description: 'Aprobación de crédito hipotecario',
            required: true,
            deadline: '2024-12-15'
          }
        ]
      },
      {
        id: 'payment_003',
        date: '2025-01-30', // Fecha escritura
        amount: 390000000, // 60% = $390M restante
        description: 'Pago final en escritura pública',
        paymentMethod: 'transferencia_bancaria',
        recipient: 'Cuenta notaría o fiduciaria',
        verificationRequired: true,
        contingencies: [
          {
            type: 'titulo_limpio',
            description: 'Certificado de libertad actualizado',
            required: true,
            deadline: '2025-01-25'
          }
        ]
      }
    ],
    bankingDetails: {
      bankName: 'Bancolombia',
      accountType: 'ahorros',
      accountNumber: '987-654321-0',
      accountHolder: TEST_USERS.seller.name,
      accountHolderId: TEST_USERS.seller.documents.cedula,
      branchOffice: 'Centro, Medellín',
      verificationRequired: true
    },
    earnestMoney: {
      amount: 65000000, // 10%
      percentage: 10,
      dueDate: '2024-11-15',
      refundable: true,
      refundConditions: [
        'Si el comprador no obtiene crédito aprobado',
        'Si se detectan vicios ocultos en la propiedad'
      ]
    },
    contingencies: [
      {
        type: 'credito_aprobado',
        description: 'Aprobación de crédito hipotecario mínimo 70% del valor',
        required: true,
        deadline: '2024-12-15',
        verificationMethod: 'Presentar carta de aprobación bancaria'
      },
      {
        type: 'titulo_limpio',
        description: 'Certificado de tradición y libertad actualizado',
        required: true,
        deadline: '2025-01-25',
        verificationMethod: 'Registro público de la propiedad'
      },
      {
        type: 'inspeccion_aprobada',
        description: 'Inspección técnica satisfactoria',
        required: false,
        deadline: '2024-11-30',
        verificationMethod: 'Informe de ingeniero certificado'
      }
    ],
    riskLevel: 'low',
    requiresDianReporting: true, // > $200M COP
    internationalTransfer: false,
    requiresNotary: true,
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    version: 1
  },

  // Configuración mixta con financiamiento
  financiamiento_mixto: {
    method: 'financiacion_bancaria',
    totalAmount: 950000000,
    currency: 'COP',
    paymentSchedule: [
      {
        id: 'payment_001',
        date: '2024-11-20',
        amount: 95000000, // 10% = $95M
        description: 'Pago inicial con recursos propios',
        paymentMethod: 'transferencia_bancaria',
        recipient: 'Cuenta vendedor',
        verificationRequired: true
      },
      {
        id: 'payment_002',
        date: '2024-12-15',
        amount: 285000000, // 30% = $285M
        description: 'Pago con crédito hipotecario aprobado',
        paymentMethod: 'financiacion_bancaria',
        recipient: 'Fiduciaria o notaría',
        verificationRequired: true
      },
      {
        id: 'payment_003',
        date: '2025-01-30',
        amount: 570000000, // 60% = $570M
        description: 'Pago final en escritura',
        paymentMethod: 'financiacion_bancaria',
        recipient: 'Fiduciaria o notaría',
        verificationRequired: true
      }
    ],
    financingDetails: {
      entity: 'banco',
      entityName: 'Banco de Bogotá',
      approvedAmount: 855000000, // 90% del valor
      approvedRate: 12.5, // 12.5% anual
      termMonths: 240, // 20 años
      monthlyPayment: 8500000, // ~$8.5M mensuales
      downPayment: 95000000, // 10%
      approvalDocument: 'aprobacion_credito_bogota_2024.pdf',
      appraisalRequired: true,
      appraisalValue: 950000000
    },
    contingencies: [
      {
        type: 'credito_aprobado',
        description: 'Aprobación de crédito hipotecario',
        required: true,
        deadline: '2024-12-10',
        verificationMethod: 'Carta de aprobación bancaria'
      },
      {
        type: 'appraisal_contingency',
        description: 'Avalúo bancario mínimo 90% del precio',
        required: true,
        deadline: '2024-12-05',
        verificationMethod: 'Informe de avalúo bancario'
      }
    ],
    riskLevel: 'medium',
    requiresDianReporting: true,
    internationalTransfer: false,
    requiresNotary: true,
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    version: 1
  },

  // Configuración con criptomonedas (alto riesgo)
  cripto_riesgo_alto: {
    method: 'criptomonedas',
    totalAmount: 650000000,
    currency: 'COP',
    paymentSchedule: [
      {
        id: 'payment_001',
        date: '2024-11-15',
        amount: 65000000, // 10%
        description: 'Pago inicial en USDT',
        paymentMethod: 'criptomonedas',
        recipient: 'Wallet USDT: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        verificationRequired: true
      },
      {
        id: 'payment_002',
        date: '2024-12-15',
        amount: 195000000, // 30%
        description: 'Segundo pago en USDT',
        paymentMethod: 'criptomonedas',
        recipient: 'Wallet USDT: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        verificationRequired: true
      },
      {
        id: 'payment_003',
        date: '2025-01-30',
        amount: 390000000, // 60%
        description: 'Pago final en USDT',
        paymentMethod: 'criptomonedas',
        recipient: 'Wallet USDT: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        verificationRequired: true
      }
    ],
    cryptoDetails: {
      currency: 'usdt',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      network: 'polygon',
      exchange: 'Binance',
      verificationRequired: true,
      exchangeRatePeg: 'usd'
    },
    contingencies: [
      {
        type: 'credito_aprobado',
        description: 'Aprobación de crédito hipotecario',
        required: false,
        deadline: '2024-12-15'
      }
    ],
    riskLevel: 'high',
    requiresDianReporting: true,
    internationalTransfer: true, // Cripto es considerado internacional
    requiresNotary: true,
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    version: 1
  },

  // Configuración simple en efectivo (limitado por ley)
  efectivo_limitado: {
    method: 'efectivo',
    totalAmount: 150000000, // $150M (dentro del límite)
    currency: 'COP',
    paymentSchedule: [
      {
        id: 'payment_001',
        date: '2024-11-15',
        amount: 15000000, // 10%
        description: 'Pago inicial en efectivo',
        paymentMethod: 'efectivo',
        recipient: 'En notaría o entrega directa',
        verificationRequired: true
      },
      {
        id: 'payment_002',
        date: '2024-12-15',
        amount: 45000000, // 30%
        description: 'Segundo pago en efectivo',
        paymentMethod: 'efectivo',
        recipient: 'En notaría o entrega directa',
        verificationRequired: true
      },
      {
        id: 'payment_003',
        date: '2025-01-30',
        amount: 90000000, // 60%
        description: 'Pago final en efectivo',
        paymentMethod: 'efectivo',
        recipient: 'En escritura pública',
        verificationRequired: true
      }
    ],
    contingencies: [],
    riskLevel: 'high',
    requiresDianReporting: false, // < $200M
    internationalTransfer: false,
    requiresNotary: true,
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    version: 1
  }
};

// Documentos legales de prueba
export const TEST_LEGAL_DOCUMENTS = {
  promesa_compraventa: {
    id: 'doc_promesa_001',
    type: 'promesa_compraventa',
    title: 'PROMESA_DE_COMPRAVENTA_ANGELA_LAMBARRI',
    property_id: TEST_PROPERTIES.apartment_zocalo.id,
    buyer_id: TEST_USERS.buyer.id,
    seller_id: TEST_USERS.seller.id,
    lawyer_id: TEST_USERS.lawyer.id,
    content: {
      parties: {
        buyer: TEST_USERS.buyer,
        seller: TEST_USERS.seller,
        lawyer: TEST_USERS.lawyer
      },
      property: TEST_PROPERTIES.apartment_zocalo,
      payment_terms: TEST_PAYMENT_CONFIGURATIONS.promesa_angela_lamabri,
      conditions: [
        'El comprador obtendrá crédito hipotecario por mínimo el 70% del valor',
        'La propiedad se entregará libre de gravámenes',
        'Gastos notariales a cargo del comprador',
        'Impuestos prediales al día'
      ],
      deadlines: {
        credit_approval: '2024-12-15',
        property_delivery: '2025-01-30',
        contract_signing: '2024-11-15'
      }
    },
    status: 'signed',
    signed_at: '2024-11-15T14:30:00Z',
    created_at: '2024-11-01T10:00:00Z'
  },

  escritura_publica: {
    id: 'doc_escritura_001',
    type: 'escritura_publica',
    title: 'ESCRITURA_PUBLICA_ZOCALO_04',
    property_id: TEST_PROPERTIES.apartment_zocalo.id,
    notary: 'Notaría 12 de Medellín',
    notary_name: 'Dr. Pedro López',
    registration_number: 'ESCR-12345-2025',
    content: {
      transfer_details: {
        from: TEST_USERS.seller,
        to: TEST_USERS.buyer,
        property: TEST_PROPERTIES.apartment_zocalo,
        price: 650000000,
        payment_method: 'transferencia_bancaria'
      }
    },
    status: 'finalized',
    finalized_at: '2025-01-30T11:00:00Z',
    created_at: '2025-01-30T10:00:00Z'
  }
};

// Función para obtener configuración de pago por propiedad
export function getTestPaymentForProperty(propertyId: string): ColombianPaymentStructure | null {
  if (propertyId === TEST_PROPERTIES.apartment_zocalo.id) {
    return TEST_PAYMENT_CONFIGURATIONS.promesa_angela_lamabri;
  }
  if (propertyId === TEST_PROPERTIES.townhouse_poblado.id) {
    return TEST_PAYMENT_CONFIGURATIONS.financiamiento_mixto;
  }
  return null;
}

// Función para obtener datos completos de una propiedad de prueba
export function getCompleteTestProperty(propertyId: string) {
  const property = Object.values(TEST_PROPERTIES).find(p => p.id === propertyId);
  if (!property) return null;

  return {
    ...property,
    owner: TEST_USERS.seller,
    agent: TEST_USERS.buyer, // Simulando agente
    payment_config: getTestPaymentForProperty(propertyId),
    legal_documents: TEST_LEGAL_DOCUMENTS
  };
}

// Función para obtener escenario de negociación completo
export function getTestNegotiationScenario(scenario: 'standard' | 'financing' | 'crypto' | 'cash') {
  const scenarios = {
    standard: {
      property: TEST_PROPERTIES.apartment_zocalo,
      payment: TEST_PAYMENT_CONFIGURATIONS.promesa_angela_lamabri,
      users: TEST_USERS,
      documents: TEST_LEGAL_DOCUMENTS
    },
    financing: {
      property: TEST_PROPERTIES.townhouse_poblado,
      payment: TEST_PAYMENT_CONFIGURATIONS.financiamiento_mixto,
      users: TEST_USERS,
      documents: TEST_LEGAL_DOCUMENTS
    },
    crypto: {
      property: TEST_PROPERTIES.apartment_zocalo,
      payment: TEST_PAYMENT_CONFIGURATIONS.cripto_riesgo_alto,
      users: TEST_USERS,
      documents: TEST_LEGAL_DOCUMENTS
    },
    cash: {
      property: TEST_PROPERTIES.apartment_zocalo,
      payment: {
        ...TEST_PAYMENT_CONFIGURATIONS.efectivo_limitado,
        totalAmount: 150000000 // Reducido para límites legales
      },
      users: TEST_USERS,
      documents: TEST_LEGAL_DOCUMENTS
    }
  };

  return scenarios[scenario];
}

export default {
  TEST_USERS,
  TEST_PROPERTIES,
  TEST_PAYMENT_CONFIGURATIONS,
  TEST_LEGAL_DOCUMENTS,
  getTestPaymentForProperty,
  getCompleteTestProperty,
  getTestNegotiationScenario
};
