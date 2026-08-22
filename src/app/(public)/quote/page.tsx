'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { useSolarStore } from '@/lib/store-context';
import { CheckCircle2, Send, Zap, ShieldCheck } from 'lucide-react';

export default function DedicatedQuotePage() {
  const { addLead } = useSolarStore();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    website_hp: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          phone: form.phone,
          email: form.email,
          location: form.location,
          propertyType: form.propertyType,
          requiredCapacity: form.requiredCapacity,
          monthlyBill: form.monthlyBill,
          message: form.message,
          website_hp: form.website_hp,
          source: 'nitish solar Dedicated Quote Page',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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
      } else {
        setErrorMessage(data.error || 'Something went wrong while sending your enquiry. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong while sending your enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Engineered Photovoltaic Quotation
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Request a Quote from nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            Receive a detailed solar sizing, government subsidy breakdown, payback horizon estimate, and free site survey.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-2xl border-slate-800/80 bg-[#131B2E] text-slate-100">
          <CardHeader
            title={<span className="text-white text-xl font-black flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Solar Lead & Technical Inquiry Form</span>}
            subtitle="Connects directly to nitish solar engineering pipeline."
          />
          <CardBody className="p-6 sm:p-8">
            {formSubmitted ? (
              <div className="text-center py-10 space-y-5">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Enquiry Received</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto font-light">
                  Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.
                </p>
                <div className="pt-2 flex justify-center">
                  <Button variant="accent" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" onClick={() => setFormSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Honeypot Field */}
                <input
                  type="text"
                  name="website_hp"
                  value={form.website_hp}
                  onChange={(e) => setForm({ ...form, website_hp: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {errorMessage && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anish Patel"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Company / Firm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Patel Logistics"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Jaipur"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
                    <select
                      value={form.propertyType}
                      onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-amber-400 font-medium"
                    >
                      <option value="RESIDENTIAL" className="bg-[#0B0F17]">Residential</option>
                      <option value="COMMERCIAL" className="bg-[#0B0F17]">Commercial</option>
                      <option value="INDUSTRIAL" className="bg-[#0B0F17]">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Required Capacity (kW)</label>
                    <input
                      type="number"
                      value={form.requiredCapacity}
                      onChange={(e) => setForm({ ...form, requiredCapacity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white outline-none font-bold font-mono text-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Monthly Bill (₹)</label>
                  <input
                    type="number"
                    value={form.monthlyBill}
                    onChange={(e) => setForm({ ...form, monthlyBill: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Additional Project Details</label>
                  <textarea
                    rows={4}
                    placeholder="Mention roof type, sanctioned load, battery storage, or specific DISCOM utility connection..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <Button
                  variant="accent"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 border-0 disabled:opacity-50"
                  size="lg"
                  icon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sending Enquiry...' : 'Submit Quote Request to nitish solar'}
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
