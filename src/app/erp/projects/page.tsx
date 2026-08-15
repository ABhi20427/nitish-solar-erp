'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { ProjectModal } from '@/components/projects/project-modal';
import { Project } from '@/lib/types';
import { Wrench, Plus, Search, ArrowUpRight, Zap, CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown, Clock } from 'lucide-react';

export default function ProjectsPage() {
  const { projects } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'progress' | 'capacity' | 'value' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.projectManagerName && p.projectManagerName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return sortOrder === 'desc' ? b.progressPct - a.progressPct : a.progressPct - b.progressPct;
      }
      if (sortBy === 'capacity') {
        return sortOrder === 'desc' ? b.systemSizeKw - a.systemSizeKw : a.systemSizeKw - b.systemSizeKw;
      }
      if (sortBy === 'value') {
        const vA = a.projectValue || a.systemSizeKw * 45000;
        const vB = b.projectValue || b.systemSizeKw * 45000;
        return sortOrder === 'desc' ? vB - vA : vA - vB;
      }
      const dA = new Date(a.startDate).getTime();
      const dB = new Date(b.startDate).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <ModuleGuard module="projects" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-brand-purple" /> Solar Projects & Turnkey Commissioning
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track 9-stage engineering milestones, team assignments, procurement, & grid sync progress.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<Plus className="w-4 h-4" />}
          >
            Initialize Project
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
                  placeholder="Search project by ID (e.g. PRJ-2025-001), customer name, city, or project manager..."
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
                  <option value="date">Start Date</option>
                  <option value="progress">Completion %</option>
                  <option value="capacity">System Size (kW)</option>
                  <option value="value">Project Valuation (₹)</option>
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

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Stage Filter:</span>
              {['ALL', 'PLANNING', 'DESIGN', 'PROCUREMENT', 'INSTALLATION', 'TESTING', 'COMMISSIONING', 'COMPLETED', 'ON_HOLD'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
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

        {/* Projects Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProjects.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
              No solar projects match the filter criteria.
            </div>
          ) : (
            paginatedProjects.map((proj) => {
              const val = proj.projectValue || proj.systemSizeKw * 45000;
              return (
                <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-amber-500 font-bold">{proj.projectNumber}</span>
                      <StatusBadge status={proj.status} />
                    </div>

                    <Link href={`/erp/projects/${proj.id}`} className="font-bold text-navy-900 text-sm hover:text-brand-purple transition-colors block leading-snug line-clamp-1">
                      {proj.customerName}
                    </Link>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-brand-purple">{proj.systemSizeKw} kWp System</span>
                      <span className="font-black text-emerald-700">₹{(val / 100000).toFixed(2)}L</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Milestone Progress</span>
                        <span className="font-bold text-navy-900">{proj.progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-blue transition-all duration-500"
                          style={{ width: `${proj.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>Manager: <strong className="text-slate-800">{proj.projectManagerName || 'Priya I.'}</strong></span>
                      <span>{proj.city}</span>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target: {proj.targetDate ? new Date(proj.targetDate).toLocaleDateString() : 'Pending'}
                    </span>

                    <Link href={`/erp/projects/${proj.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Open Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        <Card className="border-slate-200">
          <CardBody className="p-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <strong className="text-navy-900">{filteredProjects.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
              <strong className="text-navy-900">{Math.min(currentPage * itemsPerPage, filteredProjects.length)}</strong> of{' '}
              <strong className="text-navy-900">{filteredProjects.length}</strong> active projects
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
          </CardBody>
        </Card>

        {/* Modal */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectToEdit={projectToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
