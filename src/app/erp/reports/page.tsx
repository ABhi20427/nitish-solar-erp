'use client';

import React, { useState } from 'react';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Printer, Filter, Calendar, Users, Building2, MapPin, Search } from 'lucide-react';

export default function ReportsPage() {
  const { leads, customers, quotations, orders, projects, invoices, payments, installations } = useSolarStore();

  const [selectedReport, setSelectedReport] = useState<
    'sales' | 'leads' | 'customers' | 'quotations' | 'orders' | 'projects' | 'invoices' | 'payments' | 'installations'
  >('sales');

  // Filters state
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [execFilter, setExecFilter] = useState<string>('ALL');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const REPORTS_LIST = [
    { id: 'sales', label: 'Sales & Revenue Report' },
    { id: 'leads', label: 'Leads Acquisition Report' },
    { id: 'customers', label: 'Customer Portfolio Report' },
    { id: 'quotations', label: 'Quotations & Proposals Report' },
    { id: 'projects', label: 'Projects & Turnkey Report' },
    { id: 'invoices', label: 'Milestone Invoices Report' },
    { id: 'payments', label: 'Payment Receipts Log Report' },
    { id: 'installations', label: 'Rooftop Installations Report' },
  ];

  // Helper to handle CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReport === 'sales' || selectedReport === 'orders') {
      headers = ['Order Number', 'Customer Name', 'Capacity (kWp)', 'Total Amount (₹)', 'Paid Amount (₹)', 'Status', 'Date'];
      rows = orders.map((o) => [
        o.orderNumber,
        o.customerName,
        o.systemCapacityKw.toString(),
        o.totalAmount.toString(),
        o.paidAmount.toString(),
        o.status,
        new Date(o.orderDate).toLocaleDateString(),
      ]);
    } else if (selectedReport === 'leads') {
      headers = ['Lead Number', 'Prospect Name', 'Company', 'Category', 'Monthly Bill (₹)', 'Capacity (kW)', 'Status', 'Assigned Exec'];
      rows = leads.map((l) => [
        l.leadNumber,
        l.fullName,
        l.companyName || 'N/A',
        l.customerType,
        (l.monthlyBillAmount || 0).toString(),
        (l.proposedCapacityKw || 10).toString(),
        l.status,
        l.assignedToName || 'Unassigned',
      ]);
    } else if (selectedReport === 'customers') {
      headers = ['Customer ID', 'Full Name', 'Category', 'Phone', 'Email', 'City', 'Projects', 'Total Portfolio (₹)'];
      rows = customers.map((c) => [
        c.customerNumber,
        c.fullName,
        c.customerType,
        c.phone,
        c.email,
        c.city,
        (c.activeProjectsCount || 1).toString(),
        (c.totalProjectValue || 450000).toString(),
      ]);
    } else if (selectedReport === 'quotations') {
      headers = ['Quotation No', 'Customer Name', 'Capacity (kWp)', 'Total Amount (₹)', 'GST (₹)', 'Valid Until', 'Status'];
      rows = quotations.map((q) => [
        q.quotationNumber,
        q.customerName,
        q.systemCapacityKw.toString(),
        q.totalAmount.toString(),
        q.taxAmount.toString(),
        q.validUntil,
        q.status,
      ]);
    } else if (selectedReport === 'projects') {
      headers = ['Project ID', 'Customer Name', 'Size (kWp)', 'City', 'Manager', 'Completion %', 'Status', 'Start Date'];
      rows = projects.map((p) => [
        p.projectNumber,
        p.customerName,
        p.systemSizeKw.toString(),
        p.city,
        p.projectManagerName || 'Priya Iyer',
        `${p.progressPct}%`,
        p.status,
        new Date(p.startDate).toLocaleDateString(),
      ]);
    } else if (selectedReport === 'invoices') {
      headers = ['Invoice No', 'Customer Name', 'Payment Terms', 'Total (₹)', 'Paid (₹)', 'Balance (₹)', 'Due Date', 'Status'];
      rows = invoices.map((i) => [
        i.invoiceNumber,
        i.customerName,
        i.paymentTerms || 'Advance + Balance',
        i.totalAmount.toString(),
        i.paidAmount.toString(),
        i.balanceAmount.toString(),
        new Date(i.dueDate).toLocaleDateString(),
        i.status,
      ]);
    } else if (selectedReport === 'payments') {
      headers = ['Receipt No', 'Customer Name', 'Invoice Ref', 'Amount (₹)', 'Method', 'Reference UTR', 'Date'];
      rows = payments.map((p) => [
        p.receiptNumber,
        p.customerName,
        p.invoiceNumber,
        p.amount.toString(),
        p.paymentMethod,
        p.referenceNo || 'N/A',
        new Date(p.paymentDate).toLocaleDateString(),
      ]);
    } else {
      headers = ['Installation No', 'Project Ref', 'Customer Name', 'System (kWp)', 'Installer Lead', 'Completion %', 'Status'];
      rows = installations.map((j) => [
        j.installationNumber,
        j.projectNumber,
        j.customerName,
        j.systemSizeKw.toString(),
        j.installerLeadName,
        `${j.progressPct}%`,
        j.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ModuleGuard module="reports" action="view">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-purple" /> Operational Reports & Export Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Generate report-ready views and export CSV files across 8 operational solar ERP modules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Report View
            </Button>

            <Button
              variant="accent"
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-brand-purple to-brand-blue text-white font-bold"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV File
            </Button>
          </div>
        </div>

        {/* Report Selector Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold print:hidden">
          {REPORTS_LIST.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedReport === rep.id
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        {/* Report Filters */}
        <Card className="border-slate-200 print:hidden">
          <CardBody className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date Period Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white outline-none"
              >
                <option value="ALL">All Time</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="THIS_QUARTER">This Quarter</option>
                <option value="THIS_YEAR">This Fiscal Year</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales Executive</label>
              <select
                value={execFilter}
                onChange={(e) => setExecFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white outline-none"
              >
                <option value="ALL">All Executives</option>
                <option value="Siddharth Patel">Siddharth Patel</option>
                <option value="Ananya Verma">Ananya Verma</option>
                <option value="Priya Iyer">Priya Iyer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Category</label>
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="RESIDENTIAL">Residential</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fulfillment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed / Won</option>
                <option value="IN_PROGRESS">In Progress / Active</option>
                <option value="PENDING">Pending Approval</option>
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Report Output Content View */}
        <Card className="border-slate-200">
          <CardHeader
            title={
              <span className="flex items-center gap-2 text-navy-900 font-bold uppercase tracking-wider text-sm">
                <FileText className="w-4 h-4 text-brand-purple" /> {REPORTS_LIST.find((r) => r.id === selectedReport)?.label}
              </span>
            }
            subtitle={`Official nitish solar audit report generated on ${new Date().toLocaleDateString()}`}
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto text-xs">
              {/* Sales Report Table */}
              {selectedReport === 'sales' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer Account</th>
                      <th className="p-3 text-center">Capacity</th>
                      <th className="p-3 text-right">Order Value (₹)</th>
                      <th className="p-3 text-right">Paid (₹)</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="p-3 font-mono font-bold text-navy-900">{o.orderNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{o.customerName}</td>
                        <td className="p-3 text-center font-bold text-brand-purple">{o.systemCapacityKw} kWp</td>
                        <td className="p-3 text-right font-black text-navy-900">₹{o.totalAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">₹{o.paidAmount.toLocaleString()}</td>
                        <td className="p-3 text-slate-500 font-mono">{new Date(o.orderDate).toLocaleDateString()}</td>
                        <td className="p-3"><Badge variant="purple">{o.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Leads Report Table */}
              {selectedReport === 'leads' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Lead ID</th>
                      <th className="p-3">Prospect Name</th>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Monthly Bill (₹)</th>
                      <th className="p-3 text-center">Proposed kW</th>
                      <th className="p-3">Assigned Exec</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3 font-mono font-bold text-navy-900">{l.leadNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{l.fullName}</td>
                        <td className="p-3 text-slate-600">{l.companyName || 'N/A'}</td>
                        <td className="p-3"><Badge variant="outline">{l.customerType}</Badge></td>
                        <td className="p-3 text-right font-bold">₹{(l.monthlyBillAmount || 0).toLocaleString()}</td>
                        <td className="p-3 text-center font-black text-brand-purple">{l.proposedCapacityKw || 10} kW</td>
                        <td className="p-3 text-slate-700">{l.assignedToName || 'Unassigned'}</td>
                        <td className="p-3"><Badge variant="purple">{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Customers Report Table */}
              {selectedReport === 'customers' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Customer ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Contact Phone</th>
                      <th className="p-3">City</th>
                      <th className="p-3 text-right">Portfolio Valuation (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3 font-mono font-bold text-navy-900">{c.customerNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.fullName}</td>
                        <td className="p-3"><Badge variant="purple">{c.customerType}</Badge></td>
                        <td className="p-3 text-slate-700">{c.phone}</td>
                        <td className="p-3 text-slate-600">{c.city}</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹{(c.totalProjectValue || 450000).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Invoices Report Table */}
              {selectedReport === 'invoices' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3 text-right">Total (₹)</th>
                      <th className="p-3 text-right">Paid (₹)</th>
                      <th className="p-3 text-right">Balance Due (₹)</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((i) => (
                      <tr key={i.id}>
                        <td className="p-3 font-mono font-bold text-navy-900">{i.invoiceNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{i.customerName}</td>
                        <td className="p-3 text-right font-black text-navy-900">₹{i.totalAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">₹{i.paidAmount.toLocaleString()}</td>
                        <td className="p-3 text-right font-extrabold text-rose-600">₹{i.balanceAmount.toLocaleString()}</td>
                        <td className="p-3 text-slate-500 font-mono">{new Date(i.dueDate).toLocaleDateString()}</td>
                        <td className="p-3"><Badge variant="purple">{i.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Default Fallback Table */}
              {(selectedReport === 'quotations' || selectedReport === 'projects' || selectedReport === 'payments' || selectedReport === 'installations') && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="p-3">Document Reference</th>
                      <th className="p-3">Customer / Client</th>
                      <th className="p-3 text-center">System Size (kWp)</th>
                      <th className="p-3 text-right">Contract Valuation (₹)</th>
                      <th className="p-3">Audit Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono font-bold text-navy-900">{p.projectNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{p.customerName}</td>
                        <td className="p-3 text-center font-bold text-brand-purple">{p.systemSizeKw} kWp</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹{(p.projectValue || p.systemSizeKw * 45000).toLocaleString()}</td>
                        <td className="p-3 text-slate-500 font-mono">{new Date(p.startDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </ModuleGuard>
  );
}
