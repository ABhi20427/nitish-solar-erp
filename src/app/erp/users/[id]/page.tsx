'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionOverview } from '@/components/users/permission-overview';
import { Shield, ArrowLeft, Mail, Phone, Calendar, CheckCircle2, UserCheck, Activity } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { users, toggleUserStatus, auditLogs, leads, projects } = useSolarStore();

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return (
      <ModuleGuard module="users" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">User Account Not Found</h2>
          <p className="text-xs text-slate-500">The requested employee user ID does not exist.</p>
          <Link href="/erp/users">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to User Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const userLogs = auditLogs.filter((log) => log.userName === user.name);
  const userLeads = leads.filter((l) => l.assignedToId === user.id || l.assignedToName === user.name);
  const userProjects = projects.filter((p) => p.projectManagerName === user.name);

  return (
    <ModuleGuard module="users" action="view">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/users">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Users Directory
            </Button>
          </Link>

          <Button
            variant={user.active ? 'outline' : 'accent'}
            onClick={() => toggleUserStatus(user.id)}
            className={user.active ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'bg-emerald-600 text-white'}
          >
            {user.active ? 'Deactivate User Account' : 'Activate User Account'}
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-brand-purple shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
                <Badge variant="purple">{user.role.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1">{user.email} • Phone: {user.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 space-y-1">
            <div>Status: <strong className={user.active ? 'text-emerald-400' : 'text-rose-400'}>{user.active ? 'ACTIVE' : 'DEACTIVATED'}</strong></div>
            <div>Joined: <strong>{new Date(user.createdAt).toLocaleDateString()}</strong></div>
          </div>
        </div>

        {/* Grid Stats & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Assigned Workloads */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardBody className="p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Leads</span>
                  <div className="text-2xl font-black text-navy-900 mt-1">{userLeads.length}</div>
                </CardBody>
              </Card>
              <Card className="border-slate-200">
                <CardBody className="p-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Managed Projects</span>
                  <div className="text-2xl font-black text-navy-900 mt-1">{userProjects.length}</div>
                </CardBody>
              </Card>
            </div>

            {/* Audit Logs History */}
            <Card className="border-slate-200">
              <CardHeader title="Recent Audit Activity Log" subtitle="Actions recorded by this employee account." />
              <CardBody className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {userLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">No activity logs recorded yet.</div>
                  ) : (
                    userLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="p-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-navy-900 block">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-slate-500 text-[11px]">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Permission Matrix */}
          <div className="lg:col-span-5">
            <PermissionOverview role={user.role} />
          </div>
        </div>
      </div>
    </ModuleGuard>
  );
}
