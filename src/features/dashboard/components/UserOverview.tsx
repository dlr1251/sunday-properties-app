import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { User, Mail, Phone, MapPin, Calendar, Shield, Heart as HeartIcon, Home as HomeIcon, CheckCircle2, ArrowRight } from 'lucide-react';

export const UserOverview: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    properties: 0,
    favorites: 0,
    visits: 0,
    offers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const [propertiesRes, favoritesRes, visitsRes, offersRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('visits').select('id', { count: 'exact', head: true }).eq('visitor_id', user.id),
          supabase.from('offers').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id)
        ]);

        setStats({
          properties: propertiesRes.count || 0,
          favorites: favoritesRes.count || 0,
          visits: visitsRes.count || 0,
          offers: offersRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      {/* Verification Status Card */}
      {isVerified ? (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Cuenta Verificada
                    <Badge className="bg-green-600 text-white border-0 shadow-sm font-semibold">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    Tu cuenta ha sido verificada exitosamente. Disfruta de todas las funcionalidades disponibles.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-3 shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Verifica tu cuenta
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Completa el proceso de verificación para acceder a todas las funcionalidades y aumentar tu credibilidad en la plataforma.
                  </p>
                  <Button 
                    onClick={() => navigate('/verification')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  >
                    Iniciar Verificación
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Perfil</CardTitle>
            {isVerified ? (
              <Badge className="bg-green-600 text-white border-0 shadow-sm font-semibold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold text-gray-700">No Verificado</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{profile?.full_name || 'Usuario'}</h3>
              <div className="flex flex-col gap-1 mt-1 text-sm text-gray-700">
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4 text-gray-600" />
                  {user?.email}
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="w-4 h-4 text-gray-600" />
                    {profile.phone}
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    {profile.location}
                  </div>
                )}
                {profile?.date_of_birth && (
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    {new Date(profile.date_of_birth).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          {profile?.bio && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-700 font-medium">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">Propiedades</CardTitle>
            <HomeIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.properties}</div>
            <p className="text-xs text-gray-700 font-medium">Propiedades publicadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">Favoritos</CardTitle>
            <HeartIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.favorites}</div>
            <p className="text-xs text-gray-700 font-medium">Propiedades guardadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">Visitas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.visits}</div>
            <p className="text-xs text-gray-700 font-medium">Visitas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">Ofertas</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.offers}</div>
            <p className="text-xs text-gray-700 font-medium">Ofertas enviadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

