import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Loader2, LogIn } from 'lucide-react';
import { ExtendedUserProfile } from './types';
import { formatRelativeTime, getRoleColor, getVerificationBadge, getRoleIcon } from './utils';
import { getAvatarUrl } from '@/utils/avatar';

interface TestingUsersTableProps {
  users: ExtendedUserProfile[];
  currentUserId?: string;
  isLoggingIn: boolean;
  selectedUserId?: string | null;
  onLogin: (user: ExtendedUserProfile) => void;
  loading: boolean;
}

export const TestingUsersTable: React.FC<TestingUsersTableProps> = ({
  users,
  currentUserId,
  isLoggingIn,
  selectedUserId,
  onLogin,
  loading
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No testing users found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">User</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[100px]">Role</TableHead>
              <TableHead className="min-w-[90px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Last login</TableHead>
              <TableHead className="min-w-[80px] text-center">Negotiations</TableHead>
              <TableHead className="min-w-[80px] text-center">Properties</TableHead>
              <TableHead className="min-w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const verification = getVerificationBadge(user.verification_status);
              const isCurrentUser = user.id === currentUserId;
              const userIsLoggingIn = isLoggingIn && selectedUserId === user.id;

              return (
                <TableRow
                  key={user.id}
                  className={isCurrentUser ? 'bg-green-50/50 dark:bg-green-950/20' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                        <AvatarImage src={getAvatarUrl(user)} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                          {(user.full_name || user.email).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                          {user.full_name || user.email}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              Current
                            </Badge>
                          )}
                        </div>
                        {user.full_name && user.email && (
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">{getRoleIcon(user.role)}</span>
                      <Badge className={`${getRoleColor(user.role)} text-xs`}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={verification.variant} className="text-xs">
                      {verification.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                    {user.last_login_at ? formatRelativeTime(user.last_login_at) : 'Never'}
                  </TableCell>
                  <TableCell className="text-center text-gray-600 dark:text-gray-400">
                    {user.negotiationsCount ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-gray-600 dark:text-gray-400">
                    {user.propertiesCount ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => onLogin(user)}
                      disabled={loading || isLoggingIn}
                      size="sm"
                      variant={isCurrentUser ? 'outline' : 'default'}
                      className="gap-1.5"
                    >
                      {userIsLoggingIn ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogIn className="h-3.5 w-3.5" />
                      )}
                      {userIsLoggingIn ? 'Logging in...' : 'Login'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
