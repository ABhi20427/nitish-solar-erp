'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSolarStore } from '@/lib/store-context';
import { ModuleGuard } from '@/components/auth/auth-guard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { SurveyModal } from '@/components/surveys/survey-modal';
import { ClipboardCheck, ArrowLeft, Edit, Compass, Sun, MapPin, Zap, ShieldCheck, User } from 'lucide-react';

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params?.id as string;

  const { siteSurveys } = useSolarStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const survey = siteSurveys.find((s) => s.id === surveyId);

  if (!survey) {
    return (
      <ModuleGuard module="surveys" action="view">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-navy-900">Survey Report Not Found</h2>
          <p className="text-xs text-slate-500">The requested site survey ID does not exist.</p>
          <Link href="/erp/surveys">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Surveys Directory
            </Button>
          </Link>
        </div>
      </ModuleGuard>
    );
  }

  const recomKw = survey.recommendedCapacityKw || Math.round(survey.roofAreaSqFt / 100);

  return (
    <ModuleGuard module="surveys" action="view">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/erp/surveys">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Surveys Directory
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit Survey Report
          </Button>
        </div>

        {/* Survey Banner */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-mono font-bold">{survey.surveyNumber}</span>
              <StatusBadge status={survey.status} />
              <Badge variant="purple">{survey.propertyType || 'COMMERCIAL'}</Badge>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{survey.customerName || 'Solar Client'}</h1>
            <p className="text-xs text-slate-300">
              Surveyor: <strong className="text-white">{survey.surveyorName}</strong> • Date: {new Date(survey.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-w-[200px] text-xs space-y-1">
            <span className="text-slate-400 block uppercase font-semibold">Recommended Solar System</span>
            <span className="text-3xl font-black text-brand-purplelight">{recomKw} kWp</span>
            <span className="text-[11px] text-emerald-400 font-bold block">{survey.roofAreaSqFt} Sq Ft Available Area</span>
          </div>
        </div>

        {/* Technical Specs Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Engineering Specs */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Rooftop Geometry & Shading Analysis" subtitle="Structural framework and solar orientation parameters." />
              <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Available Area</span>
                  <span className="text-lg font-black text-navy-900">{survey.roofAreaSqFt} Sq Ft</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Roof Mounting Type</span>
                  <span className="text-sm font-bold text-navy-900">{survey.roofType || 'Terrace RCC'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Azimuth / Orientation</span>
                  <span className="text-sm font-bold text-brand-purple">{survey.azimuthDirection || 'South 180°'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Roof Tilt Angle</span>
                  <span className="text-lg font-black text-navy-900">{survey.roofTiltAngle || 20}°</span>
                </div>
              </CardBody>
            </Card>

            <Card className="border-slate-200">
              <CardHeader title="DISCOM Net Metering & Electrical Infrastructure" subtitle="Grid voltage, meter connection type, and cable distance." />
              <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block font-semibold mb-1">DISCOM Grid Connection</span>
                  <span className="text-sm font-bold text-navy-900">{survey.discomConnection || 'MSEDCL LT 3-Phase Connection'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block font-semibold mb-1">Net Metering Specification</span>
                  <span className="text-sm font-bold text-navy-900">{survey.meterType || 'Bi-directional Net Meter'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block font-semibold mb-1">Cable Run Distance</span>
                  <span className="text-sm font-bold text-navy-900">{survey.cableDistanceMeters || 40} Meters</span>
                </div>
              </CardBody>
            </Card>

            {survey.notes && (
              <Card className="border-slate-200">
                <CardHeader title="Surveyor Observations & Engineering Notes" subtitle="Technical site notes for structural mounting design." />
                <CardBody className="text-xs">
                  <p className="text-slate-700 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-200">
                    {survey.notes}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200">
              <CardHeader title="Electricity Bill & Load Profile" subtitle="Baseline monthly consumption." />
              <CardBody className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Bill Amount:</span>
                  <span className="text-base font-black text-navy-900">
                    ₹{(survey.monthlyBillAmount || 18000).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Roof Shading Factor:</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {survey.shadingCondition || 'No Shading (0%)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Structure Type:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {survey.structureType || 'Galvanized Steel Framework'}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <SurveyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          surveyToEdit={survey}
        />
      </div>
    </ModuleGuard>
  );
}
