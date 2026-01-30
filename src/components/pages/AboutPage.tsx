import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Award,
  Target,
  Users,
  CheckCircle,
  ArrowRight,
  Building2,
  Heart,
  Sparkles,
  MapPin,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    { number: '10K+', label: t('pages.about.stats.properties'), icon: Building2 },
    { number: '50K+', label: t('pages.about.stats.users'), icon: Users },
    { number: '98%', label: t('pages.about.stats.satisfaction'), icon: Heart },
    { number: '24/7', label: t('pages.about.stats.support'), icon: Clock },
  ];

  const values = [
    {
      icon: Shield,
      title: t('pages.about.values.transparency.title'),
      description: t('pages.about.values.transparency.description'),
      color: 'text-blue-600'
    },
    {
      icon: Award,
      title: t('pages.about.values.excellence.title'),
      description: t('pages.about.values.excellence.description'),
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: t('pages.about.values.trust.title'),
      description: t('pages.about.values.trust.description'),
      color: 'text-green-600'
    },
    {
      icon: Sparkles,
      title: t('pages.about.values.innovation.title'),
      description: t('pages.about.values.innovation.description'),
      color: 'text-orange-600'
    }
  ];

  const team = [
    {
      name: 'Ana María González',
      role: 'CEO & Fundadora',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      bio: 'Con más de 15 años en el sector inmobiliario colombiano.',
      linkedin: '#'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Director de Tecnología',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      bio: 'Experto en desarrollo de plataformas digitales innovadoras.',
      linkedin: '#'
    },
    {
      name: 'Laura Fernández',
      role: 'Directora Legal',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      bio: 'Abogada especializada en derecho inmobiliario.',
      linkedin: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{t('pages.about.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('pages.about.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
              {t('pages.about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-blue-50 transition-colors mb-4">
                    <Icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {t('pages.about.mission.title')}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {t('pages.about.mission.description')}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  {t('pages.about.mission.whyChoose')}
                </h3>
                <div className="space-y-3">
                  {[
                    t('pages.about.mission.features.verified'),
                    t('pages.about.mission.features.simplified'),
                    t('pages.about.mission.features.blockchain'),
                    t('pages.about.mission.features.legal'),
                    t('pages.about.mission.features.financing'),
                    t('pages.about.mission.features.guarantee')
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
                  alt="Equipo de trabajo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-blue-600 rounded-2xl opacity-10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pages.about.values.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pages.about.values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className={`w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center ${value.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
                        <Icon className={`w-7 h-7 ${value.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pages.about.team.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pages.about.team.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all group overflow-hidden bg-white">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {member.name}
                    </h4>
                    <p className="text-blue-600 font-medium">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pages.about.history.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pages.about.history.subtitle')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { year: '2020', title: 'Fundación', description: 'Sunday fue fundada con la visión de transformar el mercado inmobiliario colombiano.' },
              { year: '2021', title: 'Primeras 1,000 propiedades', description: 'Alcanzamos nuestra primera meta de propiedades verificadas en la plataforma.' },
              { year: '2022', title: 'Expansión tecnológica', description: 'Implementamos tecnología blockchain y contratos inteligentes para mayor seguridad.' },
              { year: '2023', title: '50,000 usuarios', description: 'Superamos los 50,000 usuarios activos en nuestra plataforma.' },
              { year: '2024', title: 'Lanzamiento nacional', description: 'Expandimos nuestras operaciones a nivel nacional con presencia en todas las principales ciudades.' },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('pages.about.cta.title')}
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {t('pages.about.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-6 text-lg"
                onClick={() => navigate('/properties')}
              >
                {t('pages.about.cta.explore')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg"
                onClick={() => navigate('/contact')}
              >
                {t('pages.about.cta.contact')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
