'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSolarStore } from '@/lib/store-context';
import { BrandLogo } from '@/components/public/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Check, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, users } = useSolarStore();

  const [email, setEmail] = useState('vikram@nitishsolar.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        router.push('/erp');
      } else {
        setError(result.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(userEmail, 'password123');
      if (res.success) {
        router.push('/erp');
      } else {
        setError(res.error || 'Demo login failed.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 flex items-center justify-between z-10">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <BrandLogo variant="light" />
        </Link>
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
          ← Back to Public Website
        </Link>
      </div>

      {/* Main Form Center */}
      <div className="max-w-md w-full mx-auto px-4 py-10 z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-purplelight" />
            <span>Secure Enterprise Single Sign-On</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sign in to nitish solar ERP
          </h1>
          <p className="text-xs text-slate-400">
            Internal Portal for Sales, Engineering, Operations & Finance.
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <CardBody className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@nitishsolar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-brand-purplelight hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-brand-purple focus:ring-0" />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <Button
                variant="accent"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold py-3 border-0 shadow-brand"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Authenticating...' : 'Sign In to ERP Workspace'}
              </Button>
            </form>

            {/* Quick Demo Role Switcher Section */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-purplelight" /> Quick Demo Role Login
                </span>
                <span className="text-[10px] text-amber-400">1-Click Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(u.email)}
                    className={`p-2 rounded-lg text-left border transition-all text-[11px] ${
                      email.toLowerCase() === u.email.toLowerCase()
                        ? 'bg-brand-purple/20 border-brand-purple text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold block truncate">{u.name}</span>
                    <span className="text-[9px] text-amber-400 font-medium block">{u.role.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 text-center text-xs text-slate-500 z-10 border-t border-slate-900">
        © nitish solar. All rights reserved. Enterprise Security Protected.
      </div>
    </div>
  );
}
