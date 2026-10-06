import { useTranslation } from 'react-i18next';
import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Search } from 'lucide-react';

interface Filters {
  search: string;
  role: string;
}

interface Props {
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
}

export const RoleFilters: React.FC<Props> = ({
  filters, setFilters }) => {
    const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="search">{t('common.search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t('admin.nameOrEmailPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <Label>{t('admin.filterByRole')}</Label>
        <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.allRoles')}</SelectItem>
            <SelectItem value="user">{t('admin.roleUsers')}</SelectItem>
            <SelectItem value="agent">{t('admin.roleAgents')}</SelectItem>
            <SelectItem value="admin">{t('admin.roleAdmins')}</SelectItem>
            <SelectItem value="super_admin">{t('admin.roleSuperAdmins')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={() => setFilters({ search: '', role: 'all' })}
          className="w-full"
        >
          {t('common.clearFilters')}
        </Button>
      </div>
    </div>
  );
};


