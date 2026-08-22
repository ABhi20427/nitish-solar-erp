'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useSolarStore } from '@/lib/store-context';
import { COMPANY_INFO } from '@/config/site';

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
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-[#070A10] text-white py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Solar Engineering Desk
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white">Contact nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm font-light">
            Have questions regarding solar panel efficiency, DISCOM net metering, government subsidies, or industrial MW plant engineering?
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Our engineering advisors and project managers at <strong className="text-white font-semibold">nitish solar</strong> are ready to assist you.
            </p>

            <div className="space-y-4 text-xs font-light">
              <div className="bg-[#131B2E] rounded-xl p-4 border border-slate-800/80 shadow-md flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Office Location</h4>
                  <p className="text-slate-300 mt-0.5">{COMPANY_INFO.address}</p>
                </div>
              </div>

              <div className="bg-[#131B2E] rounded-xl p-4 border border-slate-800/80 shadow-md flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Phone Lines</h4>
                  <p className="text-slate-300 mt-0.5">{COMPANY_INFO.phone}</p>
                </div>
              </div>

              <div className="bg-[#131B2E] rounded-xl p-4 border border-slate-800/80 shadow-md flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Email Desk</h4>
                  <p className="text-slate-300 mt-0.5">{COMPANY_INFO.email}</p>
                </div>
              </div>

              <div className="bg-[#131B2E] rounded-xl p-4 border border-slate-800/80 shadow-md flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 border border-slate-800">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Business Hours</h4>
                  <p className="text-slate-300 mt-0.5">{COMPANY_INFO.hours}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-[#131B2E] rounded-2xl h-48 border border-slate-800/80 flex items-center justify-center text-slate-400 text-xs font-mono font-semibold">
              <MapPin className="w-5 h-5 text-amber-400 mr-2" /> Interactive Map Location Placeholder
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card className="bg-[#131B2E] border-slate-800/80 text-slate-100 shadow-xl">
              <CardHeader title="Send a Message to nitish solar" subtitle="Fills directly into our solar sales engineering queue." />
              <CardBody>
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Enquiry Received</h3>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto font-light">
                      Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.
                    </p>
                    <Button variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
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
                        <label className="block font-semibold text-slate-300 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Deshmukh"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">City / Region</label>
                        <input
                          type="text"
                          placeholder="e.g. Pune"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Message / Requirements</label>
                      <textarea
                        rows={4}
                        placeholder="Describe your property, roof size, or energy goal..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>

                    <Button
                      variant="accent"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 border-0 disabled:opacity-50"
                      size="lg"
                      icon={<Send className="w-4 h-4" />}
                    >
                      {isSubmitting ? 'Sending Enquiry...' : 'Send Message to nitish solar'}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
