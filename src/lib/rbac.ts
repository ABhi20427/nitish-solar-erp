import { Role } from './types';

export type ModuleName =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'pipeline'
  | 'surveys'
  | 'products'
  | 'quotations'
  | 'orders'
  | 'projects'
  | 'invoices'
  | 'followups'
  | 'analytics'
  | 'reports'
  | 'users'
  | 'settings';

export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

export interface RolePermissions {
  modules: ModuleName[];
  canCreate: ModuleName[];
  canEdit: ModuleName[];
  canDelete: ModuleName[];
  canApprove: ModuleName[];
}

export const ROLE_MATRIX: Record<Role, RolePermissions> = {
  SUPER_ADMIN: {
    modules: [
      'dashboard',
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
      'analytics',
      'users',
      'settings',
    ],
    canCreate: [
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
      'users',
    ],
    canEdit: [
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
      'users',
      'settings',
    ],
    canDelete: [
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'users',
    ],
    canApprove: ['quotations', 'orders', 'projects', 'invoices'],
  },
  ADMIN: {
    modules: [
      'dashboard',
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
      'analytics',
      'users',
      'settings',
    ],
    canCreate: [
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
    ],
    canEdit: [
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'followups',
    ],
    canDelete: ['leads', 'quotations'],
    canApprove: ['quotations', 'orders', 'projects', 'invoices'],
  },
  SALES_MANAGER: {
    modules: [
      'dashboard',
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'followups',
      'analytics',
    ],
    canCreate: ['leads', 'customers', 'pipeline', 'quotations', 'followups'],
    canEdit: ['leads', 'customers', 'pipeline', 'quotations', 'followups'],
    canDelete: ['leads', 'quotations'],
    canApprove: ['quotations', 'orders'],
  },
  SALES_EXECUTIVE: {
    modules: [
      'dashboard',
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'followups',
    ],
    canCreate: ['leads', 'pipeline', 'quotations', 'followups'],
    canEdit: ['leads', 'pipeline', 'quotations', 'followups'],
    canDelete: [],
    canApprove: [],
  },
  PROJECT_MANAGER: {
    modules: [
      'dashboard',
      'customers',
      'pipeline',
      'products',
      'orders',
      'projects',
      'followups',
      'analytics',
    ],
    canCreate: ['projects', 'followups'],
    canEdit: ['projects', 'pipeline', 'followups'],
    canDelete: [],
    canApprove: ['projects'],
  },
  FINANCE: {
    modules: [
      'dashboard',
      'customers',
      'quotations',
      'orders',
      'invoices',
      'analytics',
    ],
    canCreate: ['invoices'],
    canEdit: ['invoices', 'orders'],
    canDelete: [],
    canApprove: ['invoices'],
  },
  VIEWER: {
    modules: [
      'dashboard',
      'leads',
      'customers',
      'pipeline',
      'products',
      'quotations',
      'orders',
      'projects',
      'invoices',
      'analytics',
    ],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    canApprove: [],
  },
};

export function hasPermission(role: Role, module: ModuleName, action: ActionType = 'view'): boolean {
  const perm = ROLE_MATRIX[role];
  if (!perm) return false;

  if (action === 'view') {
    return perm.modules.includes(module);
  }
  if (action === 'create') {
    return perm.canCreate.includes(module);
  }
  if (action === 'edit') {
    return perm.canEdit.includes(module);
  }
  if (action === 'delete') {
    return perm.canDelete.includes(module);
  }
  if (action === 'approve') {
    return perm.canApprove.includes(module);
  }

  return false;
}
