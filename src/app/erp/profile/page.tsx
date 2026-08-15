'use client';

import React, { useState } from 'react';
import { useSolarStore } from '@/lib/store-context';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionOverview } from '@/components/users/permission-overview';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Mail, Phone, Lock, Save, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword } = useSolarStore();
  const { addToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    addToast({ title: 'Profile updated successfully!', type: 'success' });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const res = changePassword(passwordForm.oldPassword, passwordForm.newPassword);
    if (res.success) {
      addToast({ title: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-brand-purple shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{currentUser.name}</h1>
              <Badge variant="purple">{currentUser.role.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1">{currentUser.email} • Assigned Role: {currentUser.role}</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 space-y-1">
          <div>Account Status: <strong className="text-emerald-400">ACTIVE</strong></div>
          <div>Joined: <strong>{new Date(currentUser.createdAt).toLocaleDateString()}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Edit Profile & Security */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Profile Info */}
          <Card>
            <CardHeader title="Edit Personal Information" subtitle="Update your display name, email, and contact number." />
            <CardBody>
              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<Save className="w-4 h-4" />}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader title="Password Security" subtitle="Update your secret account login password." />
            <CardBody>
              {passwordError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold" icon={<KeyRound className="w-4 h-4" />}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Permission Overview */}
        <div className="lg:col-span-5">
          <PermissionOverview role={currentUser.role} />
        </div>
      </div>
    </div>
  );
}
