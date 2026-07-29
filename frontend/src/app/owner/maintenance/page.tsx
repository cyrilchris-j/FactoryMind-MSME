'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench, AlertTriangle, CheckCircle2, XCircle,
  Search, Loader2, RefreshCw, Clock, Cpu, Lightbulb, MessageSquare
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { Input } from '@/components/ui/input';

export default function MaintenancePage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet(filter === 'open' ? '/api/machine-suggestions?status=open' : '/api/machine-suggestions');
      setSuggestions(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch', err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await apiPatch(`/api/machine-suggestions/${id}/resolve`, { resolution: resolutions[id] || 'Repaired' });
      setToast({ type: 'success', message: 'Issue marked as resolved!' });
      fetchIssues();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed' });
    }
    setResolving(null);
  };

  const openIssues = suggestions.filter(s => s.status === 'open');
  const resolvedIssues = suggestions.filter(s => s.status === 'resolved');
  const displayIssues = filter === 'open' ? openIssues : resolvedIssues;

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-6 h-6 text-primary" /> Maintenance
            </h1>
            <p className="text-muted text-sm">Manager-reported machine issues & defect tickets</p>
          </div>
          <Button variant="outline" onClick={fetchIssues} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{loading ? '—' : openIssues.length}</p>
            <p className="text-sm text-muted">Open Issues</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{loading ? '—' : resolvedIssues.length}</p>
            <p className="text-sm text-muted">Resolved Today</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : suggestions.length}</p>
            <p className="text-sm text-muted">Total Reports</p>
          </Card>
        </div>

        <div className="flex gap-2 mb-2">
          <button onClick={() => setFilter('open')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'open' ? 'bg-primary text-white' : 'bg-background text-muted border border-border'}`}>
            Open Issues ({openIssues.length})
          </button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-primary text-white' : 'bg-background text-muted border border-border'}`}>
            Resolved ({resolvedIssues.length})
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-center text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : displayIssues.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">All Clear</p>
              <p className="text-sm text-muted">No {filter} issues from managers.</p>
            </Card>
          ) : displayIssues.map((s: any) => (
            <Card key={s.id} className={`p-5 ${s.status === 'open' ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-green-400 bg-green-50/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {s.status === 'open' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    <span className="font-semibold text-foreground">{s.managerName}</span>
                    <Badge className={s.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>{s.status}</Badge>
                    <span className="text-xs text-muted">
                      <Cpu className="w-3 h-3 inline mr-0.5" />Machine {s.machineNumber}
                    </span>
                    <span className="text-[10px] text-muted ml-auto">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-2">{s.message}</p>
                  {s.status === 'resolved' && (
                    <div className="mt-2 p-2 bg-green-100/50 rounded-lg text-xs text-green-800">
                      <span className="font-semibold">Resolution: </span>{s.resolution || 'Repaired'} &mdash; by {s.resolvedBy || 'Owner'}
                      {s.resolvedAt && <> on {new Date(s.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit' })}</>}
                    </div>
                  )}
                </div>
                {s.status === 'open' && (
                  <div className="ml-4 space-y-2 w-64 shrink-0">
                    <Input
                      placeholder="Repair notes..."
                      value={resolutions[s.id] || ''}
                      onChange={(e) => setResolutions({ ...resolutions, [s.id]: e.target.value })}
                      className="text-xs"
                    />
                    <Button
                      onClick={() => handleResolve(s.id)}
                      disabled={resolving === s.id}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      {resolving === s.id ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Resolving...</> : <><CheckCircle2 className="w-3 h-3 mr-1" /> Mark Repaired</>}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}
