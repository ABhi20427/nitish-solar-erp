'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { Button } from '@/components/ui/button';
import { useSolarStore } from '@/lib/store-context';
import { CheckCircle2, Send, Zap } from 'lucide-react';

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

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMessage('Please enter a valid email address to receive your solar proposal PDF.');
      return;
    }

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
          email: form.email,
          customerType: form.propertyType,
          monthlyBillAmount: Number(form.monthlyBill),
          city: form.location || 'Chennai',
          state: 'Tamil Nadu',
          address: 'Web Quote Form Inquiry',
          proposedCapacityKw: Number(form.requiredCapacity),
          notes: form.message || `Dedicated quote request submitted for a ${form.requiredCapacity} kW system`,
          source: 'nitish solar Dedicated Quote Page',
          priority: 'HIGH',
        });
        setFormSubmitted({ quotNo: data.quotNo, pdfBase64: data.pdfBase64, email: form.email, name: form.name });
      } else {
        setErrorMessage(data.error || "We couldn't send your proposal. Please verify your email address and try again.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the proposal server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay />

      {/* HERO — same cinematic full-bleed treatment as the rest of the site,
          compact height since this is a utility/form page. */}
      <section className="relative w-full min-h-[46vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sunset.png"
            alt="nitish solar engineered photovoltaic quotation"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-14 pt-32">
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2.5 text-white/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="w-4 h-px bg-amber-400" />
              <span>Engineered Photovoltaic Quotation</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              Request a Quote from <span className="text-amber-400">nitish solar.</span>
            </h1>
            <p className="text-base text-white/75 font-light leading-relaxed max-w-xl">
              Receive a detailed solar sizing, government subsidy breakdown, payback horizon estimate, and free site survey.
            </p>
          </div>
        </div>
      </section>

      {/* Main — same engineering-blueprint atmosphere used across the site. */}
      <main className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute right-[10%] top-1/3 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-[#131B2E] rounded-3xl border border-slate-800/70 shadow-xl shadow-black/30 p-8 sm:p-10">
            {formSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-white">Enquiry Received</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                  Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.
                </p>
                <div className="pt-2 flex justify-center">
                  <Button
                    variant="accent"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-7 space-y-1">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-400" /> Solar Lead & Technical Inquiry Form
                  </h3>
                  <p className="text-xs text-slate-400 font-light">Connects directly to the nitish solar engineering pipeline.</p>
                </div>

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
                      <label className="block font-semibold text-slate-300 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anish Patel"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Company / Firm Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Patel Logistics"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">City / Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai, Pune"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Property Type</label>
                      <select
                        value={form.propertyType}
                        onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white outline-none focus:border-amber-400 transition-colors font-medium"
                      >
                        <option value="RESIDENTIAL" className="bg-[#0B0F17]">Residential</option>
                        <option value="COMMERCIAL" className="bg-[#0B0F17]">Commercial</option>
                        <option value="INDUSTRIAL" className="bg-[#0B0F17]">Industrial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">Required Capacity (kW)</label>
                      <input
                        type="number"
                        value={form.requiredCapacity}
                        onChange={(e) => setForm({ ...form, requiredCapacity: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-amber-400 font-semibold tabular-nums outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Monthly Bill (₹)</label>
                    <input
                      type="number"
                      value={form.monthlyBill}
                      onChange={(e) => setForm({ ...form, monthlyBill: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Additional Project Details</label>
                    <textarea
                      rows={4}
                      placeholder="Mention roof type, sanctioned load, battery storage, or specific DISCOM utility connection..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <Button
                    variant="accent"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 border-0 disabled:opacity-50 hover:scale-[1.01] transition-all"
                    size="lg"
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Sending Enquiry...' : 'Submit Quote Request to nitish solar'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
