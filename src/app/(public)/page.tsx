'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { calculateSolarSystem } from '@/lib/solar-calc';
import { useSolarStore } from '@/lib/store-context';
import {
  Sun,
  Zap,
  Building2,
  Factory,
  Home as HomeIcon,
  ShieldCheck,
  Award,
  TrendingUp,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Check,
  Send,
  Cpu,
  Battery,
  Wrench,
  Activity,
  Compass,
} from 'lucide-react';

// Structured Trust Indicators Placeholder Variables
const TRUST_INDICATORS = {
  projectsDelivered: '1,250+',
  installedCapacity: '450+ MWp',
  customersServed: '3,800+',
  yearsOfExperience: '12+ Years',
};

export default function HomePage() {
  const { addLead } = useSolarStore();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quickBill, setQuickBill] = useState(15000);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Quote Form State
  const [leadForm, setLeadForm] = useState({
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

  const quickCalc = calculateSolarSystem({ monthlyBillAmount: quickBill });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    addLead({
      fullName: leadForm.name,
      companyName: leadForm.company,
      phone: leadForm.phone,
      email: leadForm.email || `${leadForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerType: leadForm.propertyType,
      monthlyBillAmount: Number(leadForm.monthlyBill),
      city: leadForm.location || 'Pune',
      state: 'Maharashtra',
      address: 'Web Inquiry Location',
      proposedCapacityKw: Number(leadForm.requiredCapacity) || quickCalc.recommendedCapacityKw,
      notes: leadForm.message || `Lead request submitted to nitish solar website form.`,
      source: 'nitish solar Homepage Form',
      priority: 'HIGH',
    });

    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white overflow-hidden py-20 lg:py-28">
        {/* Subtle Brand Background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#7C3AED_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-brand-purplelight text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-brand-magenta" />
                <span>Next-Generation Clean Energy Infrastructure</span>
              </div>

              {/* Exact Hero Headline Direction */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Powering a Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purplelight via-brand-bluelight to-brand-magentalight">Cleaner Future</span>
              </h1>

              {/* Exact Supporting Direction */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                <strong className="text-white font-bold">nitish solar</strong> provides reliable solar solutions for homes, businesses and industrial applications with engineering-driven precision and Tier-1 components.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/quote">
                  <Button
                    variant="accent"
                    size="lg"
                    className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold hover:opacity-95 border-0 shadow-brand"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Request a Quote
                  </Button>
                </Link>
                <Link href="/solutions">
                  <Button variant="outline" size="lg" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                    Explore Solutions
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/80">
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-brand-purplelight">{TRUST_INDICATORS.projectsDelivered}</span>
                  <span className="text-xs text-slate-400 font-medium">Projects Delivered</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-white">{TRUST_INDICATORS.installedCapacity}</span>
                  <span className="text-xs text-slate-400 font-medium">Installed Capacity</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-brand-bluelight">{TRUST_INDICATORS.customersServed}</span>
                  <span className="text-xs text-slate-400 font-medium">Customers Served</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-amber-400">{TRUST_INDICATORS.yearsOfExperience}</span>
                  <span className="text-xs text-slate-400 font-medium">Years of Experience</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 bg-white text-brand-dark rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Instant System Sizer
              </div>

              <h3 className="text-xl font-black tracking-tight text-brand-dark flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-purple" /> Calculate Solar Savings
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Slide your current monthly electric bill to estimate system sizing for <strong className="text-slate-800">nitish solar</strong> installation.
              </p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold mb-2">
                    <span className="text-slate-700">Monthly Bill Amount</span>
                    <span className="text-lg font-bold text-brand-purple">₹{quickBill.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={3000}
                    max={150000}
                    step={1000}
                    value={quickBill}
                    onChange={(e) => setQuickBill(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Recommended Capacity:</span>
                    <span className="text-lg font-black text-brand-dark">{quickCalc.recommendedCapacityKw} kWp</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Est. Annual Savings:</span>
                    <span className="text-lg font-black text-emerald-600">₹{quickCalc.annualSavingsEst.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Est. Subsidy / Benefit:</span>
                    <span className="text-sm font-bold text-brand-purple">₹{quickCalc.subsidyEstimate.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payback Horizon:</span>
                    <span className="text-sm font-bold text-brand-dark">{quickCalc.paybackPeriodYears} Years</span>
                  </div>
                </div>

                <Button
                  variant="accent"
                  className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
                  size="lg"
                  onClick={() => setIsQuoteOpen(true)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Detailed Proposal from nitish solar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple bg-purple-50 px-3.5 py-1 rounded-full border border-purple-200">
              Solar Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
              Turnkey Energy Systems Engineered by nitish solar
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Explore customized solar installations designed for optimum efficiency, safety, and long-term financial yield.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Residential */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-brand-purple hover:shadow-xl transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-brand-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HomeIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark">Residential Solar</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Rooftop solar solutions for homes and residential properties. Enjoy maximum energy savings with custom system design, seamless installation, and mobile app monitoring.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> PM Surya Ghar subsidy support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Net metering meter setup</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 25 Years panel warranty</li>
                </ul>
              </div>
              <div className="pt-6">
                <Link href="/residential">
                  <Button variant="accent" className="w-full bg-brand-dark text-white font-bold hover:bg-slate-900" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Residential Solar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Commercial */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-brand-blue hover:shadow-xl transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark">Commercial Solar</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Engineered for offices, shops, hotels, schools, warehouses, and commercial buildings. Cut operational power overheads significantly.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 40% Accelerated tax depreciation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Customized ballast framework</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> High return on investment</li>
                </ul>
              </div>
              <div className="pt-6">
                <Link href="/commercial">
                  <Button variant="accent" className="w-full bg-brand-dark text-white font-bold hover:bg-slate-900" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Commercial Solar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Industrial */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-brand-magenta hover:shadow-xl transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 text-brand-magenta flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Factory className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark">Industrial Solar</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  For factories, manufacturing facilities, industrial sites, warehouses, and large-scale MW utility installations.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Bifacial high-wattage modules</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 11kV / 33kV HT synchronization</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Continuous power generation</li>
                </ul>
              </div>
              <div className="pt-6">
                <Link href="/industrial">
                  <Button variant="accent" className="w-full bg-brand-dark text-white font-bold hover:bg-slate-900" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Industrial Solar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Overview Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">Tier-1 Certified Solar Components</span>
              <h2 className="text-3xl font-black text-brand-dark tracking-tight mt-1">Products Supplied by nitish solar</h2>
            </div>
            <Link href="/products" className="mt-4 md:mt-0">
              <Button variant="outline" className="border-slate-300 text-brand-dark font-bold" icon={<ArrowRight className="w-4 h-4" />}>
                View Product Catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Solar Panels', desc: 'Mono PERC & N-Type TOPCon bifacial panels with 25-30 year linear warranty.', icon: Sun },
              { title: 'Inverters', desc: 'Three-phase grid-tie and hybrid string inverters with IP65 waterproofing.', icon: Cpu },
              { title: 'Mounting Structures', desc: 'Hot-dip galvanized steel frames rated for 170 km/h wind loads.', icon: Wrench },
              { title: 'Energy Storage', desc: 'LiFePO4 lithium battery energy storage systems with 6000+ cycle life.', icon: Battery },
              { title: 'Monitoring Systems', desc: 'IoT smart gateways and telemetry for real-time solar generation tracking.', icon: Activity },
              { title: 'Solar Accessories', desc: 'UV-resistant DC cabling, chemical earthing kits, and ACDB/DCDB protection boxes.', icon: ShieldCheck },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-brand-purple flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-brand-dark text-base">{p.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  <Link href="/products" className="text-xs font-bold text-brand-purple hover:text-brand-blue inline-flex items-center gap-1 pt-1">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why nitish solar Section */}
      <section className="py-20 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">The Solar Engineering Advantage</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Choose nitish solar?
            </h2>
            <p className="text-slate-300 text-sm">
              We deliver end-to-end solar solutions engineered for long-term power security and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Engineering-Driven Solutions', desc: 'Custom structural and electrical engineering tailored to exact site conditions.' },
              { title: 'Quality Components', desc: 'Strict procurement of Tier-1 solar modules, inverters, and galvanized frames.' },
              { title: 'Professional Installation', desc: 'Certified field engineers and safety-cleared installation supervisors.' },
              { title: 'System Monitoring', desc: '24/7 cloud monitoring app to track solar generation and fault diagnostics.' },
              { title: 'Long-Term Reliability', desc: '30-year linear power guarantee backed by dedicated technical support.' },
              { title: 'Customer Focus', desc: 'End-to-end assistance with DISCOM approvals, net metering, and rebates.' },
            ].map((reason) => (
              <div key={reason.title} className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-white">{reason.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (01 - 07 Visual Stages) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">Streamlined Execution</span>
            <h2 className="text-3xl font-black text-brand-dark tracking-tight">How nitish solar Works</h2>
            <p className="text-slate-600 text-sm">A transparent step-by-step journey from initial consultation to continuous solar power monitoring.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {[
              { step: '01', title: 'Consultation' },
              { step: '02', title: 'Site Survey' },
              { step: '03', title: 'System Design' },
              { step: '04', title: 'Quotation' },
              { step: '05', title: 'Installation' },
              { step: '06', title: 'Commissioning' },
              { step: '07', title: 'Monitoring' },
            ].map((st, idx) => (
              <div key={st.step} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2 relative">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-blue block">
                  {st.step}
                </span>
                <h4 className="font-bold text-brand-dark text-xs">{st.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request a Quote Lead Generation Form */}
      <section id="quote-form" className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-950 border-slate-800 text-white">
            <CardHeader
              title={<span className="text-white text-xl font-black">Request a Quote from nitish solar</span>}
              subtitle="Fill out the form below to receive a customized technical proposal."
            />
            <CardBody className="p-6 sm:p-8">
              {formSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Quote Request Submitted!</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Thank you. An engineering consultant from <strong className="text-white">nitish solar</strong> will reach out shortly to conduct your site survey.
                  </p>
                  <Button variant="outline" className="border-slate-700 text-slate-200" onClick={() => setFormSubmitted(false)}>
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikram Sharma"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma Industries"
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-purple"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Property Type</label>
                      <select
                        value={leadForm.propertyType}
                        onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      >
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="INDUSTRIAL">Industrial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Required Capacity (kW)</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={leadForm.requiredCapacity}
                        onChange={(e) => setLeadForm({ ...leadForm, requiredCapacity: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold text-brand-purplelight"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Monthly Bill (₹)</label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={leadForm.monthlyBill}
                        onChange={(e) => setLeadForm({ ...leadForm, monthlyBill: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Project Message & Location</label>
                    <textarea
                      rows={3}
                      placeholder="City, roof area, or specific energy objectives..."
                      value={leadForm.message}
                      onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>

                  <Button
                    variant="accent"
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-magenta text-white font-bold py-3 border-0"
                    size="lg"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Submit Quote Request to nitish solar
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
