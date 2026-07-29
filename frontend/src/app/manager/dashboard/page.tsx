'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Cpu, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  RefreshCw, Send, Lightbulb, MessageSquare, Save
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { apiGet, apiPost } from '@/lib/api';

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestionSaving, setSuggestionSaving] = useState(false);
  const [machineData, setMachineData] = useState<any>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [partsProduced, setPartsProduced] = useState('');
  const [defects, setDefects] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const machineNumber = user?.machineNumber || 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchMachineData = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/machine-production/today');
      const records = res.data ?? [];
      const myRecord = records.find((r: any) => r.machineNumber === machineNumber);
      setMachineData(myRecord || null);
      if (myRecord) {
        setPartsProduced(String(myRecord.partsProduced || ''));
        setDefects(String(myRecord.defects || ''));
      }
    } catch (err) {
      console.error('Failed to fetch machine data', err);
    } finally {
      setLoading(false);
    }
  }, [machineNumber]);

  useEffect(() => {
    fetchMachineData();
  }, [fetchMachineData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSaveProduction = async () => {
    setSaving(true);
    try {
      await apiPost('/api/machine-production', {
        machineNumber,
        partsProduced: parseInt(partsProduced) || 0,
        defects: parseInt(defects) || 0,
      });
      setToast({ type: 'success', message: 'Production data saved!' });
      await fetchMachineData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save' });
    }
    setSaving(false);
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim()) return;
    setSuggestionSaving(true);
    try {
      await apiPost('/api/machine-suggestions', {
        machineNumber,
        message: suggestion,
      });
      setToast({ type: 'success', message: 'Suggestion submitted!' });
      setSuggestion('');
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to submit' });
    }
    setSuggestionSaving(false);
  };

  const defectRate = machineData && machineData.partsProduced > 0
    ? ((machineData.defects / machineData.partsProduced) * 100).toFixed(1)
    : '0.0';

  if (!machineNumber) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground">No Machine Assigned</h2>
            <p className="text-sm text-muted mt-1">You don't have a machine assigned. Contact the factory owner.</p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
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

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Cpu className="w-5 h-5 text-blue-200" />
                <span className="text-lg font-bold">Machine {machineNumber}</span>
              </div>
              <p className="text-white/50 text-xs mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={fetchMachineData} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Today's Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Today's Production</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '—' : machineData?.partsProduced ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${parseFloat(defectRate) > 5 ? 'bg-red-50' : 'bg-amber-50'}`}>
                {parseFloat(defectRate) > 5
                  ? <TrendingDown className="w-5 h-5 text-red-600" />
                  : <TrendingUp className="w-5 h-5 text-amber-600" />
                }
              </div>
              <div>
                <p className="text-xs text-muted">Today's Defects</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '—' : machineData?.defects ?? 0}
                </p>
                <p className="text-xs text-muted">{defectRate}% defect rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Good Parts</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '—' : (machineData?.partsProduced ?? 0) - (machineData?.defects ?? 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Entry */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Record Today's Production</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="partsProduced">Parts Produced Today</Label>
                <Input
                  id="partsProduced"
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={partsProduced}
                  onChange={(e) => setPartsProduced(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="defects">Defects / Rejects</Label>
                <Input
                  id="defects"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={defects}
                  onChange={(e) => setDefects(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSaveProduction}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Production</>
                )}
              </Button>
              {machineData?.updatedAt && (
                <p className="text-xs text-muted text-center">
                  Last updated: {new Date(machineData.updatedAt).toLocaleTimeString('en-IN')}
                </p>
              )}
            </div>
          </Card>

          {/* Suggestions */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">Submit a Suggestion</h2>
            </div>
            <p className="text-xs text-muted mb-3">
              Share ideas or concerns about Machine {machineNumber}. Your suggestions will be visible to the factory owner.
            </p>
            <div className="space-y-4">
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="e.g. Machine 3 needs calibration, the guide pins are wearing faster than usual..."
                rows={3}
                className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button
                onClick={handleSubmitSuggestion}
                disabled={suggestionSaving || !suggestion.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {suggestionSaving ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Suggestion</>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Tips */}
        <Card className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-blue-100/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-foreground">Machine {machineNumber} - Quick Tips</h3>
          </div>
          <ul className="text-xs text-muted space-y-1 list-disc pl-4">
            <li>Update your production data daily so the owner can track factory output.</li>
            <li>Report defects accurately to help improve quality control.</li>
            <li>Use the suggestion box for maintenance requests or process improvements.</li>
          </ul>
        </Card>
      </div>
    </ManagerLayout>
  );
}
