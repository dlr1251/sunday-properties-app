import { useCallback } from 'react';
import { useVerificationForm } from '../components/verification/VerificationFormContext';

export const useVerificationValidation = () => {
  const form = useVerificationForm();

  const validateStep1 = useCallback(() => {
    const { formData, ageError } = form;
    
    const errors: string[] = [];
    
    if (!formData.phone?.trim()) {
      errors.push('El teléfono es requerido');
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.push('El teléfono no tiene un formato válido');
    }
    
    if (!formData.location?.trim()) {
      errors.push('La ubicación es requerida');
    }
    
    if (!formData.date_of_birth?.trim()) {
      errors.push('La fecha de nacimiento es requerida');
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        const actualAge = age - 1;
        if (actualAge < 18) {
          errors.push('Debes ser mayor de 18 años');
        }
      } else if (age < 18) {
        errors.push('Debes ser mayor de 18 años');
      }
    }
    
    if (ageError) {
      errors.push(ageError);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [form]);

  const validateStep2 = useCallback(() => {
    const { formData } = form;
    
    const errors: string[] = [];
    
    if (!formData.how_did_you_find_us || formData.how_did_you_find_us.length === 0) {
      errors.push('Selecciona cómo nos encontraste');
    }
    
    if (!formData.what_do_you_want_to_do || formData.what_do_you_want_to_do.length === 0) {
      errors.push('Selecciona qué quieres hacer');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [form]);

  const validateStep4 = useCallback(() => {
    const { capturedSelfie } = form;
    
    const errors: string[] = [];
    
    if (!capturedSelfie) {
      errors.push('Debes tomar o subir una foto de tu rostro');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [form]);

  const validateStep5 = useCallback(() => {
    const { formData, uploadedIdDoc, uploadedPoaDoc } = form;
    
    const errors: string[] = [];
    
    if (!uploadedIdDoc) {
      errors.push('Debes subir tu cédula de ciudadanía');
    }
    
    if (!formData.is_owner && formData.has_poa && !uploadedPoaDoc) {
      errors.push('Debes subir tu poder notarial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [form]);

  const getStepValidation = useCallback((step: number) => {
    switch (step) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return { isValid: true, errors: [] };
      case 4: return validateStep4();
      case 5: return validateStep5();
      case 6: return { isValid: true, errors: [] };
      default: return { isValid: false, errors: ['Paso inválido'] };
    }
  }, [validateStep1, validateStep2, validateStep4, validateStep5]);

  return {
    validateStep1,
    validateStep2,
    validateStep4,
    validateStep5,
    getStepValidation
  };
};
