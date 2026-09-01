import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNegotiationsListData } from '../../hooks/negotiations/useNegotiationsListData';
import { NegotiationsSidebar } from './NegotiationsSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Eye,
  PanelLeft,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

function getWeekdayCapitalized(locale: string): string {
  const name = new Date().toLocaleDateString(locale, { weekday: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const NegotiationsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || t('dashboard.welcome');
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const dayName = getWeekdayCapitalized(i18n.language || 'en');

  const {
    buyingNegotiations,
    sellingNegotiations,
    listedNoOffers,
    loading,
    error
  } = useNegotiationsListData(user?.id);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const selectedProperty = selectedPropertyId ? listedNoOffers.find((p) => p.id === selectedPropertyId) : null;
  const hasAnyItems = buyingNegotiations.length > 0 || sellingNegotiations.length > 0 || listedNoOffers.length > 0;

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('negotiations.loading')}</h1>
          <p className="text-muted-foreground mt-2">{t('negotiations.loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('common.error')}</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-row min-h-0 w-full">
      {sidebarOpen && (
        <NegotiationsSidebar
          buyingNegotiations={buyingNegotiations}
          sellingNegotiations={sellingNegotiations}
          listedNoOffers={listedNoOffers}
          onClose={() => setSidebarOpen(false)}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          currentNegotiationId={null}
          formatPrice={formatCurrency}
        />
      )}

        {/* Columna derecha: título + contenido */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                {t('dashboard.welcomeGreeting', { day: dayName, name: firstName })}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">{t('dashboard.subtitle')}</p>
              <h2 className="mt-4 text-xl font-semibold text-foreground">{t('dashboard.myNegotiations')}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t('negotiations.manageSubtitle')}</p>
            </div>
            {!sidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0"
                aria-label={t('negotiations.showList')}
              >
                <PanelLeft className="h-4 w-4 mr-2" />
                {t('common.list')}
              </Button>
            )}
          </div>

          <main className="flex-1 min-h-0 overflow-auto">
          {selectedProperty ? (
            <Card className="border-2 border-amber-200 bg-amber-50/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg">{t('negotiations.initialOfferTitle')}</CardTitle>
                </div>
                <CardDescription>
                  {t('negotiations.initialOfferDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('negotiations.propertyLabel')}</p>
                  <p className="text-lg font-semibold text-foreground">{selectedProperty.title}</p>
                  {(selectedProperty.neighborhood || selectedProperty.city) && (
                    <p className="text-sm text-muted-foreground">
                      {[selectedProperty.neighborhood, selectedProperty.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-xl font-bold text-foreground">{formatCurrency(selectedProperty.price)}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">{t('negotiations.noOffersYet')}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard?tab=properties')}>
                    {t('negotiations.viewMyProperties')}
                  </Button>
                  <Button size="sm" onClick={() => navigate('/properties')}>
                    {t('negotiations.exploreMarket')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !hasAnyItems ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('negotiations.emptyTitle')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('negotiations.emptyDescription')}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={() => navigate('/properties')}>{t('negotiations.exploreProperties')}</Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard?tab=properties')}>
                    {t('nav.myProperties')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground/70 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('negotiations.selectTitle')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('negotiations.selectDescription')}
                </p>
                {!sidebarOpen && (
                  <Button variant="outline" onClick={() => setSidebarOpen(true)}>
                    {t('negotiations.showList')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          </main>
        </div>
    </div>
  );
};
