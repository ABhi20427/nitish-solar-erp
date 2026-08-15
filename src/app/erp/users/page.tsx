'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserModal } from '@/components/users/user-modal';
import { User, Role } from '@/lib/types';
import { Users, UserPlus, Search, Shield, Edit, ToggleLeft, ToggleRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function UsersPage() {
  const { users, toggleUserStatus, currentUser } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? u.active
        : !u.active;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  return (
    <ModuleGuard module="users" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-brand-purple" /> User Management & Roles
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage nitish solar employee accounts, role assignments, and authentication status.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Create New User Account
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="SALES_EXECUTIVE">Sales Executive</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="FINANCE">Finance</option>
                <option value="VIEWER">Viewer</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Users Only</option>
                <option value="INACTIVE">Deactivated Users</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card className="border-slate-200">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Employee Name</th>
                    <th className="p-3.5">Email & Phone</th>
                    <th className="p-3.5">System Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No user accounts match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <Link href={`/erp/users/${user.id}`} className="font-bold text-navy-900 hover:text-brand-purple transition-colors flex items-center gap-1">
                                {user.name} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                              </Link>
                              {user.id === currentUser.id && (
                                <span className="text-[9px] bg-purple-100 text-brand-purple font-bold px-1.5 py-0.2 rounded">
                                  You (Active Persona)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{user.email}</div>
                          <div className="text-[10px] text-slate-400">{user.phone || 'No phone'}</div>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="purple">{user.role.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="p-3.5">
                          {user.active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-600 hover:text-brand-purple hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit User Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.active
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-rose-500 hover:bg-rose-50'
                              }`}
                              title={user.active ? 'Deactivate User Account' : 'Activate User Account'}
                            >
                              {user.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Create/Edit Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userToEdit={userToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
