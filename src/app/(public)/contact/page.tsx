'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Navigation } from 'lucide-react';
import { useSolarStore } from '@/lib/store-context';
import { COMPANY_INFO } from '@/config/site';

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Office Location', value: COMPANY_INFO.address },
  { icon: Phone, label: 'Phone Lines', value: COMPANY_INFO.phone },
  { icon: Mail, label: 'Email Desk', value: COMPANY_INFO.email },
  { icon: Clock, label: 'Business Hours', value: COMPANY_INFO.hours },
];

const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.address)}`;

export default function ContactPage() {
  const { addLead } = useSolarStore();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
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
          phone: form.phone,
          email: form.email,
          city: form.city,
          message: form.message,
          website_hp: form.website_hp,
          source: 'nitish solar Contact Page',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addLead({
          fullName: form.name,
          phone: form.phone,
          email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          city: form.city || 'Pune',
          state: 'Maharashtra',
          address: 'Contact Inquiry Address',
          customerType: 'RESIDENTIAL',
          monthlyBillAmount: 10000,
          notes: form.message || 'General contact page message submitted to nitish solar',
          source: 'nitish solar Contact Page',
          priority: 'MEDIUM',
        });
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "We couldn't send your enquiry. Please try again.");
      }
    } catch (err) {
      setErrorMessage("We couldn't send your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-sans antialiased">
      <PublicNavbar transparentOverlay onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* HERO — same cinematic full-bleed treatment as the rest of the site,
          compact height since this is a utility page rather than a story page. */}
      <section className="relative w-full min-h-[48vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="nitish solar engineering desk"
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
              <span>Solar Engineering Desk</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              Let's talk about <span className="text-amber-400">your solar project.</span>
            </h1>
            <p className="text-base text-white/75 font-light leading-relaxed max-w-xl">
              Questions on panel efficiency, DISCOM net metering, government subsidies, or industrial MW plant engineering? Our advisors are ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main — same engineering-blueprint atmosphere used across the
          homepage's editorial, calculator, and closing sections. */}
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
          <div className="absolute left-[6%] top-1/4 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-amber-500/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400">Get in Touch</span>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">Reach Our Engineering Team</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  Our engineering advisors and project managers at <span className="text-white font-medium">nitish solar</span> are ready to assist you.
                </p>
              </div>

              <div className="space-y-3">
                {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="group flex items-start gap-3.5 rounded-xl border border-slate-800/70 bg-[#131B2E] p-4 transition-colors duration-300 hover:border-amber-400/30"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0B0F17] text-amber-400 flex items-center justify-center shrink-0 border border-slate-800 transition-colors duration-300 group-hover:border-amber-400/30">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</h4>
                      <p className="text-sm text-white font-light mt-1 leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office Location card — blueprint texture + pulsing map pin,
                  replaces the old flat "Interactive Map Placeholder" box. */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#131B2E] p-6">
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                <div className="relative flex flex-col items-center text-center gap-3 py-4">
                  <span className="relative flex items-center justify-center w-11 h-11">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/30 animate-ping" />
                    <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0B0F17] border border-amber-400/40 text-amber-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                  </span>
                  <p className="text-xs text-slate-300 font-light max-w-xs leading-relaxed">{COMPANY_INFO.address}</p>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#131B2E] rounded-3xl border border-slate-800/70 shadow-xl shadow-black/30 p-8 sm:p-10">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white">Enquiry Received</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                      Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.
                    </p>
                    <Button
                      variant="outline"
                      className="!bg-slate-900/60 !text-slate-300 !border-slate-700 hover:!text-white"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-7 space-y-1">
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight">Send a Message to nitish solar</h3>
                      <p className="text-xs text-slate-400 font-light">Routes directly into our solar sales engineering queue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                      {/* Honeypot Spam Prevention Field */}
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
                          <label className="block font-semibold text-slate-300 mb-1.5">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Deshmukh"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1.5">City / Region</label>
                          <input
                            type="text"
                            placeholder="e.g. Pune"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1.5">Message / Requirements</label>
                        <textarea
                          rows={4}
                          placeholder="Describe your property, roof size, or energy goal..."
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
                        {isSubmitting ? 'Sending Enquiry...' : 'Send Message to nitish solar'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
