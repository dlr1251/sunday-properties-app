export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin' | 'super_admin';
  verification_status: 'pending' | 'verified' | 'rejected';
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  properties_count?: number;
  reports_count?: number;
  visits_count?: number;
  offers_count?: number;
}

export interface RoleStats {
  total_users: number;
  super_admins: number;
  admins: number;
  agents: number;
  verified_users: number;
  unverified_users: number;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  selfie_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationData {
  documentType: string;
  documentFile: File | null;
  selfieFile: File | null;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  phone: string;
  address: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  verified: boolean;
  premium: boolean;
  monthly_costs: number;
  features: string[];
  property_type: string;
  strata: number;
  year_built: number;
}
