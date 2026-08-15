'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { HardHat, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Zap, Truck, Package, Wrench, Layers } from 'lucide-react';

export default function InstallationsPage() {
  const { installations, projects, products, orders } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Operational Dashboard KPI calculations
  const projectsAwaitingMaterials = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'PENDING').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= (p.reorderLevel || 50)).length;
  const pendingDeliveriesCount = orders.filter((o) => o.status === 'PARTIALLY_DELIVERED' || o.status === 'PROCESSING').length;
  const projectsNearingCompletion = installations.filter((j) => j.progressPct >= 80 && j.progressPct < 100).length;

  const filteredJobs = installations.filter((job) => {
    const matchesSearch =
      job.installationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.installerLeadName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ModuleGuard module="projects" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <HardHat className="w-6 h-6 text-brand-purple" /> Solar Rooftop Installation Desk
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              9-stage installation tracking: mounting, panels, inverters, wiring, earthing, testing, & commissioning.
            </p>
          </div>
        </div>

        {/* Operational Dashboard Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Card className="border-slate-200 bg-amber-50/50">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Awaiting Materials</span>
                <span className="text-2xl font-black text-navy-900">{projectsAwaitingMaterials} Projects</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-rose-50/50">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Low Stock Hardware</span>
                <span className="text-2xl font-black text-rose-700">{lowStockCount} Products</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-blue-50/50">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Pending Site Deliveries</span>
                <span className="text-2xl font-black text-blue-900">{pendingDeliveriesCount} Orders</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-emerald-50/50">
            <CardBody className="p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Nearing Completion</span>
                <span className="text-2xl font-black text-emerald-700">{projectsNearingCompletion} Projects</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Installation Jobs List */}
        <Card className="border-slate-200">
          <CardHeader title="Rooftop Installation Jobs" subtitle="Track 9-stage engineering progress across active sites." />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No rooftop installation jobs match the filter criteria.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id} className="p-5 hover:bg-slate-50 transition-colors space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-500 font-bold text-xs">{job.installationNumber}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-slate-600 font-bold">{job.projectNumber}</span>
                          <StatusBadge status={job.status} />
                        </div>
                        <h3 className="font-bold text-navy-900 text-base mt-0.5">{job.customerName}</h3>
                        <p className="text-slate-500 text-[11px]">
                          Site: {job.siteAddress} • Lead Installer: <strong className="text-slate-800">{job.installerLeadName}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[140px]">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Progress</span>
                          <span className="text-2xl font-black text-brand-purple">{job.progressPct}%</span>
                        </div>

                        <Link href={`/erp/installations/${job.id}`}>
                          <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
                            View Checklist
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-all duration-500"
                        style={{ width: `${job.progressPct}%` }}
                      />
                    </div>

                    {/* 9 Stages Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.stages.map((stg) => {
                        const isDone = stg.status === 'COMPLETED';
                        const isInProg = stg.status === 'IN_PROGRESS';
                        return (
                          <span
                            key={stg.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isInProg
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {stg.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </ModuleGuard>
  );
}
