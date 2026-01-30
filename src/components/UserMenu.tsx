import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useSignOutWithRedirect } from '../utils/auth';

export const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { signOutAndRedirect } = useSignOutWithRedirect();

  const handleSignOut = async () => {
    console.log('🚪 UserMenu: Logout button clicked');
    try {
      await signOutAndRedirect(signOut, '/testing-users');
    } catch (error) {
      console.error('🚪 UserMenu: Logout failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url || ''} alt={user?.name || ''} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} keepOpen>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('nav.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
