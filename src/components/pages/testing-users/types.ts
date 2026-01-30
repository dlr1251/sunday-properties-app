import { UserProfile } from '@/lib/db/repositories/users.repo';

// Extended user profile with additional computed fields
export interface ExtendedUserProfile extends Omit<UserProfile, 'name'> {
  // Explicitly include all base properties
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserProfile['role'];
  verification_status: UserProfile['verification_status'];
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  // Additional computed fields
  propertiesCount?: number;
  properties?: Array<{ id: string; title: string }>;
  negotiationsCount?: number;
  activeNegotiations?: Array<{
    id: string;
    property: any;
    status: string;
    latestOffer: any;
  }>;
  full_name?: string | null;
  status?: string;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  last_login_at?: string | null;
}

export interface GroupedUsers {
  superAdmin: ExtendedUserProfile[];
  admins: ExtendedUserProfile[];
  lawyers: ExtendedUserProfile[];
  agents: ExtendedUserProfile[];
  users: ExtendedUserProfile[];
}

export interface UserCardProps {
  user: ExtendedUserProfile;
  isCurrentUser: boolean;
  isLoggingIn: boolean;
  onLogin: (user: ExtendedUserProfile) => void;
  loading: boolean;
  variant?: 'default' | 'compact';
}

export interface UserGroupSectionProps {
  title: string;
  users: ExtendedUserProfile[];
  icon: React.ReactNode;
  gridCols?: string;
  cardClassName?: string;
  buttonClassName?: string;
  currentUserId?: string;
  isLoggingIn: boolean;
  selectedUserId?: string | null;
  onLogin: (user: ExtendedUserProfile) => void;
  loading: boolean;
}

