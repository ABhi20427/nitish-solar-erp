'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';
import { QuoteModal } from '@/components/public/quote-modal';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Zap } from 'lucide-react';

const NITISH_PROJECTS = [
  {
    id: 'p1',
    name: 'Greenway Textiles Industrial Solar Plant',
    category: 'INDUSTRIAL',
    capacity: '250 kWp',
    location: 'Ahmedabad, Gujarat',
    date: 'February 2025',
    status: 'Commissioned',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
    description: 'Turnkey industrial shed installation executed by nitish solar featuring 540W N-type TOPCon panels and 11kV grid synchronization.',
  },
  {
    id: 'p2',
    name: 'Apex Auto Components Manufacturing Unit',
    category: 'INDUSTRIAL',
    capacity: '350 kWp',
    location: 'MIDC Chakan, Pune',
    date: 'January 2025',
    status: 'Commissioned',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800',
    description: 'High-tension captive power plant delivering over 500,000 units of green energy annually to heavy manufacturing tools.',
  },
  {
    id: 'p3',
    name: 'City Lifeline Multispecialty Hospital',
    category: 'COMMERCIAL',
    capacity: '100 kWp',
    location: 'Jaipur, Rajasthan',
    date: 'February 2025',
    status: 'Under Execution',
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=800',
    description: 'Integrated hybrid solar rooftop by nitish solar with 150kWh LiFePO4 battery energy storage for critical hospital backup.',
  },
  {
    id: 'p4',
    name: 'St. Xavier School Campus Solar Drive',
    category: 'COMMERCIAL',
    capacity: '120 kWp',
    location: 'Bengaluru, Karnataka',
    date: 'December 2024',
    status: 'Commissioned',
    image: 'https://images.unsplash.com/photo-1558441719-443b38605AD4?auto=format&fit=crop&q=80&w=800',
    description: 'Rooftop solar installation across academic blocks reducing campus electricity bills by 85%.',
  },
  {
    id: 'p5',
    name: 'Sunrise Villa Residential Rooftop',
    category: 'RESIDENTIAL',
    capacity: '8 kWp',
    location: 'Koregaon Park, Pune',
    date: 'February 2025',
    status: 'Commissioned',
    image: 'https://images.unsplash.com/photo-1548611716-3001815195e3?auto=format&fit=crop&q=80&w=800',
    description: 'Elevated galvanized structure rooftop installed by nitish solar under national PM Surya Ghar scheme.',
  },
];

export default function ProjectsShowcasePage() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const filtered = NITISH_PROJECTS.filter((p) =>
    filter === 'ALL' ? true : p.category === filter
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-dark">
      <PublicNavbar onOpenQuoteModal={() => setIsQuoteOpen(true)} />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purplelight">
            Engineering Excellence Portfolio
          </span>
          <h1 className="text-4xl font-black tracking-tight">Solar Projects by nitish solar</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Explore completed residential, commercial, and industrial solar installations executed across India.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex justify-center gap-2">
          {['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === cat
                  ? 'bg-brand-dark text-white shadow'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Projects' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((proj) => (
            <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
              <div>
                <img src={proj.image} alt={proj.name} className="w-full h-52 object-cover" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-brand-purple bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {proj.category}
                    </span>
                    <span className="font-bold text-brand-dark flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> {proj.capacity}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-dark leading-tight">{proj.name}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-purple" /> {proj.location}</span>
                <span className="font-bold text-emerald-700">{proj.status}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
