import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeftClose } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { NegotiationListItem, ListedPropertyNoOffers } from '../../hooks/negotiations/useNegotiationsListData';

export type NegotiationsSidebarProps = {
  buyingNegotiations: NegotiationListItem[];
  sellingNegotiations: NegotiationListItem[];
  listedNoOffers: ListedPropertyNoOffers[];
  onClose: () => void;
  selectedPropertyId: string | null;
  onSelectProperty: (id: string | null) => void;
  currentNegotiationId?: string | null;
  formatPrice: (price: number) => string;
};

export const NegotiationsSidebar: React.FC<NegotiationsSidebarProps> = ({
  buyingNegotiations,
  sellingNegotiations,
  listedNoOffers,
  onClose,
  selectedPropertyId,
  onSelectProperty,
  currentNegotiationId,
  formatPrice
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-card overflow-hidden self-stretch">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <span className="text-sm font-semibold text-foreground">{t('negotiations.listTitle')}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClose}
          aria-label={t('negotiations.hideList')}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('negotiations.buying', { count: buyingNegotiations.length })}
          </div>
          {buyingNegotiations.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">{t('negotiations.noBuying')}</p>
          ) : (
            <ul className="space-y-0.5">
              {buyingNegotiations.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProperty(null);
                      navigate(`/negotiations/${n.id}`);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                      currentNegotiationId === n.id ? 'bg-brand-sky/15 text-brand-navy' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.property?.title} · {n.property?.city || ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-2 border-t border-border">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('negotiations.selling', { count: sellingNegotiations.length })}
          </div>
          {sellingNegotiations.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">{t('negotiations.noSelling')}</p>
          ) : (
            <ul className="space-y-0.5">
              {sellingNegotiations.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProperty(null);
                      navigate(`/negotiations/${n.id}`);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                      currentNegotiationId === n.id ? 'bg-brand-sky/15 text-brand-navy' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.property?.title} · {n.property?.city || ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-2 border-t border-border">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('negotiations.listedNoOffers', { count: listedNoOffers.length })}
          </div>
          {listedNoOffers.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">{t('negotiations.noListed')}</p>
          ) : (
            <ul className="space-y-0.5">
              {listedNoOffers.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelectProperty(p.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                      selectedPropertyId === p.id ? 'bg-brand-sky/15 text-brand-navy' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatPrice(p.price)} · {p.city || ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};
