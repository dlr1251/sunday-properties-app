import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const es = {
  sunnyChat: {
    viewListing: 'Ver listado',
    scheduleVisit: 'Agendar visita',
    photoOf: 'Foto {{current}} de {{total}}: {{title}}',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Foto siguiente',
    noPhoto: 'Sin fotos publicadas',
    statsHeading: 'Cifras del listado',
    compareHeading: 'Comparar listados',
    chartHeading: 'Precio por m²',
    pricePerM2: 'Precio / m²',
    adminFee: 'Administración',
    strata: 'Estrato',
    area: 'Área',
    bedrooms: 'Habitaciones',
    bathrooms: 'Baños',
    zone: 'Zona',
    price: 'Precio',
    listing: 'Listado',
    best: 'Mejor valor',
    loadingUi: 'Preparando listados…',
  },
};

const en = {
  sunnyChat: {
    viewListing: 'View listing',
    scheduleVisit: 'Schedule visit',
    photoOf: 'Photo {{current}} of {{total}}: {{title}}',
    previousPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    noPhoto: 'No published photos',
    statsHeading: 'Listing figures',
    compareHeading: 'Compare listings',
    chartHeading: 'Price per m²',
    pricePerM2: 'Price / m²',
    adminFee: 'Admin fee',
    strata: 'Stratum',
    area: 'Area',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    zone: 'Zone',
    price: 'Price',
    listing: 'Listing',
    best: 'Best value',
    loadingUi: 'Preparing listings…',
  },
};

const locale = typeof document !== 'undefined' ? document.documentElement.lang || 'es' : 'es';

void i18n.use(initReactI18next).init({
  lng: locale.toLowerCase().startsWith('en') ? 'en' : 'es',
  fallbackLng: 'es',
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
