import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../ui/select';
import { 
  Users, UserPlus, Search, Edit, Trash2, Eye, Shield, 
  CheckCircle, XCircle, Crown, Loader2, RefreshCw, AlertCircle,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateUserDialog } from '../../features/users/dialogs/CreateUserDialog';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDateFnsLocale } from '../../i18n/useDateFnsLocale';
import { Skeleton } from '../ui/skeleton';
import { ResourceDetailDialog } from './ResourceDetailDialog';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export function SuperAdminUsersManagement() {
  const { t, i18n } = useTranslation();
  const dateFnsLocale = useDateFnsLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [verifyingUser, setVerifyingUser] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof User | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err: any) {
      const errorMessage = err.message || t('admin.loadUsersError');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle column sorting
  const handleSort = useCallback((column: keyof User) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Memoized filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users.length) return [];
    
    // Filter users
    let filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower);
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });

    // Sort users
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortColumn];
        let bValue: any = b[sortColumn];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Handle date sorting
        if (sortColumn === 'created_at' || sortColumn === 'updated_at') {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue).getTime();
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Handle string sorting (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase(), i18n.language);
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        // Handle numeric sorting
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, selectedRole, sortColumn, sortDirection, i18n.language]);

  const handleCreateUser = async (userData: any) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: userData.full_name,
          phone: userData.phone || null,
          role: userData.role,
          status: 'active'
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast.success(t('admin.userCreated'));
      setShowCreateDialog(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(t('admin.createUserError', { message: error.message }));
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!editingUser) return;
    
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          role: userData.role,
          status: userData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast.success(t('admin.userUpdated'));
      setShowEditDialog(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(t('admin.updateUserError', { message: error.message }));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete from auth first
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id);
      if (authError) throw authError;

      toast.success(t('admin.userDeleted'));
      setShowDeleteDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(t('admin.deleteUserError', { message: error.message }));
    }
  };

  const handleToggleVerification = async (userId: string, currentStatus: string) => {
    try {
      setVerifyingUser(userId);
      const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
      
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          verification_status: newStatus,
          verified_at: newStatus === 'verified' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(t(newStatus === 'verified' ? 'admin.verificationToggledOn' : 'admin.verificationToggledOff'));
      await fetchUsers();
    } catch (error: any) {
      toast.error(t('admin.toggleVerificationError', { message: error.message }));
    } finally {
      setVerifyingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      super_admin: { label: t('profile.roles.super_admin'), variant: 'destructive' },
      admin: { label: t('profile.roles.admin'), variant: 'default' },
      lawyer: { label: t('profile.roles.lawyer'), variant: 'secondary' },
      agent: { label: t('profile.roles.agent'), variant: 'outline' },
      user: { label: t('profile.roles.user'), variant: 'outline' }
    };
    
    const config = variants[role] || { label: role, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('admin.status.verified')}
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <XCircle className="h-3 w-3 mr-1" />
        {t('admin.status.pending')}
      </Badge>
    );
  };

  // Skeleton loader component
  const TableSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('admin.manageUsersTitle')}</h2>
          <p className="text-muted-foreground mt-1">
            {t('admin.manageUsersDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('admin.createUser')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.searchUsersPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.filterByRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allRoles')}</SelectItem>
                <SelectItem value="super_admin">{t('profile.roles.super_admin')}</SelectItem>
                <SelectItem value="admin">{t('profile.roles.admin')}</SelectItem>
                <SelectItem value="lawyer">{t('profile.roles.lawyer')}</SelectItem>
                <SelectItem value="agent">{t('profile.roles.agent')}</SelectItem>
                <SelectItem value="user">{t('profile.roles.user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && !initialLoading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('admin.users')}</CardTitle>
              <CardDescription>
                {initialLoading 
                  ? t('admin.loadingUsers')
                  : t('admin.userFound', { count: filteredAndSortedUsers.length })
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialLoading ? (
            <TableSkeleton />
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">{t('admin.noUsersFound')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || selectedRole !== 'all' 
                  ? t('admin.adjustSearchFilters')
                  : t('admin.createFirstUserHint')}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('full_name')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('user')}
                          {sortColumn === 'full_name' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('profile.email')}
                          {sortColumn === 'email' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('phone')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('profile.phone')}
                          {sortColumn === 'phone' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('profile.role')}
                          {sortColumn === 'role' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('properties.status')}
                          {sortColumn === 'status' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-4 font-semibold">{t('admin.verificationStatus')}</th>
                      <th className="text-left p-4 font-semibold">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {t('common.created')}
                          {sortColumn === 'created_at' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </th>
                      <th className="text-right p-4 font-semibold">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-white">
                                {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="font-medium">{user.full_name || t('common.unnamed')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{user.email}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{user.phone || '-'}</span>
                        </td>
                        <td className="p-4">{getRoleBadge(user.role)}</td>
                        <td className="p-4">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVerification(user.id, user.verification_status || 'pending')}
                            disabled={verifyingUser === user.id}
                            className="h-auto p-0"
                          >
                            {verifyingUser === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              getStatusBadge(user.verification_status || 'pending')
                            )}
                          </Button>
                        </td>
                        <td className="p-4">
                          {user.created_at ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: dateFnsLocale })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(user.created_at), { 
                                  addSuffix: true, 
                                  locale: dateFnsLocale 
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedUserId(user.id);
                                setShowDetailsDialog(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user);
                                setShowEditDialog(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('admin.editUser')}</DialogTitle>
              <DialogDescription>
                {t('admin.editUserDescription', { email: editingUser.email })}
              </DialogDescription>
            </DialogHeader>
            <EditUserForm
              user={editingUser}
              onSave={handleEditUser}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.confirmDeleteUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.confirmDeleteUserBody')}{' '}
              <strong>{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <ResourceDetailDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setSelectedUser(null);
            setSelectedUserId(null);
          }
        }}
        resourceType="user"
        resourceId={selectedUserId}
        onUpdate={() => {
          fetchUsers();
        }}
      />
    </div>
  );
}

function EditUserForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User; 
  onSave: (data: any) => void; 
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    status: user.status || 'active'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">{t('profile.fullName')}</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('profile.email')}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t('profile.phone')}</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">{t('profile.role')}</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">{t('profile.roles.user')}</SelectItem>
            <SelectItem value="agent">{t('profile.roles.agent')}</SelectItem>
            <SelectItem value="lawyer">{t('profile.roles.lawyer')}</SelectItem>
            <SelectItem value="admin">{t('profile.roles.admin')}</SelectItem>
            <SelectItem value="super_admin">{t('profile.roles.super_admin')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">{t('properties.status')}</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('profile.accountStatuses.active')}</SelectItem>
            <SelectItem value="inactive">{t('profile.accountStatuses.inactive')}</SelectItem>
            <SelectItem value="suspended">{t('profile.accountStatuses.suspended')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('common.saving')}
            </>
          ) : (
            t('common.saveChanges')
          )}
        </Button>
      </div>
    </form>
  );
}

