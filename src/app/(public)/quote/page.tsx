'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { useSolarStore } from '@/lib/store-context';
import { CheckCircle2, Send, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DedicatedQuotePage() {
  const { addLead } = useSolarStore();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    location: '',
    propertyType: 'RESIDENTIAL' as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL',
    requiredCapacity: 10,
    monthlyBill: 15000,
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    addLead({
      fullName: form.name,
      companyName: form.company,
      phone: form.phone,
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerType: form.propertyType,
      monthlyBillAmount: Number(form.monthlyBill),
      city: form.location || 'Pune',
      state: 'Maharashtra',
      address: 'Web Quote Form Inquiry',
      proposedCapacityKw: Number(form.requiredCapacity),
      notes: form.message || `Dedicated quote request submitted for a ${form.requiredCapacity} kW system`,
      source: 'nitish solar Dedicated Quote Page',
      priority: 'HIGH',
    });

    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Engineered Photovoltaic Quotation
          </span>
          <h1 className="text-4xl font-black tracking-tight">Request a Quote from nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Receive a detailed solar sizing, government subsidy breakdown, payback horizon estimate, and free site survey.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-2xl border-slate-200">
          <CardHeader
            title={<span className="text-brand-dark text-xl font-black flex items-center gap-2"><Zap className="w-5 h-5 text-brand-purple" /> Solar Lead & Technical Inquiry Form</span>}
            subtitle="Connects directly to nitish solar engineering pipeline."
          />
          <CardBody className="p-6 sm:p-8">
            {formSubmitted ? (
              <div className="text-center py-10 space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark">Quote Request Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you, <strong className="text-brand-dark">{form.name}</strong>. A solar engineer from <strong className="text-brand-dark font-bold">nitish solar</strong> will call you within 24 hours to schedule your site assessment.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                  <Link href="/erp/leads">
                    <Button variant="accent" className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold">
                      View Lead in nitish solar ERP
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anish Patel"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel Logistics"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Jaipur"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                    <select
                      value={form.propertyType}
                      onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none bg-white font-medium"
                    >
                      <option value="RESIDENTIAL">Residential</option>
                      <option value="COMMERCIAL">Commercial</option>
                      <option value="INDUSTRIAL">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Required Capacity (kW)</label>
                    <input
                      type="number"
                      value={form.requiredCapacity}
                      onChange={(e) => setForm({ ...form, requiredCapacity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none font-bold text-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Bill (₹)</label>
                  <input
                    type="number"
                    value={form.monthlyBill}
                    onChange={(e) => setForm({ ...form, monthlyBill: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional Project Details</label>
                  <textarea
                    rows={4}
                    placeholder="Mention roof type, sanctioned load, battery storage, or specific DISCOM utility connection..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                  />
                </div>

                <Button
                  variant="accent"
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold py-3 border-0 shadow-brand"
                  size="lg"
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Quote Request to nitish solar
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
