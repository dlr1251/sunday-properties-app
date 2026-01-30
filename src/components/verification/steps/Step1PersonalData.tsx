import React, { useEffect } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Phone, MapPin, Calendar, Flag, AlertCircle, CheckCircle } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';
import { Badge } from '../../ui/badge';

export const Step1PersonalData: React.FC = () => {
  const { formData, setFormData, ageError, validateAge, idDocAnalysis } = useVerificationForm();

  // Pre-fill form with extracted data from document analysis
  useEffect(() => {
    if (idDocAnalysis?.extractedData) {
      const extracted = idDocAnalysis.extractedData;
      setFormData(prev => ({
        ...prev,
        // Only pre-fill if fields are empty
        date_of_birth: prev.date_of_birth || extracted.birthDate || '',
        nationality: prev.nationality || extracted.nationality || '',
      }));
      
      // Validate age if date was filled
      if (extracted.birthDate && !prev.date_of_birth) {
        validateAge(extracted.birthDate);
      }
    }
  }, [idDocAnalysis, setFormData, validateAge]);

  const handleDateChange = (dateOfBirth: string) => {
    setFormData(prev => ({ ...prev, date_of_birth: dateOfBirth }));
    validateAge(dateOfBirth);
  };

  const hasExtractedData = !!idDocAnalysis?.extractedData;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Datos Personales</h3>
        <p className="text-muted-foreground">
          {hasExtractedData 
            ? 'Revisa y completa los datos extraídos de tu documento' 
            : 'Ingresa tu información básica para comenzar el proceso de verificación'}
        </p>
        {hasExtractedData && (
          <Badge className="mt-2 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Datos extraídos automáticamente
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Teléfono *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+57 300 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicación *
          </Label>
          <Input
            id="location"
            placeholder="Ciudad, País"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="date_of_birth" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Nacimiento *
            {hasExtractedData && idDocAnalysis?.extractedData?.birthDate && (
              <Badge variant="outline" className="ml-2 text-xs">
                Extraído: {idDocAnalysis.extractedData.birthDate}
              </Badge>
            )}
          </Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />
          {ageError && (
            <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {ageError}
            </div>
          )}
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Nacionalidad *
            {hasExtractedData && idDocAnalysis?.extractedData?.nationality && (
              <Badge variant="outline" className="ml-2 text-xs">
                Extraído: {idDocAnalysis.extractedData.nationality}
              </Badge>
            )}
          </Label>
          <select
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar nacionalidad</option>
            <option value="Colombiano">Colombiano</option>
            <option value="Venezolano">Venezolano</option>
            <option value="Mexicano">Mexicano</option>
            <option value="Argentino">Argentino</option>
            <option value="Chileno">Chileno</option>
            <option value="Peruano">Peruano</option>
            <option value="Ecuatoriano">Ecuatoriano</option>
            <option value="Boliviano">Boliviano</option>
            <option value="Paraguayo">Paraguayo</option>
            <option value="Uruguayo">Uruguayo</option>
            <option value="Brasileño">Brasileño</option>
            <option value="Español">Español</option>
            <option value="Estadounidense">Estadounidense</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
    </div>
  );
};
