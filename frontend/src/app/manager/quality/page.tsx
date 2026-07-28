'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

export default function QualityManagerPage() {
  const { user } = useAuth();
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
    const inspected = parseInt(form.get('inspectedQty') as string) || 0;
    const passed = parseInt(form.get('passedQty') as string) || 0;
    const rejected = parseInt(form.get('rejectedQty') as string) || 0;
    const payload = {
      product: 'Automotive Brake Assembly',
      batch: form.get('batch'),
      inspectedQuantity: inspected,
      passedQuantity: passed,
      rejectedQuantity: rejected,
      defectType: form.get('defectType'),
      rejectionReason: form.get('rejectionReason'),
      date: new Date().toISOString().split('T')[0],
      shift: form.get('shift'),
      notes: form.get('notes') || '',
    };
    try {
      await apiPost('/api/quality', payload);
      showToast('success', `Quality inspection saved! Pass rate: ${inspected > 0 ? Math.round(passed / inspected * 100) : 0}%`);
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
            <h1 className="text-2xl font-bold text-foreground">Quality Inspection</h1>
            <p className="text-sm text-muted">Record Brake Assembly quality checks</p>
          </div>
        </div>

        <Card className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-foreground">Inspection Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Batch / Lot Number</Label>
                <Input name="batch" placeholder="e.g. BATCH-001" required />
              </div>
              <div className="space-y-1.5">
                <Label>Shift</Label>
                <Select name="shift" required>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Inspected Quantity</Label>
                <Input type="number" name="inspectedQty" min="1" placeholder="e.g. 165" required />
              </div>
              <div className="space-y-1.5">
                <Label>Passed Quantity</Label>
                <Input type="number" name="passedQty" min="0" placeholder="e.g. 162" required />
              </div>
              <div className="space-y-1.5">
                <Label>Rejected Quantity</Label>
                <Input type="number" name="rejectedQty" min="0" defaultValue="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Defect Type</Label>
                <Input name="defectType" placeholder="e.g. Surface crack, Dimensional deviation" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Rejection Reason</Label>
                <textarea name="rejectionReason" rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Detailed reason for rejection..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <textarea name="notes" rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Additional observations..." />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={loading} className="bg-primary text-white px-8">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Inspection</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
