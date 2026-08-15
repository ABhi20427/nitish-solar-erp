'use client';

import React from 'react';
import { Role } from '@/lib/types';
import { ROLE_MATRIX, hasPermission, ModuleName } from '@/lib/rbac';
import { Check, X, Shield } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/card';

interface PermissionOverviewProps {
  role: Role;
}

export function PermissionOverview({ role }: PermissionOverviewProps) {
  const modules: { id: ModuleName; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview' },
    { id: 'leads', label: 'Leads Management' },
    { id: 'customers', label: 'Customer Accounts' },
    { id: 'pipeline', label: 'Sales Pipeline & Surveys' },
    { id: 'products', label: 'Solar Products Catalog' },
    { id: 'quotations', label: 'Quotations & Sizing' },
    { id: 'orders', label: 'Customer Orders' },
    { id: 'projects', label: 'Projects & Milestones' },
    { id: 'invoices', label: 'Invoices & Billing' },
    { id: 'followups', label: 'Follow-up Alerts' },
    { id: 'analytics', label: 'Sales Analytics & Reports' },
    { id: 'users', label: 'User Management & Roles' },
    { id: 'settings', label: 'ERP System Settings' },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader
        title={
          <span className="flex items-center gap-2 text-base font-bold text-navy-900">
            <Shield className="w-5 h-5 text-brand-purple" /> RBAC Matrix — {role.replace(/_/g, ' ')}
          </span>
        }
        subtitle="Granular privilege permissions for the selected role."
      />
      <CardBody className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-2.5 rounded-l-lg">Module</th>
                <th className="p-2.5 text-center">View Access</th>
                <th className="p-2.5 text-center">Create</th>
                <th className="p-2.5 text-center">Edit</th>
                <th className="p-2.5 text-center rounded-r-lg">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((m) => {
                const canView = hasPermission(role, m.id, 'view');
                const canCreate = hasPermission(role, m.id, 'create');
                const canEdit = hasPermission(role, m.id, 'edit');
                const canDelete = hasPermission(role, m.id, 'delete');

                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-navy-900">{m.label}</td>
                    <td className="p-2.5 text-center">
                      {canView ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          <Check className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-[10px]">
                          <X className="w-3.5 h-3.5" /> Denied
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      {canCreate ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2.5 text-center">
                      {canEdit ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="p-2.5 text-center">
                      {canDelete ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
