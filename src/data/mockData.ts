// Datos de ejemplo para Sunday Properties
import { User, Property, Visit, Offer, Notification } from '../types/database';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'juan.perez@email.com',
    name: 'Juan Pérez',
    phone: '+57 300 123 4567',
    userType: 'verified',
    verifiedAt: '2024-01-01T00:00:00Z',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'es'
    }
  },
  {
    id: '2',
    email: 'maria.gonzalez@email.com',
    name: 'María González',
    phone: '+57 310 987 6543',
    userType: 'premium',
    verifiedAt: '2023-11-15T00:00:00Z',
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    preferences: {
      notifications: true,
      emailUpdates: false,
      language: 'es'
    }
  },
  {
    id: '3',
    email: 'carlos.mendoza@email.com',
    name: 'Carlos Mendoza',
    phone: '+57 315 456 7890',
    userType: 'registered',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    preferences: {
      notifications: false,
      emailUpdates: true,
      language: 'es'
    }
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno en El Poblado',
    description: 'Hermoso apartamento moderno ubicado en el corazón de El Poblado, con excelente conectividad y cerca a centros comerciales, restaurantes y zonas verdes. Ideal para familias jóvenes o profesionales.',
    address: 'Carrera 43A #15-25',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    coordinates: { lat: 6.2088, lng: -75.5654 },
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    parking: 1,
    floor: 8,
    totalFloors: 15,
    yearBuilt: 2020,
    propertyType: 'apartment',
    strata: 5,
    price: 450000000,
    monthlyCosts: 1200000,
    acceptsCrypto: true,
    financing: true,
    visitPrice: 49000,
    status: 'published',
    verified: true,
    premium: true,
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=5',
      'https://picsum.photos/800/600?random=6'
    ],
    virtualTour: 'https://example.com/tour/1',
    freedomTradition: 'https://example.com/docs/freedom-1.pdf',
    legalDocuments: ['https://example.com/docs/legal-1.pdf'],
    ownerId: '1',
    agentId: '2',
    tags: ['Nuevo', 'Vista panorámica', 'Gym', 'Piscina', 'Seguridad 24/7'],
    features: [
      'Cocina integral con electrodomésticos',
      'Balcón con vista panorámica',
      'Closets empotrados',
      'Piso en porcelanato',
      'Aire acondicionado',
      'Internet fibra óptica'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    publishedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '2',
    title: 'Casa Familiar en Laureles',
    description: 'Casa familiar espaciosa en Laureles, con jardín privado y excelente ubicación cerca a colegios y universidades. Perfecta para familias con niños.',
    address: 'Calle 70 #45-23',
    neighborhood: 'Laureles',
    city: 'Medellín',
    coordinates: { lat: 6.2442, lng: -75.5812 },
    bedrooms: 4,
    bathrooms: 3,
    area: 120,
    parking: 2,
    yearBuilt: 2018,
    propertyType: 'house',
    strata: 4,
    price: 380000000,
    monthlyCosts: 950000,
    acceptsCrypto: false,
    financing: true,
    visitPrice: 49000,
    status: 'published',
    verified: true,
    premium: false,
    images: [
      'https://picsum.photos/800/600?random=7',
      'https://picsum.photos/800/600?random=8',
      'https://picsum.photos/800/600?random=9',
      'https://picsum.photos/800/600?random=10'
    ],
    ownerId: '2',
    tags: ['Jardín', 'Zona verde', 'Seguro'],
    features: [
      'Jardín privado',
      'Terraza',
      'Cocina amplia',
      'Estudio',
      'Cuarto de servicio'
    ],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    publishedAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '3',
    title: 'Penthouse de Lujo en Envigado',
    description: 'Penthouse de lujo con vista panorámica de la ciudad, terraza privada y acabados de primera calidad. Ubicado en el corazón de Envigado.',
    address: 'Carrera 48 #25-67',
    neighborhood: 'Envigado',
    city: 'Medellín',
    coordinates: { lat: 6.1699, lng: -75.5856 },
    bedrooms: 5,
    bathrooms: 4,
    area: 200,
    parking: 3,
    floor: 20,
    totalFloors: 20,
    yearBuilt: 2022,
    propertyType: 'apartment',
    strata: 6,
    price: 850000000,
    monthlyCosts: 2100000,
    acceptsCrypto: true,
    financing: true,
    visitPrice: 49000,
    status: 'published',
    verified: true,
    premium: true,
    images: [
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=12',
      'https://picsum.photos/800/600?random=13',
      'https://picsum.photos/800/600?random=14',
      'https://picsum.photos/800/600?random=15'
    ],
    virtualTour: 'https://example.com/tour/3',
    ownerId: '1',
    agentId: '2',
    tags: ['Lujo', 'Terraza', 'Piscina', 'Vista panorámica'],
    features: [
      'Terraza privada',
      'Piscina en terraza',
      'Jacuzzi',
      'Cocina gourmet',
      'Sala de cine',
      'Gimnasio privado'
    ],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    publishedAt: '2024-01-11T00:00:00Z'
  }
];

