'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Priority, FollowUpType, FollowUpStatus } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { Bell, Calendar, Clock, User, Phone, Mail } from 'lucide-react';

interface FollowUpTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FollowUpTaskModal({ isOpen, onClose }: FollowUpTaskModalProps) {
  const { leads, customers, users, addFollowUp, currentUser } = useSolarStore();

  const [contactType, setContactType] = useState<'lead' | 'customer'>('lead');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  const [assignedUserId, setAssignedUserId] = useState<string>(currentUser.id);
  const [title, setTitle] = useState('Proposal Review & Technical Call');
  const [type, setType] = useState<FollowUpType>('Call');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('11:30 AM');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<FollowUpStatus>('PENDING');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const matchedLead = leads.find((l) => l.id === selectedLeadId);
    const matchedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const matchedUser = users.find((u) => u.id === assignedUserId);

    addFollowUp({
      leadId: contactType === 'lead' ? matchedLead?.id : undefined,
      leadName: contactType === 'lead' ? matchedLead?.fullName : undefined,
      customerId: contactType === 'customer' ? matchedCustomer?.id : undefined,
      customerName: contactType === 'customer' ? matchedCustomer?.fullName : undefined,
      userId: matchedUser?.id || currentUser.id,
      userName: matchedUser?.name || currentUser.name,
      title,
      type,
      dueDate,
      time,
      priority,
      status,
      notes: notes || `Follow-up scheduled for ${matchedLead?.fullName || matchedCustomer?.fullName || 'Client'}`,
      isCompleted: status === 'COMPLETED',
    });

    onClose();
  };

  const TYPES: FollowUpType[] = ['Call', 'Meeting', 'Site Visit', 'Email', 'WhatsApp', 'Other'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <Bell className="w-5 h-5 text-brand-purple" /> Schedule New Follow-up Activity
        </span>
      }
      subtitle="Set callback, site survey visit, or technical proposal review task for lead or customer."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setContactType('lead')}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              contactType === 'lead' ? 'bg-navy-950 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Select Lead Prospect
          </button>
          <button
            type="button"
            onClick={() => setContactType('customer')}
            className={`py-1.5 rounded-lg font-bold transition-all ${
              contactType === 'customer' ? 'bg-navy-950 text-white shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Select Customer Account
          </button>
        </div>

        {contactType === 'lead' ? (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Lead Prospect *</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.proposedCapacityKw || 10} kW) — {l.leadNumber}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Customer Account *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerType}) — {c.customerNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Task Title / Subject *</label>
          <input
            type="text"
            required
            placeholder="e.g. Technical Site Visit & Net Metering Clarification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Schedule Time</label>
            <input
              type="text"
              placeholder="11:30 AM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Executive</label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Agenda & Activity Notes</label>
          <textarea
            rows={3}
            placeholder="Key discussion points, technical queries, or call summary..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            Schedule Follow-up
          </Button>
        </div>
      </form>
    </Modal>
  );
}
