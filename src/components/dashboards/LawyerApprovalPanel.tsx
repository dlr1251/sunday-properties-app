import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '../../lib/supabase';
import { useLegalDocs } from '../../hooks/useLegalDocs';
import { toast } from 'sonner';

interface PropertyRow {
  id: string;
  title: string;
  address: string;
  city?: string;
  neighborhood?: string;
  price?: number;
  images?: string[];
  owner_id: string;
  legal_docs?: any;
}

export function LawyerApprovalPanel() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [selected, setSelected] = useState<PropertyRow | null>(null);
  const { getSignedUrl } = useLegalDocs();

  const fetchSubmitted = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id,title,address,city,neighborhood,price,images,owner_id,legal_docs')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (e: any) {
      toast.error(e.message || 'Error cargando propiedades');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      // Get property details first
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('title, owner_id')
        .eq('id', id)
        .single();

      if (propError) throw propError;

      // Update status
      const { error } = await supabase.from('properties').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;

      // Send notification to owner
      await supabase.from('notifications').insert({
        user_id: property.owner_id,
        type: 'property_status',
        title: 'Propiedad Aprobada',
        message: `Tu propiedad "${property.title}" ha sido aprobada y está lista para publicarse.`,
        data: { property_id: id, status: 'approved' },
        read: false
      });

      toast.success('Propiedad aprobada');
      fetchSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar propiedad');
    }
  };

  const publish = async (id: string) => {
    try {
      // Get property details first
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('title, owner_id')
        .eq('id', id)
        .single();

      if (propError) throw propError;

      // Update status
      const { error } = await supabase.from('properties').update({ status: 'published' }).eq('id', id);
      if (error) throw error;

      // Send notification to owner
      await supabase.from('notifications').insert({
        user_id: property.owner_id,
        type: 'property_status',
        title: 'Propiedad Publicada',
        message: `¡Felicidades! Tu propiedad "${property.title}" ya está publicada y visible para todos.`,
        data: { property_id: id, status: 'published' },
        read: false
      });

      toast.success('Propiedad publicada');
      fetchSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Error al publicar propiedad');
    }
  };

  const requestChanges = async (id: string, note: string) => {
    try {
      // Get property details first
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('title, owner_id')
        .eq('id', id)
        .single();

      if (propError) throw propError;

      // Update status
      const { error } = await supabase
        .from('properties')
        .update({ status: 'draft', review_notes: note })
        .eq('id', id);
      if (error) throw error;

      // Send notification to owner
      await supabase.from('notifications').insert({
        user_id: property.owner_id,
        type: 'property_status',
        title: 'Cambios Solicitados',
        message: `Se requieren cambios en tu propiedad "${property.title}". Revisa las notas del abogado.`,
        data: { property_id: id, status: 'draft', review_notes: note },
        read: false
      });

      toast.success('Cambios solicitados');
      fetchSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Error al solicitar cambios');
    }
  };

  useEffect(() => { fetchSubmitted(); }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Propiedades enviadas</CardTitle>
          <CardDescription>Revisa CLYT y documentos, aprueba o publica</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando...</p>
          ) : properties.length === 0 ? (
            <p>No hay propiedades en revisión</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <Card key={p.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{p.title}</h3>
                        <p className="text-sm text-gray-600">{p.address}{p.neighborhood ? `, ${p.neighborhood}` : ''}</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="secondary">Enviado</Badge>
                          {p.price ? <Badge variant="secondary">${p.price.toLocaleString()}</Badge> : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelected(p)}>Ver</Button>
                        <Button size="sm" onClick={() => approve(p.id)}>Aprobar</Button>
                        <Button size="sm" variant="secondary" onClick={() => publish(p.id)}>Publicar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.title}</CardTitle>
            <CardDescription>{selected.address}{selected.neighborhood ? `, ${selected.neighborhood}` : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Documentos</h4>
              <div className="flex gap-2">
                {['clyt','escritura','cedula'].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const list = (selected.legal_docs?.[type] || []) as string[];
                        if (!list.length) return toast.info('Sin documentos');
                        const url = await getSignedUrl(list[0]);
                        window.open(url, '_blank');
                      } catch (e: any) {
                        toast.error(e.message || 'Error abriendo documento');
                      }
                    }}
                  >
                    Ver {type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => publish(selected.id)}>Publicar</Button>
              <Button variant="outline" onClick={() => approve(selected.id)}>Aprobar</Button>
              <Button variant="secondary" onClick={() => requestChanges(selected.id, 'Falta nitidez en CLYT')}>Solicitar cambios</Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LawyerApprovalPanel;


