'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerModal } from '@/components/customers/customer-modal';
import { Customer } from '@/lib/types';
import { UserCheck, UserPlus, Search, ArrowUpRight, Building2, Phone, Mail, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomersPage() {
  const { customers } = useSolarStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.gstNumber && c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;
      const matchesPayment = paymentFilter === 'ALL' || c.paymentStatus === paymentFilter;

      return matchesSearch && matchesType && matchesPayment;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dA = new Date(a.createdAt).getTime();
        const dB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dB - dA : dA - dB;
      }
      if (sortBy === 'value') {
        const vA = a.totalProjectValue || 450000;
        const vB = b.totalProjectValue || 450000;
        return sortOrder === 'desc' ? vB - vA : vA - vB;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' ? b.fullName.localeCompare(a.fullName) : a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">PARTIALLY PAID</span>;
      case 'OVERDUE':
        return <span className="bg-rose-100 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">OVERDUE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full text-[10px]">PENDING</span>;
    }
  };

  return (
    <ModuleGuard module="customers" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-brand-purple" /> Customer Accounts Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active commercial, industrial, & residential solar account records.
            </p>
          </div>

          <Button
            variant="accent"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Create New Customer
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardBody className="p-4 space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer by name, ID (e.g. CUST-2025-001), phone, GST, or company..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-purple/40"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium outline-none"
                >
                  <option value="date">Date Created</option>
                  <option value="value">Project Value (₹)</option>
                  <option value="name">Customer Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50"
                  title="Toggle Ascending / Descending"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Category Filter</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Categories ({customers.length})</option>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Payment Status Filter</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Customer Table View */}
        <Card className="border-slate-200">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3.5">Customer ID & Name</th>
                    <th className="p-3.5">Category & GST</th>
                    <th className="p-3.5">Sanctioned Load</th>
                    <th className="p-3.5">Total Project Value</th>
                    <th className="p-3.5">Assigned Exec</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No customer accounts match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <Link href={`/erp/customers/${cust.id}`} className="font-bold text-navy-900 hover:text-brand-purple transition-colors flex items-center gap-1">
                            {cust.fullName} <ArrowUpRight className="w-3 h-3 text-slate-400" />
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-mono">{cust.customerNumber} • {cust.phone}</span>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="purple">{cust.customerType}</Badge>
                          {cust.gstNumber && <span className="text-[9px] text-slate-500 font-mono block mt-0.5">GST: {cust.gstNumber}</span>}
                        </td>
                        <td className="p-3.5 font-bold text-navy-900">
                          {cust.sanctionedLoadKw || 10} kW
                        </td>
                        <td className="p-3.5 font-black text-emerald-700">
                          ₹{(cust.totalProjectValue || 450000).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium">
                          {cust.assignedToName || 'Siddharth Patel'}
                        </td>
                        <td className="p-3.5">
                          {getPaymentBadge(cust.paymentStatus)}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link href={`/erp/customers/${cust.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Account
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <strong className="text-navy-900">{filteredCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
                <strong className="text-navy-900">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</strong> of{' '}
                <strong className="text-navy-900">{filteredCustomers.length}</strong> customers
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="font-bold text-navy-900 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Create / Edit Modal */}
        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerToEdit={customerToEdit}
        />
      </div>
    </ModuleGuard>
  );
}
