'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SiteSurvey } from '@/lib/types';
import { useSolarStore } from '@/lib/store-context';
import { ClipboardCheck, Compass, Zap, Sun, MapPin } from 'lucide-react';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyToEdit?: SiteSurvey | null;
}

export function SurveyModal({ isOpen, onClose, surveyToEdit }: SurveyModalProps) {
  const { addSiteSurvey, updateSiteSurvey, leads, customers } = useSolarStore();

  const [form, setForm] = useState({
    leadId: leads[0]?.id || '',
    customerId: customers[0]?.id || '',
    customerName: leads[0]?.fullName || 'Solar Prospect',
    surveyorName: 'Er. Sandeep Joshi',
    scheduledDate: new Date().toISOString().split('T')[0],
    siteAddress: 'Chromepet, Chennai',
    propertyType: 'COMMERCIAL',
    roofType: 'Terrace RCC',
    roofAreaSqFt: 1200,
    roofTiltAngle: 20,
    azimuthDirection: 'True South (180°)',
    shadingCondition: 'No Shading (0%)',
    discomConnection: 'MSEDCL LT 3-Phase 415V Connection',
    meterType: 'Bi-directional Net Meter',
    monthlyBillAmount: 18000,
    requiredCapacityKw: 10,
    recommendedCapacityKw: 10,
    status: 'COMPLETED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    notes: 'Site clear for 10kW N-type TOPCon module mounting.',
  });

  useEffect(() => {
    if (surveyToEdit) {
      setForm({
        leadId: surveyToEdit.leadId || '',
        customerId: surveyToEdit.customerId || '',
        customerName: surveyToEdit.customerName || 'Solar Client',
        surveyorName: surveyToEdit.surveyorName || 'Er. Sandeep Joshi',
        scheduledDate: surveyToEdit.scheduledDate ? surveyToEdit.scheduledDate.split('T')[0] : new Date().toISOString().split('T')[0],
        siteAddress: surveyToEdit.siteAddress || '',
        propertyType: surveyToEdit.propertyType || 'COMMERCIAL',
        roofType: surveyToEdit.roofType || 'Terrace RCC',
        roofAreaSqFt: surveyToEdit.roofAreaSqFt || 1200,
        roofTiltAngle: surveyToEdit.roofTiltAngle || 20,
        azimuthDirection: surveyToEdit.azimuthDirection || 'True South (180°)',
        shadingCondition: surveyToEdit.shadingCondition || 'No Shading (0%)',
        discomConnection: surveyToEdit.discomConnection || 'MSEDCL LT Connection',
        meterType: surveyToEdit.meterType || 'Bi-directional Net Meter',
        monthlyBillAmount: surveyToEdit.monthlyBillAmount || 18000,
        requiredCapacityKw: surveyToEdit.requiredCapacityKw || 10,
        recommendedCapacityKw: surveyToEdit.recommendedCapacityKw || 10,
        status: surveyToEdit.status,
        notes: surveyToEdit.notes || '',
      });
    }
  }, [surveyToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) return;

    if (surveyToEdit) {
      updateSiteSurvey(surveyToEdit.id, form);
    } else {
      addSiteSurvey(form);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-navy-900 font-bold">
          <ClipboardCheck className="w-5 h-5 text-brand-purple" />
          {surveyToEdit ? `Edit Site Survey — ${surveyToEdit.surveyNumber}` : 'Schedule Technical Site Survey'}
        </span>
      }
      subtitle="Record rooftop dimensions, shading conditions, DISCOM net metering specs, and recommended capacity."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer / Prospect Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Surveyor *</label>
            <input
              type="text"
              required
              placeholder="e.g. Er. Sandeep Joshi"
              value={form.surveyorName}
              onChange={(e) => setForm({ ...form, surveyorName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Survey Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property Category</label>
            <select
              value={form.propertyType}
              onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Survey Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Roof Mounting Type</label>
            <select
              value={form.roofType}
              onChange={(e) => setForm({ ...form, roofType: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none bg-white font-medium"
            >
              <option value="Terrace RCC">Terrace RCC Flat Roof</option>
              <option value="Metal Sheet Shed">Industrial Metal Sheet Shed</option>
              <option value="Tiled Roof">Slanted Tiled Roof</option>
              <option value="Ground Mount">Open Ground Mount</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Available Roof Area (Sq Ft)</label>
            <input
              type="number"
              value={form.roofAreaSqFt}
              onChange={(e) => setForm({ ...form, roofAreaSqFt: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none font-bold text-navy-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Azimuth / Orientation</label>
            <input
              type="text"
              placeholder="True South (180°)"
              value={form.azimuthDirection}
              onChange={(e) => setForm({ ...form, azimuthDirection: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shading Condition</label>
            <input
              type="text"
              placeholder="No Shading (0%)"
              value={form.shadingCondition}
              onChange={(e) => setForm({ ...form, shadingCondition: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">DISCOM & Connection Type</label>
            <input
              type="text"
              placeholder="MSEDCL LT 3-Phase Connection"
              value={form.discomConnection}
              onChange={(e) => setForm({ ...form, discomConnection: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommended System (kW)</label>
            <input
              type="number"
              value={form.recommendedCapacityKw}
              onChange={(e) => setForm({ ...form, recommendedCapacityKw: Number(e.target.value) })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none font-bold text-brand-purple"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Site Address Location</label>
          <input
            type="text"
            placeholder="Property location address..."
            value={form.siteAddress}
            onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Survey Notes & Technical Observations</label>
          <textarea
            rows={3}
            placeholder="Cable distance, rooftop access, shadow obstacles, structural framework requirements..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
            {surveyToEdit ? 'Save Survey Changes' : 'Save Site Survey'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
