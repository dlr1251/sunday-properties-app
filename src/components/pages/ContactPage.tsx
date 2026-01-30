import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Users,
  HeadphonesIcon
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('pages.contact.title')}
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              {t('pages.contact.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pages.contact.form.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      name="name"
                      placeholder={t('pages.contact.form.name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder={t('pages.contact.form.email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="phone"
                      placeholder={t('pages.contact.form.phone')}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Textarea
                      name="message"
                      placeholder={t('pages.contact.form.message')}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {t('pages.contact.form.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('pages.contact.info.title')}</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">{t('pages.contact.info.office')}</p>
                      <p className="text-gray-600">Carrera 7 #85-20, Bogotá, Colombia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">{t('pages.contact.info.phone')}</p>
                      <p className="text-gray-600">+57 (1) 555-0123</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">{t('pages.contact.info.email')}</p>
                      <p className="text-gray-600">contacto@sundayproperties.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('pages.contact.help.title')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('pages.contact.help.subtitle')}
                    </p>
                    <Button variant="outline">
                      <HeadphonesIcon className="w-4 h-4 mr-2" />
                      {t('pages.contact.help.chat')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
