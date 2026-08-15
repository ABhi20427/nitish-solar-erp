'use client';

import React from 'react';
import { useSolarStore } from '@/lib/store-context';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Settings, ShieldCheck, FileText, Database, Server } from 'lucide-react';

export default function SettingsPage() {
  const { auditLogs } = useSolarStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" /> System Configuration & Audit Logs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise company settings, DISCOM compliance rules, & immutable action audit log.
        </p>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader title="System Activity Audit Log" subtitle="Real-time audit log recording lead conversions, quotations, payments, and role changes." />
        <CardBody className="p-0">
          <div className="table-container border-0 rounded-none">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Persona</th>
                  <th>Module</th>
                  <th>Action Event</th>
                  <th>Activity Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="font-bold text-navy-900 text-xs">{log.userName}</div>
                      <StatusBadge status={log.userRole} />
                    </td>
                    <td className="text-xs font-semibold text-slate-700">{log.module}</td>
                    <td>
                      <span className="font-extrabold text-amber-600 text-xs">{log.action}</span>
                    </td>
                    <td className="text-xs text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
