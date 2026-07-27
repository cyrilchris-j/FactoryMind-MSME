'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

interface Machine {
  id: string;
  machine_code: string;
  machine_name: string;
  status: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function ManualDataEntryPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res: any = await apiGet('/api/machines?limit=200');
        const data = res.data ?? [];
        setMachines(data.map((d: any) => ({
          id: d.id,
          machine_code: d.machineCode || d.machine_code || '',
          machine_name: d.machineName || d.machine_name || '',
          status: d.status || 'UNKNOWN',
        })));
      } catch (err) {
        console.error('Failed to fetch machines', err);
      }
    };
    fetchMachines();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const payload = {
      date: formData.get('date'),
      shift: formData.get('shift'),
      machineCode: formData.get('machine'),
      productName: formData.get('product'),
      targetQuantity: parseInt(formData.get('targetQty') as string),
      actualQuantity: parseInt(formData.get('actualQty') as string),
      rejectedQuantity: parseInt(formData.get('rejectedQty') as string) || 0,
      downtimeMinutes: parseInt(formData.get('downtime') as string) || 0,
      notes: formData.get('notes'),
    };

    try {
      await apiPost('/api/production', payload);
      setToast({ type: 'success', message: 'Production data saved successfully!' });
      formRef.current?.reset();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save' });
    }

    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />
            }
            {toast.message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="outline" size="icon" className="border-border">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manual Data Entry</h1>
            <p className="text-sm text-muted">
              {user?.department || 'Production'} Department · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <Card className="p-8 border border-border">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={today}
                  required
                  className={errors.date ? 'border-red-400' : ''}
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shift">Shift <span className="text-red-500">*</span></Label>
                <Select id="shift" name="shift" required defaultValue="" className={errors.shift ? 'border-red-400' : ''}>
                  <option value="" disabled>Select shift</option>
                  <option value="Morning">Morning (6 AM – 2 PM)</option>
                  <option value="Evening">Evening (2 PM – 10 PM)</option>
                  <option value="Night">Night (10 PM – 6 AM)</option>
                </Select>
                {errors.shift && <p className="text-xs text-red-500">{errors.shift}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="machine">Machine <span className="text-red-500">*</span></Label>
                <Select id="machine" name="machine" required defaultValue="" className={errors.machineCode ? 'border-red-400' : ''}>
                  <option value="" disabled>Select machine</option>
                  {machines.length === 0 ? (
                    <option disabled>Loading machines...</option>
                  ) : (
                    machines.map((m) => (
                      <option key={m.id} value={m.machine_code}>
                        {m.machine_code} — {m.machine_name}
                        {m.status !== 'RUNNING' ? ` (${m.status})` : ''}
                      </option>
                    ))
                  )}
                </Select>
                {errors.machineCode && <p className="text-xs text-red-500">{errors.machineCode}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product">Product / Part Name <span className="text-red-500">*</span></Label>
                <Input
                  id="product"
                  name="product"
                  placeholder="e.g. Brake Pad X1, Engine Valve C4"
                  required
                  className={errors.productName ? 'border-red-400' : ''}
                />
                {errors.productName && <p className="text-xs text-red-500">{errors.productName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetQty">Target Quantity (Units) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  id="targetQty"
                  name="targetQty"
                  min="0"
                  placeholder="e.g. 1500"
                  required
                  className={errors.targetQuantity ? 'border-red-400' : ''}
                />
                {errors.targetQuantity && <p className="text-xs text-red-500">{errors.targetQuantity}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="actualQty">Actual Produced Qty <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  id="actualQty"
                  name="actualQty"
                  min="0"
                  placeholder="e.g. 1450"
                  required
                  className={errors.actualQuantity ? 'border-red-400' : ''}
                />
                {errors.actualQuantity && <p className="text-xs text-red-500">{errors.actualQuantity}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rejectedQty">Rejected / Scrap Qty</Label>
                <Input
                  type="number"
                  id="rejectedQty"
                  name="rejectedQty"
                  min="0"
                  defaultValue="0"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="downtime">Downtime (Minutes)</Label>
                <Input
                  type="number"
                  id="downtime"
                  name="downtime"
                  min="0"
                  defaultValue="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes / Observations (Optional)</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any issues, observations, or notes about this shift..."
              />
            </div>

            <div className="pt-2 flex gap-3 justify-end">
              <Link href="/manager/dashboard">
                <Button type="button" variant="outline" className="border-border" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-8"
                disabled={loading}
                id="submit-production-btn"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Production Data</>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
