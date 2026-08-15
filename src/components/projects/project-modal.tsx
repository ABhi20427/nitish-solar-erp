'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Project, ProjectStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Wrench, User, MapPin, Zap, DollarSign } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export function ProjectModal({ isOpen, onClose, projectToEdit }: ProjectModalProps) {
  const { addProject, updateProject, customers, users } = useSolarStore();

  const [form, setForm] = useState({
    customerName: customers[0]?.fullName || 'Solar Client',
    customerId: customers[0]?.id || 'cust-1',
    projectManagerName: 'Priya Iyer',
    electricalEngineerName: 'Anil Mehta',
    installerLeadName: 'Vikram Singh',
    systemSizeKw: 10,
    siteAddress: 'MIDC Industrial Estate, Chakan',
    city: 'Pune',
    projectValue: 450000,
    status: 'PLANNING' as ProjectStatus,
  });

  useEffect(() => {
    if (projectToEdit) {
      setForm({
        customerName: projectToEdit.customerName,
        customerId: projectToEdit.customerId,
        projectManagerName: projectToEdit.projectManagerName || 'Priya Iyer',
        electricalEngineerName: projectToEdit.electricalEngineerName || 'Anil Mehta',
        installerLeadName: projectToEdit.installerLeadName || 'Vikram Singh',
        systemSizeKw: projectToEdit.systemSizeKw || 10,
        siteAddress: projectToEdit.siteAddress || '',
        city: projectToEdit.city || 'Pune',
        projectValue: projectToEdit.projectValue || 450000,
        status: projectToEdit.status,
      });
    }
  }, [projectToEdit, isOpen, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) return;

    if (projectToEdit) {
      updateProject(projectToEdit.id, form);
    } else {
      addProject(form);
    }

    onClose();
  };

  const STATUSES: { id: ProjectStatus; label: string }[] = [
    { id: 'PLANNING', label: 'Planning' },
    { id: 'SITE_SURVEY', label: 'Site Survey' },
    { id: 'DESIGN', label: 'Engineering Design' },
    { id: 'PROCUREMENT', label: 'Procurement' },
    { id: 'INSTALLATION', label: 'Rooftop Installation' },
    { id: 'TESTING', label: 'Testing' },
    { id: 'COMMISSIONING', label: 'Commissioning' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'ON_HOLD', label: 'On Hold' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Wrench className="w-5 h-5 text-brand-purple" />
          {projectToEdit ? `Edit Project — ${projectToEdit.projectNumber}` : 'Initialize Solar Power Project'}
        </span>
      }
      subtitle="Configure project team, system size, site location, and engineering status."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Account *</label>
            <select
              value={form.customerId}
              onChange={(e) => {
                const matched = customers.find((c) => c.id === e.target.value);
                setForm({
                  ...form,
                  customerId: e.target.value,
                  customerName: matched ? matched.fullName : form.customerName,
                });
              }}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerType}) — {c.customerNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Manager *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Iyer"
              value={form.projectManagerName}
              onChange={(e) => setForm({ ...form, projectManagerName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Size (kW)</label>
            <input
              type="number"
              min={1}
              value={form.systemSizeKw}
              onChange={(e) => setForm({ ...form, systemSizeKw: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-brand-purple"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Contract Value (₹)</label>
            <input
              type="number"
              value={form.projectValue}
              onChange={(e) => setForm({ ...form, projectValue: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Stage Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Electrical Lead Engineer</label>
            <input
              type="text"
              value={form.electricalEngineerName}
              onChange={(e) => setForm({ ...form, electricalEngineerName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Installation Lead Supervisor</label>
            <input
              type="text"
              value={form.installerLeadName}
              onChange={(e) => setForm({ ...form, installerLeadName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Site Location Address</label>
            <input
              type="text"
              placeholder="Installation address..."
              value={form.siteAddress}
              onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {projectToEdit ? 'Save Changes' : 'Initialize Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
