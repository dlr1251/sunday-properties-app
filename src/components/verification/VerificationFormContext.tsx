import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { VerificationData } from '../../hooks/verification/useVerificationFlow';
import { DocumentData } from '../../services/documentAnalysis';

interface VerificationFormContextType {
  formData: VerificationData;
  setFormData: React.Dispatch<React.SetStateAction<VerificationData>>;
  capturedSelfie: string | null;
  setCapturedSelfie: (selfie: string | null) => void;
  uploadedIdDoc: File | null;
  setUploadedIdDoc: (file: File | null) => void;
  uploadedPoaDoc: File | null;
  setUploadedPoaDoc: (file: File | null) => void;
  ageError: string;
  setAgeError: (error: string) => void;
  idDocPreview: string | null;
  setIdDocPreview: (preview: string | null) => void;
  poaDocPreview: string | null;
  setPoaDocPreview: (preview: string | null) => void;
  validateAge: (dateOfBirth: string) => boolean;
  // New fields for document analysis
  idDocAnalysis: DocumentData | null;
  setIdDocAnalysis: (analysis: DocumentData | null) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  additionalDocuments: File[];
  setAdditionalDocuments: (docs: File[]) => void;
  userNotes: string;
  setUserNotes: (notes: string) => void;
}

const VerificationFormContext = createContext<VerificationFormContextType | undefined>(undefined);

export const useVerificationForm = () => {
  const context = useContext(VerificationFormContext);
  if (!context) {
    throw new Error('useVerificationForm must be used within VerificationFormProvider');
  }
  return context;
};

interface VerificationFormProviderProps {
  children: ReactNode;
}

export const VerificationFormProvider: React.FC<VerificationFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<VerificationData>({
    phone: '',
    location: '',
    date_of_birth: '',
    nationality: '',
    is_owner: true,
    has_poa: false,
    how_did_you_find_us: [],
    what_do_you_want_to_do: [],
  });

  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [uploadedIdDoc, setUploadedIdDoc] = useState<File | null>(null);
  const [uploadedPoaDoc, setUploadedPoaDoc] = useState<File | null>(null);
  const [ageError, setAgeError] = useState<string>('');
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
  const [poaDocPreview, setPoaDocPreview] = useState<string | null>(null);
  const [idDocAnalysis, setIdDocAnalysis] = useState<DocumentData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [userNotes, setUserNotes] = useState<string>('');

  // Age validation
  const validateAge = useCallback((dateOfBirth: string) => {
    if (!dateOfBirth) {
      setAgeError('');
      return true;
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 18) {
        setAgeError('Debes ser mayor de 18 años para verificar tu identidad');
        return false;
      }
    } else if (age < 18) {
      setAgeError('Debes ser mayor de 18 años para verificar tu identidad');
      return false;
    }

    setAgeError('');
    return true;
  }, []);

  const value: VerificationFormContextType = {
    formData,
    setFormData,
    capturedSelfie,
    setCapturedSelfie,
    uploadedIdDoc,
    setUploadedIdDoc,
    uploadedPoaDoc,
    setUploadedPoaDoc,
    ageError,
    setAgeError,
    idDocPreview,
    setIdDocPreview,
    poaDocPreview,
    setPoaDocPreview,
    validateAge,
    idDocAnalysis,
    setIdDocAnalysis,
    termsAccepted,
    setTermsAccepted,
    additionalDocuments,
    setAdditionalDocuments,
    userNotes,
    setUserNotes,
  };

  return (
    <VerificationFormContext.Provider value={value}>
      {children}
    </VerificationFormContext.Provider>
  );
};
