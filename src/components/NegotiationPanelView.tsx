import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { getPropertyImage } from '../utils/imageUtils';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calculator,
  BarChart3,
  Users,
  Shield,
  CreditCard,
  Bitcoin,
  ArrowUpDown,
  Eye,
  Send
} from 'lucide-react';

interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  offerPrice: number;
  originalPrice: number;
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
  closingDate: string;
  conditions: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  createdAt: string;
  expiresAt: string;
  counterOffer?: {
    price: number;
    conditions: string[];
    message: string;
  };
  metrics: {
    vpn: number;
    roi: number;
    irr: number;
    cashOnCash: number;
    riskScore: number;
  };
}

const mockOffers: Offer[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Apartamento Moderno en El Poblado',
    propertyImage: getPropertyImage(300, 200, 1),
    buyerId: '1',
    buyerName: 'Carlos Mendoza',
    buyerPhone: '+57 300 123 4567',
    buyerEmail: 'carlos@email.com',
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
    createdAt: '2024-01-10',
    expiresAt: '2024-01-17',
    metrics: {
      vpn: 385000000,
      roi: 12.5,
      irr: 15.2,
      cashOnCash: 8.3,
      riskScore: 3.2
    }
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Casa Familiar en Laureles',
    propertyImage: getPropertyImage(300, 200, 1),
    buyerId: '2',
    buyerName: 'Ana García',
    buyerPhone: '+57 310 987 6543',
    buyerEmail: 'ana@email.com',
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
    createdAt: '2024-01-08',
    expiresAt: '2024-01-15',
    counterOffer: {
      price: 370000000,
      conditions: ['Aceptar precio contraoferta'],
      message: 'Estamos dispuestos a aumentar nuestra oferta si incluyen los muebles.'
    },
    metrics: {
      vpn: 355000000,
      roi: 14.2,
      irr: 18.1,
      cashOnCash: 9.8,
      riskScore: 2.1
    }
  }
];

export const NegotiationPanelView: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    price: 0,
    paymentMethod: 'cash',
    closingDate: '',
    conditions: [] as string[],
    message: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: Offer['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Aceptada' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rechazada' },
      countered: { color: 'bg-blue-100 text-blue-800', label: 'Contraoferta' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expirada' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculateProgress = (offer: Offer) => {
    const daysElapsed = Math.floor((Date.now() - new Date(offer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((new Date(offer.expiresAt).getTime() - new Date(offer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min((daysElapsed / totalDays) * 100, 100);
  };

  const handleOfferAction = (offerId: string, action: 'accept' | 'reject') => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: action === 'accept' ? 'accepted' : 'rejected' }
        : offer
    ));
  };

  const handleCounterOffer = (offerId: string, counterOffer: Offer['counterOffer']) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: 'countered', counterOffer }
        : offer
    ));
  };

  const OfferCard: React.FC<{ offer: Offer }> = ({ offer }) => {
    const progress = calculateProgress(offer);
    const priceDifference = offer.offerPrice - offer.originalPrice;
    const priceDifferencePercent = (priceDifference / offer.originalPrice) * 100;

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start space-x-4">
          <img
            src={offer.propertyImage}
            alt={offer.propertyTitle}
            className="w-20 h-20 rounded-lg object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{offer.propertyTitle}</h3>
                <p className="text-muted-foreground text-sm">Oferta de {offer.buyerName}</p>
              </div>
              {getStatusBadge(offer.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Oferta</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(offer.offerPrice)}
                  </p>
                  <div className={`flex items-center space-x-1 ${
                    priceDifference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceDifference >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(priceDifferencePercent).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Precio original: {formatPrice(offer.originalPrice)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Método de Pago</p>
                <div className="flex items-center space-x-2">
                  {offer.paymentMethod === 'crypto' ? (
                    <Bitcoin className="h-4 w-4 text-orange-500" />
                  ) : offer.paymentMethod === 'financing' ? (
                    <CreditCard className="h-4 w-4 text-blue-500" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium capitalize">{offer.paymentMethod}</span>
                </div>
                {offer.financingDetails && (
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(offer.financingDetails.downPayment)} inicial
                  </p>
                )}
                {offer.cryptoDetails && (
                  <p className="text-xs text-muted-foreground">
                    {offer.cryptoDetails.amount} {offer.cryptoDetails.currency}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">VPN</p>
                <p className="font-semibold">{formatPrice(offer.metrics.vpn)}</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="font-semibold">{offer.metrics.roi}%</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">IRR</p>
                <p className="font-semibold">{offer.metrics.irr}%</p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Riesgo</p>
                <p className="font-semibold">{offer.metrics.riskScore}/5</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Tiempo restante</span>
                <span>{Math.max(0, Math.floor((new Date(offer.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {offer.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleOfferAction(offer.id, 'accept')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aceptar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setShowCounterModal(true);
                    }}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Contraoferta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOfferAction(offer.id, 'reject')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </>
              )}

              {offer.status === 'countered' && offer.counterOffer && (
                <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Contraoferta: {formatPrice(offer.counterOffer.price)}
                  </p>
                  <p className="text-xs text-blue-700">{offer.counterOffer.message}</p>
                </div>
              )}

              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const CounterOfferModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Hacer Contraoferta</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="counter-price">Nuevo Precio</Label>
            <Input
              id="counter-price"
              type="number"
              placeholder="370000000"
              value={newOffer.price}
              onChange={(e) => setNewOffer(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            />
            {newOffer.price > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {formatPrice(newOffer.price)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="counter-message">Mensaje</Label>
            <Textarea
              id="counter-message"
              placeholder="Explica las condiciones de tu contraoferta..."
              value={newOffer.message}
              onChange={(e) => setNewOffer(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label>Condiciones Adicionales</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="inspection" />
                <Label htmlFor="inspection" className="text-sm">Inspección técnica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="appraisal" />
                <Label htmlFor="appraisal" className="text-sm">Avalúo bancario</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="furniture" />
                <Label htmlFor="furniture" className="text-sm">Incluir muebles</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setShowCounterModal(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (selectedOffer) {
                handleCounterOffer(selectedOffer.id, {
                  price: newOffer.price,
                  conditions: ['Condiciones adicionales'],
                  message: newOffer.message
                });
                setShowCounterModal(false);
                setNewOffer({ price: 0, paymentMethod: 'cash', closingDate: '', conditions: [], message: '' });
              }
            }}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Contraoferta
          </Button>
        </div>
      </Card>
    </div>
  );

  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    countered: offers.filter(o => o.status === 'countered').length,
    avgDiscount: offers.reduce((sum, o) => sum + ((o.originalPrice - o.offerPrice) / o.originalPrice * 100), 0) / offers.length
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Panel de Negociación</h1>
            <p className="text-muted-foreground">
              Gestiona ofertas y contraofertas de tus propiedades
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Análisis Financiero
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Ofertas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-muted-foreground">Aceptadas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.countered}</div>
            <div className="text-sm text-muted-foreground">Contraofertas</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="accepted">Aceptadas</SelectItem>
                <SelectItem value="countered">Contraofertas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
            
            <Input placeholder="Buscar por comprador..." className="flex-1 max-w-md" />
            
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar por Fecha
            </Button>
          </div>
        </Card>

        {/* Offers List */}
        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>

      {showCounterModal && <CounterOfferModal />}
    </div>
  );
};
