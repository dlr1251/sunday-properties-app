import React from 'react';
import { UserGroupSectionProps } from './types';
import { UserCard } from './UserCard';

export const UserGroupSection: React.FC<UserGroupSectionProps> = ({
  title,
  users,
  icon,
  gridCols = 'grid-cols-1 md:grid-cols-2',
  cardClassName,
  buttonClassName,
  currentUserId,
  isLoggingIn,
  selectedUserId,
  onLogin,
  loading
}) => {
  if (users.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        {icon} {title}
      </h2>
      <div className={`grid ${gridCols} gap-4`}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isCurrentUser={user.id === currentUserId}
            isLoggingIn={isLoggingIn && selectedUserId === user.id}
            onLogin={onLogin}
            loading={loading}
            variant={gridCols.includes('lg:grid-cols-3') ? 'compact' : 'default'}
          />
        ))}
      </div>
    </div>
  );
};

