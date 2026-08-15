'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { User, Role } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { UserCheck, Shield, Mail, Phone, Lock } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserModal({ isOpen, onClose, userToEdit }: UserModalProps) {
  const { addUser, updateUser } = useSolarStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'SALES_EXECUTIVE' as Role,
    active: true,
    password: '',
  });

  useEffect(() => {
    if (userToEdit) {
      setForm({
        name: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone || '',
        role: userToEdit.role,
        active: userToEdit.active,
        password: '',
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        role: 'SALES_EXECUTIVE',
        active: true,
        password: '',
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    if (userToEdit) {
      updateUser(userToEdit.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        active: form.active,
        ...(form.password ? { password: form.password } : {}),
      });
    } else {
      addUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        active: form.active,
        password: form.password || 'password123',
      });
    }

    onClose();
  };

  const ROLES_LIST: { id: Role; label: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin' },
    { id: 'ADMIN', label: 'Admin' },
    { id: 'SALES_MANAGER', label: 'Sales Manager' },
    { id: 'SALES_EXECUTIVE', label: 'Sales Executive' },
    { id: 'PROJECT_MANAGER', label: 'Project Manager' },
    { id: 'FINANCE', label: 'Finance' },
    { id: 'VIEWER', label: 'Viewer' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900">
          <UserCheck className="w-5 h-5 text-brand-purple" />
          {userToEdit ? `Edit User — ${userToEdit.name}` : 'Create New User Account'}
        </span>
      }
      subtitle="Configure employee profile credentials and system role assignment."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Full Employee Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Vikramaditya Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              placeholder="name@nitishsolar.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned System Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {ROLES_LIST.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {userToEdit ? 'Set New Password' : 'Password *'}
            </label>
            <input
              type="password"
              placeholder={userToEdit ? 'Leave blank to keep unchanged' : 'Minimum 6 characters'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded text-brand-purple focus:ring-0"
            />
            <span className="font-semibold text-slate-700">Account Active Status</span>
          </label>

          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
              {userToEdit ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
