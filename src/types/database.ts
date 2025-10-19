// Estructura de datos para Sunday Properties
// Este archivo define los tipos y esquemas de datos para la aplicación

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  userType: 'visitor' | 'registered' | 'verified' | 'premium' | 'admin';
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: 'es' | 'en';
  };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Características físicas
  bedrooms: number;
  bathrooms: number;
  area: number; // m²
  parking: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  propertyType: 'apartment' | 'house' | 'townhouse' | 'office' | 'commercial';
  strata?: number;
  
  // Precio y condiciones
  price: number;
  monthlyCosts?: number;
  acceptsCrypto: boolean;
  financing: boolean;
  visitPrice: number;
  
  // Estado y verificación
  status: 'draft' | 'pending' | 'published' | 'sold' | 'rented' | 'archived';
  verified: boolean;
  premium: boolean;
  
  // Multimedia
  images: string[];
  virtualTour?: string;
  
  // Documentos legales
  freedomTradition?: string;
  legalDocuments?: string[];
  
  // Metadatos
  ownerId: string;
  agentId?: string;
  tags: string[];
  features: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  visitorId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  
  // Pago y documentos
  visitPrice: number;
  paid: boolean;
  paymentMethod?: 'cash' | 'card' | 'crypto';
  ndaAccepted: boolean;
  
  // Feedback
  feedback?: string;
  rating?: number;
  notes?: string;
  
  // Estado de documentos
  documentsUnlocked: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Offer {
  id: string;
  propertyId: string;
  buyerId: string;
  offerPrice: number;
  originalPrice: number;
  
  // Método de pago
  paymentMethod: 'cash' | 'financing' | 'crypto' | 'mixed';
  financingDetails?: {
    downPayment: number;
    monthlyPayment: number;
    termMonths: number;
    interestRate: number;
  };
  cryptoDetails?: {
    currency: string;
    amount: number;
    exchangeRate: number;
  };
  
  // Condiciones y fechas
  closingDate: string;
  conditions: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  
  // Contraoferta
  counterOffer?: {
    price: number;
    conditions: string[];
    message: string;
    createdAt: string;
  };
  
  // Métricas financieras
  metrics: {
    vpn: number;
    roi: number;
    irr: number;
    cashOnCash: number;
    riskScore: number;
  };
  
  // Timestamps
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  offerId: string;
  
  // Detalles del contrato
  contractType: 'sale' | 'rent';
  price: number;
  terms: string[];
  
  // Estado del contrato
  status: 'draft' | 'pending_signature' | 'signed' | 'completed' | 'cancelled';
  
  // Documentos
  contractDocument?: string;
  signatures: {
    buyer?: string;
    seller?: string;
    witness?: string;
    notary?: string;
  };
  
  // Timestamps
  createdAt: string;
  signedAt?: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'visit_scheduled' | 'offer_received' | 'offer_accepted' | 'contract_ready' | 'payment_received';
  title: string;
  message: string;
  read: boolean;
  
  // Datos relacionados
  relatedId?: string; // ID de propiedad, oferta, etc.
  relatedType?: 'property' | 'offer' | 'visit' | 'contract';
  
  // Timestamps
  createdAt: string;
  readAt?: string;
}

export interface FinancialAnalysis {
  id: string;
  propertyId: string;
  userId: string;
  
  // Parámetros de entrada
  purchasePrice: number;
  downPayment: number;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number;
  monthlyRent?: number;
  annualAppreciation: number;
  inflationRate: number;
  taxRate: number;
  maintenanceRate: number;
  vacancyRate: number;
  
  // Métricas calculadas
  vpn: number;
  roi: number;
  irr: number;
  cashOnCash: number;
  capRate: number;
  dscr: number;
  riskScore: number;
  breakEvenMonths: number;
  totalReturn: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Tipos para filtros y búsquedas
export interface PropertyFilters {
  priceRange: [number, number];
  bedrooms?: number;
  bathrooms?: number;
  areaRange: [number, number];
  propertyType?: string[];
  neighborhood?: string[];
  verified?: boolean;
  features?: string[];
}

export interface SearchParams {
  query?: string;
  filters?: PropertyFilters;
  sortBy?: 'price' | 'area' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Tipos para estadísticas y métricas
export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalVisits: number;
  pendingVisits: number;
  totalOffers: number;
  pendingOffers: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface UserStats {
  propertiesPublished: number;
  visitsReceived: number;
  offersReceived: number;
  contractsSigned: number;
  totalRevenue: number;
}

