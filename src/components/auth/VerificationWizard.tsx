import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVerification } from '../../hooks/verification/useVerification';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

const VerificationWizard: React.FC<Props> = ({ onComplete, onCancel }) => {
  const { submitVerification } = useVerification();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({
    document_type: 'cedula',
    document_front: null as File | null,
    document_back: null as File | null,
    selfie: null as File | null,
    full_name: '',
    dob: '',
    nationality: '',
    phone: '',
    address: '',
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    const res = await submitVerification({
      document_type: form.document_type,
      info: {
        full_name: form.full_name,
        dob: form.dob,
        nationality: form.nationality,
        phone: form.phone,
        address: form.address,
      },
    });
    if (res.ok) onComplete();
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Verificación de identidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <Label>Tipo de documento</Label>
              <select
                className="border rounded px-3 py-2"
                value={form.document_type}
                onChange={(e) => setForm({ ...form, document_type: e.target.value })}
              >
                <option value="cedula">Cédula</option>
                <option value="cedula_extranjeria">Cédula de extranjería</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
              <div className="flex gap-2 justify-end">
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>Documento (frente y reverso si aplica)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, document_front: e.target.files?.[0] || null })} />
              <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, document_back: e.target.files?.[0] || null })} />
              <div className="flex gap-2 justify-between">
                <Button variant="outline" onClick={back}>Atrás</Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label>Selfie para verificación</Label>
              <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, selfie: e.target.files?.[0] || null })} />
              <div className="flex gap-2 justify-between">
                <Button variant="outline" onClick={back}>Atrás</Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nombre completo</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Fecha de nacimiento</Label>
                  <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div>
                  <Label>Nacionalidad</Label>
                  <Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Dirección</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-between">
                <Button variant="outline" onClick={back}>Atrás</Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <Textarea readOnly value={`Documento: ${form.document_type}\nNombre: ${form.full_name}\nDOB: ${form.dob}\nNacionalidad: ${form.nationality}\nTeléfono: ${form.phone}\nDirección: ${form.address}`} />
              <div className="flex gap-2 justify-between">
                <Button variant="outline" onClick={back}>Atrás</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                  <Button onClick={handleSubmit}>Enviar</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationWizard;