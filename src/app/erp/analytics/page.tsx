'use client';

import React, { useState } from 'react';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Zap, Users, Award, ShieldCheck, DollarSign, CheckCircle2, Clock, Layers, MapPin, Building2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const { leads, customers, quotations, orders, projects, invoices, payments, siteSurveys, installations } = useSolarStore();

  const [activeTab, setActiveTab] = useState<'sales' | 'projects' | 'financial' | 'capacity'>('sales');

  // Executive KPI Calculations
  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0) || 15075600;
  const monthlySales = orders.filter((o) => new Date(o.orderDate).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + o.totalAmount, 0) || 375600;
  const pipelineValue = leads.reduce((acc, l) => acc + (l.monthlyBillAmount ? l.monthlyBillAmount * 10 : 450000), 0) || 5800000;
  const wonDealsCount = leads.filter((l) => l.status === 'WON').length || 4;
  const totalLeadsCount = leads.length || 1;
  const conversionRatePct = Math.round((wonDealsCount / totalLeadsCount) * 100);

  const activeProjectsCount = projects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const outstandingPayments = invoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  // Capacity KPIs (kWp)
  const totalProposedKw = leads.reduce((acc, l) => acc + (l.proposedCapacityKw || 10), 0);
  const totalSoldKw = orders.reduce((acc, o) => acc + o.systemCapacityKw, 0);
  const totalInstalledKw = projects.filter((p) => p.status === 'COMPLETED' || p.progressPct >= 80).reduce((acc, p) => acc + p.systemSizeKw, 0);

  // Chart Colors
  const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  // Monthly Revenue Data
  const monthlyRevenueData = [
    { month: 'Sep', Revenue: 18.5, InstalledKw: 45 },
    { month: 'Oct', Revenue: 34.2, InstalledKw: 80 },
    { month: 'Nov', Revenue: 48.0, InstalledKw: 120 },
    { month: 'Dec', Revenue: 62.5, InstalledKw: 180 },
    { month: 'Jan', Revenue: 95.0, InstalledKw: 250 },
    { month: 'Feb', Revenue: 147.0, InstalledKw: 350 },
  ];

  // Sales by Customer Type
  const salesByCustomerTypeData = [
    { name: 'Commercial', value: 45 },
    { name: 'Industrial', value: 35 },
    { name: 'Residential', value: 15 },
    { name: 'Government', value: 5 },
  ];

  // Sales by Region
  const salesByRegionData = [
    { region: 'Pune MIDC', sales: 6.8 },
    { region: 'Ahmedabad GIDC', sales: 4.2 },
    { region: 'Mumbai Suburbs', sales: 2.9 },
    { region: 'Nashik Industrial', sales: 1.6 },
  ];

  // Sales by Executive
  const salesByExecutiveData = [
    { name: 'Siddharth Patel', won: 12, kw: 480, revenue: 2.1 },
    { name: 'Ananya Verma', won: 9, kw: 650, revenue: 3.4 },
    { name: 'Priya Iyer', won: 8, kw: 350, revenue: 1.5 },
  ];

  // Projects by Stage
  const projectsByStageData = [
    { stage: 'Planning', count: projects.filter((p) => p.status === 'PLANNING').length || 2 },
    { stage: 'Design', count: projects.filter((p) => p.status === 'DESIGN' || p.status === 'ENGINEERING_DESIGN').length || 3 },
    { stage: 'Procurement', count: projects.filter((p) => p.status === 'PROCUREMENT' || p.status === 'MATERIAL_DISPATCH').length || 2 },
    { stage: 'Installation', count: projects.filter((p) => p.status === 'INSTALLATION' || p.status === 'STRUCTURE_MOUNTING').length || 4 },
    { stage: 'Testing', count: projects.filter((p) => p.status === 'TESTING').length || 1 },
    { stage: 'Commissioning', count: projects.filter((p) => p.status === 'COMMISSIONING' || p.status === 'COMMISSIONED').length || 2 },
  ];

  return (
    <ModuleGuard module="analytics" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-brand-purple" /> Executive Analytics & Management Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              High-level KPIs, revenue realization velocity, solar capacity trends, & team performance metrics.
            </p>
          </div>
        </div>

        {/* Top Executive KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          <Card className="border-slate-200">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Sales</span>
              <span className="text-base font-black text-navy-900">₹{(totalSales / 100000).toFixed(1)}L</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-emerald-50/50">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Sales</span>
              <span className="text-base font-black text-emerald-700">₹{(monthlySales / 100000).toFixed(1)}L</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-purple-50/50">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline Value</span>
              <span className="text-base font-black text-brand-purple">₹{(pipelineValue / 100000).toFixed(1)}L</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Won Deals</span>
              <span className="text-base font-black text-navy-900">{wonDealsCount} Deals</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-blue-50/50">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Win Conversion</span>
              <span className="text-base font-black text-blue-700">{conversionRatePct}%</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Projects</span>
              <span className="text-base font-black text-amber-700">{activeProjectsCount}</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-emerald-50/50">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
              <span className="text-base font-black text-emerald-700">{completedProjectsCount}</span>
            </CardBody>
          </Card>

          <Card className="border-slate-200 bg-rose-50/50">
            <CardBody className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Outstanding</span>
              <span className="text-base font-black text-rose-700">₹{(outstandingPayments / 100000).toFixed(1)}L</span>
            </CardBody>
          </Card>
        </div>

        {/* 4 Dedicated Analytics Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'sales'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'projects'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Project Execution Analytics
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'financial'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Financial Analytics
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'capacity'
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            Solar Capacity (kWp) Analytics
          </button>
        </div>

        {/* TAB 1: Sales Analytics */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Monthly Revenue Trend */}
              <Card className="lg:col-span-8 border-slate-200">
                <CardHeader
                  title="Monthly Revenue Realization (₹ Lakhs)"
                  subtitle="Turnkey contract milestone billing collections trajectory."
                />
                <CardBody>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="Revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Sales by Customer Type */}
              <Card className="lg:col-span-4 border-slate-200">
                <CardHeader title="Sales Distribution by Customer Type" subtitle="Commercial vs Industrial vs Residential ratio." />
                <CardBody className="flex flex-col items-center justify-center">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCustomerTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {salesByCustomerTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2">
                    {salesByCustomerTypeData.map((d, idx) => (
                      <span key={d.name} className="flex items-center gap-1 font-semibold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        {d.name} ({d.value}%)
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Regional Sales Breakdown */}
              <Card className="lg:col-span-6 border-slate-200">
                <CardHeader title="Sales Revenue by Region / Industrial Zone" subtitle="Turnkey sales volume in ₹ Cr." />
                <CardBody>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByRegionData} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: '#475569' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Bar dataKey="sales" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              {/* Sales Executive Leaderboard */}
              <Card className="lg:col-span-6 border-slate-200">
                <CardHeader title="Sales Executive Performance Leaderboard" subtitle="Closed deals, capacity sold, & revenue generated." />
                <CardBody className="p-0">
                  <div className="divide-y divide-slate-100 text-xs">
                    {salesByExecutiveData.map((exec, idx) => (
                      <div key={exec.name} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-100 font-bold text-navy-900 flex items-center justify-center text-xs">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-navy-900 block">{exec.name}</span>
                            <span className="text-[10px] text-slate-400">{exec.won} Won Deals • {exec.kw} kWp Sold</span>
                          </div>
                        </div>
                        <span className="font-black text-emerald-700 text-sm">₹{exec.revenue} Cr</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: Project Execution Analytics */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-7 border-slate-200">
                <CardHeader title="Turnkey Projects Distribution by Stage" subtitle="Active site execution pipeline across stages." />
                <CardBody>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectsByStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card className="lg:col-span-5 border-slate-200">
                <CardHeader title="Project Execution Metrics Summary" subtitle="Site execution benchmarks." />
                <CardBody className="space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Active Solar Projects:</span>
                    <span className="font-extrabold text-navy-900">{activeProjectsCount}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Completed & Commissioned:</span>
                    <span className="font-bold text-emerald-700">{completedProjectsCount}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Average Turnkey Delivery Time:</span>
                    <span className="font-bold text-slate-800">28 Days</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">DISCOM Grid Synchronization Rate:</span>
                    <span className="font-bold text-brand-purple">100% On-Time</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: Financial Analytics */}
        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            <Card className="lg:col-span-6 border-slate-200">
              <CardHeader title="Financial Revenue vs. Collections Overview" subtitle="Turnkey billing breakdown." />
              <CardBody className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Contract Valuation:</span>
                  <span className="font-black text-navy-900 text-sm">₹{(totalSales / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Paid Collections:</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{(invoices.reduce((a, i) => a + i.paidAmount, 0) / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Outstanding Balance:</span>
                  <span className="font-extrabold text-amber-700 text-sm">₹{(outstandingPayments / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Overdue Invoices Amount:</span>
                  <span className="font-bold text-rose-600 text-sm">
                    ₹{(invoices.filter((i) => i.status === 'OVERDUE').reduce((a, i) => a + i.balanceAmount, 0) / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </CardBody>
            </Card>

            <Card className="lg:col-span-6 border-slate-200">
              <CardHeader title="Monthly Financial Realization Trend" subtitle="Revenue trajectory in ₹ Lakhs." />
              <CardBody>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="Revenue" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB 4: Solar Capacity (kWp) Analytics */}
        {activeTab === 'capacity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            <Card className="lg:col-span-4 border-slate-200">
              <CardHeader title="Solar Capacity Pipeline Summary" subtitle="Kilowatt peak (kWp) metrics." />
              <CardBody className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Proposed Capacity</span>
                  <span className="text-2xl font-black text-navy-900">{totalProposedKw} kWp</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Sold Capacity</span>
                  <span className="text-2xl font-black text-brand-purple">{totalSoldKw} kWp</span>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 text-[10px] uppercase font-bold block">Total Installed & Commissioned</span>
                  <span className="text-2xl font-black text-emerald-800">{totalInstalledKw || 450} kWp</span>
                </div>
              </CardBody>
            </Card>

            <Card className="lg:col-span-8 border-slate-200">
              <CardHeader title="Monthly Installed Solar Capacity Growth (kWp)" subtitle="Growth in rooftop capacity commissioned." />
              <CardBody>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="InstalledKw" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCap)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
}
