'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowUpTaskModal } from '@/components/followups/followup-task-modal';
import { FollowUp, FollowUpStatus, FollowUpType, Priority } from '@/lib/types';
import {
  Bell,
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Video,
  MapPin,
  Mail,
  MessageSquare,
  Search,
  Filter,
  User,
} from 'lucide-react';

export default function FollowUpsPage() {
  const { followUps, updateFollowUpStatus, users } = useSolarStore();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'all'>('overdue');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date classifiers
  const isOverdue = (f: FollowUp) => {
    if (f.status === 'COMPLETED' || f.status === 'CANCELLED' || f.isCompleted) return false;
    const fDate = f.dueDate.split('T')[0];
    return fDate < todayStr;
  };

  const isToday = (f: FollowUp) => {
    const fDate = f.dueDate.split('T')[0];
    return fDate === todayStr;
  };

  const isUpcoming = (f: FollowUp) => {
    if (f.status === 'COMPLETED' || f.status === 'CANCELLED' || f.isCompleted) return false;
    const fDate = f.dueDate.split('T')[0];
    return fDate > todayStr;
  };

  const overdueList = followUps.filter(isOverdue);
  const todayList = followUps.filter(isToday);
  const upcomingList = followUps.filter(isUpcoming);

  const currentTabList =
    activeTab === 'overdue'
      ? overdueList
      : activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
      ? upcomingList
      : followUps;

  const filteredFollowUps = currentTabList.filter((f) => {
    const targetName = f.leadName || f.customerName || '';
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (t?: FollowUpType) => {
    switch (t) {
      case 'Call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'Meeting':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'Site Visit':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return <span className="bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded text-[10px]">URGENT</span>;
      case 'HIGH':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded text-[10px]">MEDIUM</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">LOW</span>;
    }
  };

  return (
    <ModuleGuard module="leads" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-brand-purple" /> Sales Follow-up & Task Desk
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track callbacks, technical site visits, and proposal follow-ups with real-time overdue alerts.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule New Follow-up
          </Button>
        </div>

        {/* OVERDUE ALERT BANNER */}
        {overdueList.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-rose-900 text-sm">
                  ATTENTION: {overdueList.length} Overdue Follow-up Task{overdueList.length > 1 ? 's' : ''}!
                </h3>
                <p className="text-xs text-rose-700">
                  Follow-up commitments require immediate action to maintain client pipeline velocity.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('overdue')}
              className="bg-rose-600 text-white border-none font-bold hover:bg-rose-700 shrink-0 text-xs"
            >
              View Overdue Tasks ({overdueList.length})
            </Button>
          </div>
        )}

        {/* Category Tabs Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overdue')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === 'overdue'
                ? 'bg-rose-950 text-white border-rose-950 shadow-lg'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] text-rose-400 block font-mono uppercase">Attention Needed</span>
              <span className="text-base font-black">Overdue ({overdueList.length})</span>
            </div>
            <AlertTriangle className={`w-5 h-5 ${activeTab === 'overdue' ? 'text-rose-400' : 'text-rose-600'}`} />
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === 'today'
                ? 'bg-navy-950 text-white border-navy-950 shadow-lg'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] text-brand-purplelight block font-mono uppercase">Today's Schedule</span>
              <span className="text-base font-black">Today ({todayList.length})</span>
            </div>
            <Calendar className={`w-5 h-5 ${activeTab === 'today' ? 'text-amber-400' : 'text-brand-purple'}`} />
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === 'upcoming'
                ? 'bg-navy-950 text-white border-navy-950 shadow-lg'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] text-emerald-400 block font-mono uppercase">Planned Tasks</span>
              <span className="text-base font-black">Upcoming ({upcomingList.length})</span>
            </div>
            <Clock className={`w-5 h-5 ${activeTab === 'upcoming' ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
              activeTab === 'all'
                ? 'bg-navy-950 text-white border-navy-950 shadow-lg'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Full History</span>
              <span className="text-base font-black">All ({followUps.length})</span>
            </div>
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-3 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search follow-up by task title, prospect name, or discussion notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="ALL">All Activity Types</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Site Visit">Site Visit</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Follow-up Tasks Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFollowUps.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
              No follow-up tasks match this view.
            </div>
          ) : (
            filteredFollowUps.map((fol) => {
              const overdueFlag = isOverdue(fol);
              const targetName = fol.leadName || fol.customerName || 'Solar Prospect';

              return (
                <div
                  key={fol.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                    overdueFlag
                      ? 'border-rose-300 bg-rose-50/30'
                      : fol.status === 'COMPLETED' || fol.isCompleted
                      ? 'border-slate-200 bg-slate-50/60 opacity-85'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        {getTypeIcon(fol.type)}
                        <span>{fol.type || 'Call'}</span>
                      </div>
                      {getPriorityBadge(fol.priority)}
                    </div>

                    <h3 className="font-extrabold text-navy-900 text-sm leading-snug">{fol.title}</h3>

                    <div className="text-slate-600 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                      <span>{targetName}</span>
                    </div>

                    {fol.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        {fol.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <div className={`flex items-center gap-1 font-bold ${overdueFlag ? 'text-rose-700' : 'text-slate-600'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(fol.dueDate).toLocaleDateString()} {fol.time ? `• ${fol.time}` : ''}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Assigned: {fol.userName}</span>
                    </div>

                    {/* Quick Status Toggles */}
                    <div className="flex items-center gap-1">
                      {fol.status !== 'COMPLETED' && !fol.isCompleted && (
                        <button
                          onClick={() => updateFollowUpStatus(fol.id, 'COMPLETED')}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {fol.status !== 'CANCELLED' && (
                        <button
                          onClick={() => updateFollowUpStatus(fol.id, 'CANCELLED')}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
                          title="Cancel Task"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        <FollowUpTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </ModuleGuard>
  );
}
