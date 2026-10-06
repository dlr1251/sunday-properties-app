import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Calendar, ExternalLink, FileSignature, Home, KeyRound, RefreshCw, User } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/utils/format';

type RentalContractStatus = 'pending_signature' | 'signed' | 'completed' | 'cancelled';

type RentalsRow = {
  id: string;
  offer_id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  final_price: number;
  closing_date: string;
  payment_method: string;
  conditions: string | null;
  contract_url: string | null;
  status: RentalContractStatus;
  created_at: string;
  updated_at: string;
  signed_at: string | null;
  completed_at: string | null;
  offer?: {
    id: string;
    transaction_type?: 'sale' | 'rental' | null;
    monthly_rent?: number | null;
    lease_start_date?: string | null;
    lease_term_months?: number | null;
  } | null;
  property?: {
    id: string;
    title: string;
    address: string;
    images?: string[] | null;
  } | null;
  tenant?: { id: string; full_name?: string | null; email?: string | null } | null;
  landlord?: { id: string; full_name?: string | null; email?: string | null } | null;
};

function statusBadge(status: RentalContractStatus, t: (key: string) => string) {
  const map: Record<RentalContractStatus, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> =
    {
      pending_signature: { labelKey: 'dashboard.rentals.pendingSignature', variant: 'secondary' },
      signed: { labelKey: 'dashboard.rentals.signed', variant: 'default' },
      completed: { labelKey: 'dashboard.rentals.completed', variant: 'outline' },
      cancelled: { labelKey: 'dashboard.rentals.cancelled', variant: 'destructive' },
    };
  const cfg = map[status] ?? { labelKey: status, variant: 'secondary' as const };
  return { label: t(cfg.labelKey), variant: cfg.variant };
}

