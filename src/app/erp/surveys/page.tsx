'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { SurveyModal } from '@/components/surveys/survey-modal';
import { SiteSurvey } from '@/lib/types';
import { ClipboardCheck, Plus, Search, ArrowUpRight, Compass, Sun, MapPin, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function SurveysPage() {
  const { siteSurveys } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'capacity' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [surveyToEdit, setSurveyToEdit] = useState<SiteSurvey | null>(null);

  const filteredSurveys = siteSurveys
    .filter((s) => {
      const targetName = s.customerName || '';
      const matchesSearch =
        s.surveyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.surveyorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.siteAddress && s.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'capacity') {
        const cA = a.recommendedCapacityKw || a.roofAreaSqFt / 100;
        const cB = b.recommendedCapacityKw || b.roofAreaSqFt / 100;
        return sortOrder === 'desc' ? cB - cA : cA - cB;
      }
      if (sortBy === 'customer') {
        return sortOrder === 'desc'
          ? (b.customerName || '').localeCompare(a.customerName || '')
          : (a.customerName || '').localeCompare(b.customerName || '');
      }
      const dA = new Date(a.scheduledDate).getTime();
      const dB = new Date(b.scheduledDate).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    });

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage) || 1;
  const paginatedSurveys = filteredSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setSurveyToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <ModuleGuard module="surveys" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-brand-purple" /> Technical Site Surveys
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Rooftop shadow analysis, structural engineering parameters, and DISCOM net metering inspection logs.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule Site Survey
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by survey ID (e.g. SURV-2025-001), customer name, surveyor, or site address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="date">Survey Date</option>
                  <option value="capacity">Recommended Capacity (kW)</option>
                  <option value="customer">Customer Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
                  title="Toggle Ascending / Descending"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status Filter:</span>
              {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Surveys Table */}
        <Card className="border-slate-200">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Survey ID & Prospect</th>
                    <th className="p-3.5">Assigned Surveyor</th>
                    <th className="p-3.5">Roof & Shading Specs</th>
                    <th className="p-3.5">Recom. Capacity</th>
                    <th className="p-3.5">DISCOM Meter Connection</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSurveys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No technical site surveys match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedSurveys.map((surv) => (
                      <tr key={surv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <Link href={`/erp/surveys/${surv.id}`} className="font-mono font-bold text-navy-900 hover:text-brand-purple transition-colors flex items-center gap-1">
                            {surv.surveyNumber} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                          </Link>
                          <span className="text-[11px] text-slate-600 font-bold block mt-0.5">{surv.customerName || 'Prospect Client'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{surv.surveyorName}</span>
                          <span className="text-[10px] text-slate-400">Date: {new Date(surv.scheduledDate).toLocaleDateString()}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-navy-900 block">{surv.roofAreaSqFt} Sq Ft • {surv.roofType || 'RCC Roof'}</span>
                          <span className="text-[10px] text-slate-500 block">{surv.azimuthDirection || 'South 180°'} • {surv.shadingCondition || 'Clear'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-brand-purple text-sm block">
                            {surv.recommendedCapacityKw || Math.round(surv.roofAreaSqFt / 100)} kWp
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <span className="font-medium text-slate-800 block">{surv.discomConnection || 'MSEDCL LT'}</span>
                          <span className="text-[10px] text-slate-400">{surv.meterType || 'Bi-directional Net Meter'}</span>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={surv.status} />
                        </td>
                        <td className="p-3.5 text-right">
                          <Link href={`/erp/surveys/${surv.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Report
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <strong className="text-navy-900">{filteredSurveys.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
                <strong className="text-navy-900">{Math.min(currentPage * itemsPerPage, filteredSurveys.length)}</strong> of{' '}
                <strong className="text-navy-900">{filteredSurveys.length}</strong> site surveys
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="font-bold text-navy-900 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal */}
        <SurveyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          surveyToEdit={surveyToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
