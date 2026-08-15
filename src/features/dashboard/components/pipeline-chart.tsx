'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export function DashboardCharts() {
  const pipelineStageData = [
    { stage: 'New', count: 18, value: 45 },
    { stage: 'Contacted', count: 14, value: 62 },
    { stage: 'Survey Scheduled', count: 10, value: 85 },
    { stage: 'Proposal Sent', count: 8, value: 110 },
    { stage: 'Negotiating', count: 5, value: 140 },
    { stage: 'Won', count: 12, value: 250 },
  ];

  const revenueData = [
    { month: 'Sep', Target: 20, Actual: 18 },
    { month: 'Oct', Target: 35, Actual: 38 },
    { month: 'Nov', Target: 50, Actual: 54 },
    { month: 'Dec', Target: 70, Actual: 72 },
    { month: 'Jan', Target: 90, Actual: 98 },
    { month: 'Feb', Target: 120, Actual: 147 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sales Pipeline Stage Funnel Chart */}
      <Card className="lg:col-span-6">
        <CardHeader
          title="Sales Pipeline Stages & Value (kWp)"
          subtitle="Distribution of prospects across conversion stages."
        />
        <CardBody>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Capacity kWp" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* Revenue Realization Chart */}
      <Card className="lg:col-span-6">
        <CardHeader
          title="Monthly Revenue Realization (₹ Lakhs)"
          subtitle="Target vs Actual milestone billing collections."
        />
        <CardBody>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B192C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0B192C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B192C', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Actual" stroke="#0B192C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
