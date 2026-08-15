'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { OrderModal } from '@/components/orders/order-modal';
import { OrderStatus } from '@/lib/types';
import { ShoppingBag, ArrowLeft, Edit, Truck, CheckCircle2, FileText, Wrench, DollarSign } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { orders, updateOrderStatus, quotations, projects } = useSolarStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <ModuleGuard module="orders" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Order Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested purchase order ID does not exist.</p>
          <Link href="/erp/orders">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Orders Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const linkedQuotation = quotations.find((q) => q.id === order.quotationId || q.quotationNumber === order.quotationId);
  const linkedProject = projects.find((p) => p.orderId === order.id || p.customerId === order.customerId);

  const balanceDue = order.totalAmount - order.paidAmount;

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
  };

  return (
    <ModuleGuard module="orders" action="view">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/orders">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Orders Directory
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {linkedQuotation && (
              <Link href={`/erp/quotations/${linkedQuotation.id}`}>
                <Button variant="outline" size="sm" icon={<FileText className="w-4 h-4" />}>
                  View Linked Proposal
                </Button>
              </Link>
            )}

            {linkedProject && (
              <Link href={`/erp/projects/${linkedProject.id}`}>
                <Button variant="accent" size="sm" className="bg-navy-950 text-white font-bold" icon={<Wrench className="w-4 h-4 text-amber-400" />}>
                  Open Turnkey Project
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Order
            </Button>
          </div>
        </div>

        {/* Order Executive Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400 font-mono font-bold">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
                <Badge variant="purple">{order.systemCapacityKw} kW System</Badge>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{order.customerName}</h1>
              <p className="text-xs text-slate-300">
                Order Date: {new Date(order.orderDate).toLocaleDateString()} • Expected Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'TBD'}
              </p>
            </div>

            <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[220px] text-xs space-y-1">
              <span className="text-slate-400 block uppercase font-semibold">Total Order Contract</span>
              <span className="text-3xl font-black text-emerald-400">₹{order.totalAmount.toLocaleString()}</span>
              <span className="text-[11px] text-slate-300 block">
                Paid: <strong className="text-white">₹{order.paidAmount.toLocaleString()}</strong> • Due: <strong className="text-rose-400">₹{balanceDue.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Quick Status Setter */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Update Fulfillment Status:</span>
            <div className="flex flex-wrap items-center gap-2">
              {(['CONFIRMED', 'PROCESSING', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    order.status === st
                      ? 'bg-amber-400 text-navy-950 shadow'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details & Bill of Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Ordered Solar Hardware Bill of Materials" subtitle="Allocated components from warehouse for dispatch." />
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3">Equipment Item Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price (₹)</th>
                        <th className="p-3 text-right">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-semibold text-navy-900">nitish solar Apex 540W N-Type TOPCon Panel</td>
                        <td className="p-3 text-center font-bold">20</td>
                        <td className="p-3 text-right text-slate-600">₹14,500</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹2,90,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-navy-900">Commercial String Inverter 10 kW 3-Phase</td>
                        <td className="p-3 text-center font-bold">1</td>
                        <td className="p-3 text-right text-slate-600">₹75,000</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹75,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-navy-900">Galvanized High-Rise Roof Mounting Structure</td>
                        <td className="p-3 text-center font-bold">1</td>
                        <td className="p-3 text-right text-slate-600">₹38,000</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹38,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-navy-900">DC Armored Cabling & Chemical Earthing Kit</td>
                        <td className="p-3 text-center font-bold">1</td>
                        <td className="p-3 text-right text-slate-600">₹47,000</td>
                        <td className="p-3 text-right font-black text-emerald-700">₹47,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Payment & Receipt Summary" subtitle="Advance collections & balance payments." />
              <CardBody className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Purchase Contract:</span>
                  <span className="font-bold text-navy-900">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="font-bold text-emerald-700">₹{order.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-bold text-rose-600">₹{balanceDue.toLocaleString()}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <OrderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          orderToEdit={order}
        />
      </div>
    </ModuleGuard>
  );
}
