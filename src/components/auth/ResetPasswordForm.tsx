import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../../lib/supabase';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una letra y un número');
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Tu contraseña ha sido actualizada.');
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;