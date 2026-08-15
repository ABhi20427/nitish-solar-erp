'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSolarStore } from '@/lib/store-context';
import { hasPermission, ModuleName, ActionType } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export function ERPAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSolarStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Verifying nitish solar authentication session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface ModuleGuardProps {
  module: ModuleName;
  action?: ActionType;
  children: React.ReactNode;
}

export function ModuleGuard({ module, action = 'view', children }: ModuleGuardProps) {
  const { currentUser } = useSolarStore();
  const allowed = hasPermission(currentUser.role, module, action);

  if (!allowed) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            403 Access Denied
          </span>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Restricted Module Permission
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your current assigned role (<strong className="text-navy-900 font-bold">{currentUser.role.replace(/_/g, ' ')}</strong>) does not have authorization to {action} records in the <strong className="text-navy-900 font-bold">{module}</strong> module.
          </p>
        </div>

        <Card className="text-left bg-slate-50 border-slate-200 text-xs">
          <CardBody className="p-4 space-y-2">
            <h4 className="font-bold text-navy-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" /> Permission Scope Details:
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>• Required privilege level: <span className="font-semibold text-navy-900">{module} ({action})</span></li>
              <li>• Your active role: <span className="font-semibold text-rose-600">{currentUser.role}</span></li>
              <li>• Contact <span className="font-semibold text-navy-900">Super Admin (vikram@nitishsolar.com)</span> to request access elevation.</li>
            </ul>
          </CardBody>
        </Card>

        <div className="flex justify-center gap-3">
          <Link href="/erp">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to ERP Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white" icon={<LogIn className="w-4 h-4" />}>
              Switch Role Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
