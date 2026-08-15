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

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

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
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Solar Engineering Desk
          </span>
          <h1 className="text-4xl font-black tracking-tight">Contact nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Have questions regarding solar panel efficiency, DISCOM net metering, government subsidies, or industrial MW plant engineering?
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark">Get in Touch</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our engineering advisors and project managers at <strong className="text-brand-dark font-bold">nitish solar</strong> are ready to assist you.
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-brand-purple flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Office Location</h4>
                  <p className="text-slate-600 mt-0.5">{COMPANY_INFO.address}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Phone Lines</h4>
                  <p className="text-slate-600 mt-0.5">{COMPANY_INFO.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 text-brand-magenta flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Email Desk</h4>
                  <p className="text-slate-600 mt-0.5">{COMPANY_INFO.email}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Business Hours</h4>
                  <p className="text-slate-600 mt-0.5">{COMPANY_INFO.hours}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-slate-200 rounded-2xl h-48 border border-slate-300 flex items-center justify-center text-slate-500 text-xs font-semibold">
              <MapPin className="w-5 h-5 text-brand-purple mr-2" /> Interactive Map Location Placeholder
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader title="Send a Message to nitish solar" subtitle="Fills directly into our solar sales engineering queue." />
              <CardBody>
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark">Message Sent!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Thank you. An engineering representative from <strong className="text-brand-dark">nitish solar</strong> will respond shortly.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Deshmukh"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                        <input
                          type="text"
                          placeholder="e.g. Pune"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Message / Requirements</label>
                      <textarea
                        rows={4}
                        placeholder="Describe your property, roof size, or energy goal..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
                      />
                    </div>

                    <Button
                      variant="accent"
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold py-2.5 border-0"
                      size="lg"
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Message to nitish solar
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
