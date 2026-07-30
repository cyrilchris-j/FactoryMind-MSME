'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, Loader2, CheckCircle2, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

export default function EnergyManagerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const kwh = parseInt(form.get('kwh') as string) || 0;
    const output = parseInt(form.get('output') as string) || 0;
    const hours = parseFloat(form.get('hours') as string) || 0;
    const payload = {
      machineCode: form.get('machine'),
      shift: 'General',
      workingHours: hours,
      energyConsumptionKwh: kwh,
      productionOutput: output,
      energyPerUnit: output > 0 ? (kwh / output).toFixed(2) : '0',
      energyCost: Math.round(kwh * 7.5),
      date: new Date().toISOString().split('T')[0],
      peakDemandKw: parseInt(form.get('peak') as string) || 0,
      powerFactor: parseFloat(form.get('pf') as string) || 0.9,
      notes: form.get('notes') || '',
    };
    try {
      await apiPost('/api/energy', payload);
      const perUnit = output > 0 ? (kwh / output).toFixed(2) : 'N/A';
      showToast('success', `Energy logged: ${kwh}kWh, ${perUnit} kWh/unit`);
      formRef.current?.reset();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save');
    }
    setLoading(false);
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="outline" size="icon" className="border-border"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energy Consumption</h1>
            <p className="text-sm text-muted">Log machine energy usage for Brake Assembly production</p>
          </div>
        </div>

        <Card className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-foreground">Energy Log Entry</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Machine / Line</Label>
                <Input name="machine" placeholder="e.g. CNC-01, ASSY-01" required />
              </div>
              <div className="space-y-1.5">
                <Label>Working Hours</Label>
                <Input type="number" name="hours" min="0" step="0.5" placeholder="e.g. 8" required />
              </div>
              <div className="space-y-1.5">
                <Label>Energy Consumption (kWh)</Label>
                <Input type="number" name="kwh" min="0" placeholder="e.g. 1250" required />
              </div>
              <div className="space-y-1.5">
                <Label>Production Output (Units)</Label>
                <Input type="number" name="output" min="0" placeholder="e.g. 165" />
              </div>
              <div className="space-y-1.5">
                <Label>Peak Demand (kW)</Label>
                <Input type="number" name="peak" min="0" placeholder="e.g. 180" />
              </div>
              <div className="space-y-1.5">
                <Label>Power Factor</Label>
                <Input type="number" name="pf" min="0" max="1" step="0.01" placeholder="e.g. 0.92" />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={loading} className="bg-primary text-white px-8">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Log Energy</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