export const mockVisits: Visit[] = [
  {
    id: '1',
    propertyId: '1',
    visitorId: '3',
    scheduledDate: '2024-01-15',
    scheduledTime: '14:00',
    status: 'confirmed',
    visitPrice: 49000,
    paid: true,
    paymentMethod: 'card',
    ndaAccepted: true,
    documentsUnlocked: false,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    propertyId: '2',
    visitorId: '3',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00',
    status: 'completed',
    visitPrice: 49000,
    paid: true,
    paymentMethod: 'card',
    ndaAccepted: true,
    feedback: 'Excelente propiedad, muy bien ubicada',
    rating: 5,
    notes: 'Interesada en hacer oferta',
    documentsUnlocked: true,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
    completedAt: '2024-01-16T00:00:00Z'
  },
  {
    id: '3',
    propertyId: '3',
    visitorId: '3',
    scheduledDate: '2024-01-17',
    scheduledTime: '16:00',
    status: 'pending',
    visitPrice: 49000,
    paid: false,
    ndaAccepted: false,
    documentsUnlocked: false,
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  }
];

export const mockOffers: Offer[] = [
  {
    id: '1',
    propertyId: '1',
    buyerId: '3',
    offerPrice: 420000000,
    originalPrice: 450000000,
    paymentMethod: 'financing',
    financingDetails: {
      downPayment: 126000000,
      monthlyPayment: 2500000,
      termMonths: 180,
      interestRate: 8.5
    },
    closingDate: '2024-03-15',
    conditions: [
      'Inspección técnica aprobada',
      'Avalúo bancario dentro del rango',
      'Financiación aprobada'
    ],
    status: 'pending',
    metrics: {
      vpn: 385000000,
      roi: 12.5,
      irr: 15.2,
      cashOnCash: 8.3,
      riskScore: 3.2
    },
    createdAt: '2024-01-10T00:00:00Z',
    expiresAt: '2024-01-17T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    propertyId: '2',
    buyerId: '3',
    offerPrice: 360000000,
    originalPrice: 380000000,
    paymentMethod: 'crypto',
    cryptoDetails: {
      currency: 'USDT',
      amount: 90000,
      exchangeRate: 4000
    },
    closingDate: '2024-02-28',
    conditions: [
      'Transferencia crypto verificada',
      'Documentación legal completa'
    ],
    status: 'countered',
    counterOffer: {
      price: 370000000,
      conditions: ['Aceptar precio contraoferta'],
      message: 'Estamos dispuestos a aumentar nuestra oferta si incluyen los muebles.',
      createdAt: '2024-01-12T00:00:00Z'
    },
    metrics: {
      vpn: 355000000,
      roi: 14.2,
      irr: 18.1,
      cashOnCash: 9.8,
      riskScore: 2.1
    },
    createdAt: '2024-01-08T00:00:00Z',
    expiresAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'visit_scheduled',
    title: 'Nueva visita programada',
    message: 'Carlos Mendoza ha programado una visita para el 15 de enero a las 2:00 PM',
    read: false,
    relatedId: '1',
    relatedType: 'visit',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'offer_received',
    title: 'Nueva oferta recibida',
    message: 'Has recibido una oferta de $420,000,000 para tu apartamento en El Poblado',
    read: false,
    relatedId: '1',
    relatedType: 'offer',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'offer_accepted',
    title: 'Oferta aceptada',
    message: 'Tu oferta de $360,000,000 ha sido aceptada para la casa en Laureles',
    read: true,
    relatedId: '2',
    relatedType: 'offer',
    createdAt: '2024-01-08T00:00:00Z',
    readAt: '2024-01-09T00:00:00Z'
  }
];

