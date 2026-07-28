'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, Loader2, CheckCircle2, AlertCircle, Wrench, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

export default function MaintenanceManagerPage() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMachines = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/machines?limit=50');
      setMachines(res?.data ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchMachines(); }, [fetchMachines]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      machineCode: form.get('machineCode'),
      machineName: form.get('machineName') || '',
      issueType: form.get('issueType'),
      description: form.get('description'),
      priority: form.get('priority'),
      status: 'IN_PROGRESS',
      downtimeMinutes: parseInt(form.get('downtime') as string) || 0,
      reportedDate: new Date().toISOString().split('T')[0],
      expectedResolution: form.get('expectedResolution') || '',
      notes: form.get('notes') || '',
    };
    try {
      await apiPost('/api/maintenance', payload);
      showToast('success', 'Maintenance issue reported!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to report');
    }
    setSaving(false);
  };

  const runningCount = machines.filter((m: any) => m.status === 'RUNNING').length;
  const breakdownCount = machines.filter((m: any) => m.status === 'BREAKDOWN').length;

  return (
    <ManagerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard">
              <Button variant="outline" size="icon" className="border-border"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
              <p className="text-sm text-muted">Report machine issues and track status</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchMachines} className="border-border">
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4"><p className="text-2xl font-bold text-foreground">{machines.length}</p><p className="text-xs text-muted">Total Machines</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{runningCount}</p><p className="text-xs text-muted">Running</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-red-600">{breakdownCount}</p><p className="text-xs text-muted">Breakdown</p></Card>
        </div>

        <Card className="p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Report Machine Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Machine</Label>
                <Select name="machineCode" required>
                  <option value="">Select machine...</option>
                  {machines.map((m: any) => (
                    <option key={m.id} value={m.machineCode}>{m.machineCode} — {m.machineName || ''} ({m.status})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Issue Type</Label>
                <Input name="issueType" placeholder="e.g. Cutting Tool Failure" required />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select name="priority" required>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="LOW">Low</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Downtime (Minutes)</Label>
                <Input type="number" name="downtime" min="0" defaultValue="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Machine Name (optional)</Label>
                <Input name="machineName" placeholder="e.g. CNC Machining Center #4" />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Resolution</Label>
                <Input type="date" name="expectedResolution" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <textarea name="description" rows={3} required
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Describe the issue in detail..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <textarea name="notes" rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-primary text-white">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Report Issue</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
