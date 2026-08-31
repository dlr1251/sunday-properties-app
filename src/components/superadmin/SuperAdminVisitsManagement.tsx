import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { formatDate } from '../../utils/format';

export function SuperAdminVisitsManagement() {
  const { t } = useTranslation();
  const dateFnsLocale = useDateFnsLocale();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visit_requests')
        .select(`
          *,
          property:properties(id, title, address),
          buyer:profiles!visit_requests_buyer_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      console.error('Error al cargar visitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: t('admin.status.pending'), variant: 'secondary' as const },
      confirmed: { label: t('admin.status.confirmed'), variant: 'default' as const },
      completed: { label: t('admin.status.completed'), variant: 'default' as const },
      rejected: { label: t('admin.status.rejected'), variant: 'destructive' as const },
      cancelled: { label: t('admin.status.cancelled'), variant: 'outline' as const }
    };
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredVisits = visits.filter(visit =>
    visit.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visit.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('admin.manageVisitsTitle')}</h2>
        <p className="text-muted-foreground">
          {t('admin.manageVisitsDescription')}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchVisitsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.visitsCountLabel', { count: filteredVisits.length })}</CardTitle>
          <CardDescription>{t('admin.visitsAllDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('admin.noVisitsFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('negotiations.propertyLabel')}</th>
                    <th className="text-left p-4">{t('visits.visitor')}</th>
                    <th className="text-left p-4">{t('visits.date')}/{t('visits.time')}</th>
                    <th className="text-left p-4">{t('properties.status')}</th>
                    <th className="text-left p-4">{t('common.created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((visit) => (
                    <tr key={visit.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{visit.property?.title}</div>
                        <div className="text-sm text-muted-foreground">{visit.property?.address}</div>
                      </td>
                      <td className="p-4">
                        <div>{visit.buyer?.full_name || '-'}</div>
                        <div className="text-sm text-muted-foreground">{visit.buyer?.email}</div>
                      </td>
                      <td className="p-4">
                        {visit.scheduled_date ? (
                          <div>
                            <div>{format(new Date(visit.scheduled_date), 'dd/MM/yyyy', { locale: dateFnsLocale })}</div>
                            {visit.scheduled_time && (
                              <div className="text-sm text-muted-foreground">{visit.scheduled_time}</div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4">{getStatusBadge(visit.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {visit.created_at ? formatDate(visit.created_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

