import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/public/brand-logo';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY_INFO } from '@/config/site';

export function PublicFooter() {
  return (
    <footer className="bg-[#070A10] text-slate-300 border-t border-slate-800/80 snap-natural">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <BrandLogo variant="light" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-light">
              nitish solar provides engineering-driven rooftop and ground-mounted photovoltaic solar energy solutions for residential homes, commercial enterprises, and heavy industrial facilities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400/80" />
              <span>Engineering Quality & Solar Standards Certified</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About nitish solar</Link></li>
              <li><Link href="/solutions" className="hover:text-amber-400 transition-colors">Solar Solutions</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">Products Catalog</Link></li>
              <li><Link href="/projects" className="hover:text-amber-400 transition-colors">Project Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/calculator" className="hover:text-amber-400 transition-colors">Solar Calculator</Link></li>
              <li><Link href="/quote" className="hover:text-amber-400 transition-colors text-amber-400 font-semibold">Request a Quote</Link></li>
              <li><Link href="/residential" className="hover:text-amber-400 transition-colors">Residential Solar</Link></li>
              <li><Link href="/commercial" className="hover:text-amber-400 transition-colors">Commercial Solar</Link></li>
              <li><Link href="/industrial" className="hover:text-amber-400 transition-colors">Industrial Solar</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Contact Desk</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-light">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{COMPANY_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© nitish solar. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>DISCOM Grid Net-Metering Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