export const MyRentalsTab: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RentalsRow[]>([]);
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');

  const [editing, setEditing] = useState<RentalsRow | null>(null);
  const [editStatus, setEditStatus] = useState<RentalContractStatus>('pending_signature');
  const [editUrl, setEditUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const tenantContracts = useMemo(
    () => rows.filter((r) => r.offer?.transaction_type === 'rental' && r.buyer_id === user?.id),
    [rows, user?.id]
  );
  const landlordContracts = useMemo(
    () => rows.filter((r) => r.offer?.transaction_type === 'rental' && r.seller_id === user?.id),
    [rows, user?.id]
  );

  const fetchContracts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(
          `
          id,
          offer_id,
          property_id,
          buyer_id,
          seller_id,
          final_price,
          closing_date,
          payment_method,
          conditions,
          contract_url,
          status,
          created_at,
          updated_at,
          signed_at,
          completed_at,
          offer:offers!contracts_offer_id_fkey (
            id,
            transaction_type,
            monthly_rent,
            lease_start_date,
            lease_term_months
          ),
          property:properties!contracts_property_id_fkey (
            id,
            title,
            address,
            images
          ),
          tenant:profiles!contracts_buyer_id_fkey (
            id,
            full_name,
            email
          ),
          landlord:profiles!contracts_seller_id_fkey (
            id,
            full_name,
            email
          )
        `
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRows((data as unknown as RentalsRow[]) ?? []);
    } catch (e: any) {
      console.error('MyRentalsTab: failed to load contracts', e);
      toast.error(e?.message || t('dashboard.rentals.loadError'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openEdit = (row: RentalsRow) => {
    setEditing(row);
    setEditStatus(row.status);
    setEditUrl(row.contract_url ?? '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const patch: Partial<RentalsRow> = {
        contract_url: editUrl.trim() ? editUrl.trim() : null,
        status: editStatus,
        updated_at: new Date().toISOString(),
        signed_at: editStatus === 'signed' ? new Date().toISOString() : editing.signed_at,
        completed_at: editStatus === 'completed' ? new Date().toISOString() : editing.completed_at,
      };

      const { error } = await supabase.from('contracts').update(patch).eq('id', editing.id);
      if (error) throw error;

      toast.success(t('dashboard.rentals.updated'));
      setEditing(null);
      await fetchContracts();
    } catch (e: any) {
      console.error('MyRentalsTab: failed to update contract', e);
      toast.error(e?.message || t('dashboard.rentals.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const emptyTitle = activeTab === 'tenant' ? t('dashboard.rentals.emptyTenantTitle') : t('dashboard.rentals.emptyLandlordTitle');
  const emptyDesc =
    activeTab === 'tenant'
      ? t('dashboard.rentals.emptyTenantDesc')
      : t('dashboard.rentals.emptyLandlordDesc');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              {t('dashboard.myRentalsTitle', 'Mis Arriendos')}
            </CardTitle>
            <CardDescription>{t('dashboard.myRentalsDescription', 'Gestiona tus contratos de arriendo.')}</CardDescription>
          </div>
          <Button variant="outline" onClick={fetchContracts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Actualizar')}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tenant' | 'landlord')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tenant">{t('dashboard.rentalsAsTenant', 'Como arrendatario')}</TabsTrigger>
              <TabsTrigger value="landlord">{t('dashboard.rentalsAsLandlord', 'Como arrendador')}</TabsTrigger>
            </TabsList>

            <TabsContent value="tenant" className="mt-4">
              <RentalsList
                currentUserId={user?.id ?? null}
                rows={tenantContracts}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDesc}
                onEdit={openEdit}
              />
            </TabsContent>
            <TabsContent value="landlord" className="mt-4">
              <RentalsList
                currentUserId={user?.id ?? null}
                rows={landlordContracts}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDesc}
                onEdit={openEdit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent
          className="max-w-lg"
          onClose={() => {
            if (!saving) setEditing(null);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('dashboard.rentals.editContract')}</DialogTitle>
            <DialogDescription>{t('dashboard.rentals.editContractDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-status">{t('dashboard.rentals.status')}</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as RentalContractStatus)}>
                <SelectTrigger id="contract-status">
                  <SelectValue placeholder={t('dashboard.rentals.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_signature">{t('dashboard.rentals.pendingSignature')}</SelectItem>
                  <SelectItem value="signed">{t('dashboard.rentals.signed')}</SelectItem>
                  <SelectItem value="completed">{t('dashboard.rentals.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('dashboard.rentals.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-url">{t('dashboard.rentals.contractUrl')}</Label>
              <Input
                id="contract-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RentalsList: React.FC<{
  currentUserId: string | null;
  rows: RentalsRow[];
  emptyTitle: string;
  emptyDescription: string;
  onEdit: (row: RentalsRow) => void;
}> = ({ currentUserId, rows, emptyTitle, emptyDescription, onEdit }) => {
  const { t } = useTranslation();
  if (!rows.length) {
    return (
      <div className="text-center py-12">
        <FileSignature className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
        <p className="text-gray-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const property = row.property;
        const offer = row.offer;
        const status = statusBadge(row.status, t);
        const start = offer?.lease_start_date ? formatDate(offer.lease_start_date) : '—';
        const term = offer?.lease_term_months != null ? t('dashboard.rentals.termMonths', { count: offer.lease_term_months }) : '—';

        const isTenant = !!currentUserId && row.buyer_id === currentUserId;
        const counterpartyLabel = isTenant ? t('dashboard.rentals.landlord') : t('dashboard.rentals.tenant');
        const counterparty = isTenant
          ? row.landlord?.full_name || row.landlord?.email || '—'
          : row.tenant?.full_name || row.tenant?.email || '—';

        return (
          <Card key={row.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-36 h-36 sm:h-auto sm:min-h-[180px] shrink-0 rounded-l-lg overflow-hidden bg-muted">
                  <img
                    src={Array.isArray(property?.images) && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg'}
                    alt={property?.title || t('dashboard.rentals.propertyFallback')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== '/placeholder-property.jpg') target.src = '/placeholder-property.jpg';
                    }}
                  />
                </div>

                <div className="flex-1 p-4 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{property?.title || t('dashboard.rentals.propertyFallback')}</h3>
                      {property?.address && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Home className="h-4 w-4 shrink-0" />
                          {property.address}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <User className="h-4 w-4 shrink-0" />
                        <span className="font-medium">{counterpartyLabel}:</span> {counterparty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-2 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600 shrink-0" />
                      <span className="text-gray-800 font-semibold">{t('dashboard.rentals.start')}:</span>
                      <span className="text-gray-900">{start}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-semibold">{t('dashboard.rentals.term')}:</span>
                      <span className="text-gray-900">{term}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-semibold">{t('dashboard.rentals.rent')}:</span>
                      <span className="text-gray-900">{offer?.monthly_rent != null ? formatCurrency(offer.monthly_rent) : '—'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex flex-col sm:flex-row gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="flex-1 min-w-0" onClick={() => onEdit(row)}>
                      {t('common.edit')}
                    </Button>
                    {row.contract_url && (
                      <a
                        href={row.contract_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('dashboard.rentals.viewContract')}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MyRentalsTab;
