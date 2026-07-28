'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

export default function ProductionManagerPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      date: form.get('date'),
      shift: form.get('shift'),
      productName: 'Automotive Brake Assembly',
      machineCode: form.get('machineCode'),
      targetQuantity: parseInt(form.get('targetQty') as string),
      actualQuantity: parseInt(form.get('actualQty') as string),
      rejectedQuantity: parseInt(form.get('rejectedQty') as string) || 0,
      wipQuantity: parseInt(form.get('wipQty') as string) || 0,
      downtimeMinutes: parseInt(form.get('downtime') as string) || 0,
      notes: form.get('notes'),
    };
    try {
      await apiPost('/api/production', payload);
      showToast('success', 'Production record saved successfully!');
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
            <h1 className="text-2xl font-bold text-foreground">Production Entry</h1>
            <p className="text-sm text-muted">Automotive Brake Assembly — {user?.department || 'Production'} Dept</p>
          </div>
        </div>

        <Card className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Shift Production Details</span>
              <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-0.5 rounded-full">Product: Automotive Brake Assembly</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" name="date" defaultValue={today} required />
              </div>
              <div className="space-y-1.5">
                <Label>Shift</Label>
                <Select name="shift" required defaultValue="Morning">
                  <option value="Morning">Morning (6 AM – 2 PM)</option>
                  <option value="Evening">Evening (2 PM – 10 PM)</option>
                  <option value="Night">Night (10 PM – 6 AM)</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Production Line / Machine</Label>
                <Input name="machineCode" placeholder="e.g. ASSY-01" required />
              </div>
              <div className="space-y-1.5">
                <Label>Target (Units)</Label>
                <Input type="number" name="targetQty" min="1" placeholder="e.g. 250" required />
              </div>
              <div className="space-y-1.5">
                <Label>Completed Quantity</Label>
                <Input type="number" name="actualQty" min="0" placeholder="e.g. 165" required />
              </div>
              <div className="space-y-1.5">
                <Label>Rejected Quantity</Label>
                <Input type="number" name="rejectedQty" min="0" defaultValue="0" />
              </div>
              <div className="space-y-1.5">
                <Label>WIP (Work in Progress)</Label>
                <Input type="number" name="wipQty" min="0" defaultValue="0" placeholder="e.g. 15" />
              </div>
              <div className="space-y-1.5">
                <Label>Downtime (Minutes)</Label>
                <Input type="number" name="downtime" min="0" defaultValue="0" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <textarea name="notes" rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Production notes, issues, observations..." />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={loading} className="bg-primary text-white px-8">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Production Record</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
