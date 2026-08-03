'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Cpu, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  RefreshCw, Send, Lightbulb, MessageSquare, Save,
  Zap, FileSpreadsheet, UploadCloud, Download, X, Loader2
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { apiGet, apiPost } from '@/lib/api';

const REPORT_TEMPLATE_COLUMNS = ['date', 'parts_produced', 'defects', 'energy_kwh', 'workers_present', 'workers_absent', 'notes'];

function downloadReportTemplate() {
  const headers = REPORT_TEMPLATE_COLUMNS.join(',');
  const today = new Date().toISOString().split('T')[0];
  const example = [today, '500', '5', '120.5', '5', '1', 'Routine production'].join(',');
  const csv = [headers, example].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'machine_production_report_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestionSaving, setSuggestionSaving] = useState(false);
  const [machineData, setMachineData] = useState<any>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  
  const [partsProduced, setPartsProduced] = useState('');
  const [defects, setDefects] = useState('');
  const [energyKwh, setEnergyKwh] = useState('');
  const [currentAmps, setCurrentAmps] = useState('');
  const [workersPresent, setWorkersPresent] = useState('');
  const [workersAbsent, setWorkersAbsent] = useState('');
  const [tomorrowTarget, setTomorrowTarget] = useState('');
  const [suggestion, setSuggestion] = useState('');

  // Additional states for the redesigned form
  const [goodProducts, setGoodProducts] = useState('');
  const [totalWorkers, setTotalWorkers] = useState('');
  const [managerName, setManagerName] = useState(user?.name || '');

  const machineNumber = user?.machineNumber || 0;

  useEffect(() => {
    if (user?.name) {
      setManagerName(user.name);
    }
  }, [user?.name]);

  // Excel upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadStep, setUploadStep] = useState<'idle' | 'parsing' | 'preview' | 'uploading' | 'done'>('idle');
  const [uploadRows, setUploadRows] = useState<any[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState('');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchMachineData = useCallback(async () => {
    if (!machineNumber) return;
    try {
      const res: any = await apiGet('/api/machine-production/today');
      const records = res.data ?? [];
      const myRecord = records.find((r: any) => r.machineNumber === machineNumber);
      setMachineData(myRecord || null);
      if (myRecord) {
        setPartsProduced(String(myRecord.partsProduced || ''));
        setDefects(String(myRecord.defects || ''));
        setEnergyKwh(String(myRecord.energyKwh || ''));
        setCurrentAmps(String(myRecord.currentAmps || ''));
        setWorkersPresent(String(myRecord.workersPresent || ''));
        setWorkersAbsent(String(myRecord.workersAbsent || ''));
        setTomorrowTarget(String(myRecord.tomorrowTarget || ''));

        const pt = myRecord.partsProduced || 0;
        const df = myRecord.defects || 0;
        setGoodProducts(String(Math.max(0, pt - df)));

        const pr = myRecord.workersPresent || 0;
        const ab = myRecord.workersAbsent || 0;
        setTotalWorkers(String(pr + ab));
      } else {
        setPartsProduced('');
        setDefects('');
        setEnergyKwh('');
        setCurrentAmps('');
        setWorkersPresent('');
        setWorkersAbsent('');
        setTomorrowTarget('');
        setGoodProducts('');
        setTotalWorkers('');
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
        shift: 'General',
        partsProduced: parseInt(partsProduced) || 0,
        defects: parseInt(defects) || 0,
        energyKwh: parseFloat(energyKwh) || 0,
        currentAmps: parseFloat(currentAmps) || 0,
        workersPresent: parseInt(workersPresent) || 0,
        workersAbsent: parseInt(workersAbsent) || 0,
        tomorrowTarget: parseInt(tomorrowTarget) || 0,
      });
      setToast({ type: 'success', message: 'Production & energy data saved!' });
      await fetchMachineData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save' });
    }
    setSaving(false);
  };

  // Real-time synchronization handlers
  const handleTotalPartsChange = (val: string) => {
    setPartsProduced(val);
    const pts = parseInt(val) || 0;
    const df = parseInt(defects) || 0;
    setGoodProducts(String(Math.max(0, pts - df)));
  };

  const handleDefectsChange = (val: string) => {
    setDefects(val);
    const pts = parseInt(partsProduced) || 0;
    const df = parseInt(val) || 0;
    setGoodProducts(String(Math.max(0, pts - df)));
  };

  const handleGoodProductsChange = (val: string) => {
    setGoodProducts(val);
    const gp = parseInt(val) || 0;
    const df = parseInt(defects) || 0;
    setPartsProduced(String(gp + df));
  };

  const handleTotalWorkersChange = (val: string) => {
    setTotalWorkers(val);
    const tw = parseInt(val) || 0;
    const ab = parseInt(workersAbsent) || 0;
    setWorkersPresent(String(Math.max(0, tw - ab)));
  };

  const handlePresentChange = (val: string) => {
    setWorkersPresent(val);
    const pr = parseInt(val) || 0;
    const ab = parseInt(workersAbsent) || 0;
    setTotalWorkers(String(pr + ab));
  };

  const handleAbsentChange = (val: string) => {
    setWorkersAbsent(val);
    const pr = parseInt(workersPresent) || 0;
    const ab = parseInt(val) || 0;
    setTotalWorkers(String(pr + ab));
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

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setUploadFileName(file.name);
    setUploadError('');
    setUploadStep('parsing');
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const rows = raw.map((r: any, i: number) => ({
        date: r.date || '',
        parts_produced: Number(r.parts_produced || r.partsProduced || 0),
        defects: Number(r.defects || 0),
        energy_kwh: Number(r.energy_kwh || r.energyKwh || 0),
        current_amps: 0,
        workers_present: Number(r.workers_present || r.workersPresent || 0),
        workers_absent: Number(r.workers_absent || r.workersAbsent || 0),
        tomorrow_target: 0,
        notes: r.notes || '',
        _row: i + 2,
      }));
      setUploadRows(rows);
      setUploadStep('preview');
    } catch (err: any) {
      setUploadError('Failed to parse file: ' + err.message);
      setUploadStep('idle');
    }
  }, []);

  const handleConfirmUpload = async () => {
    if (!uploadRows.length) return;
    setUploadStep('uploading');
    try {
      const result = await apiPost('/api/production-reports', {
        machineNumber,
        records: uploadRows,
      });
      setUploadResult(result);
      setUploadStep('done');
      setToast({ type: 'success', message: `Report uploaded with ${uploadRows.length} records!` });
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setUploadStep('preview');
    }
  };

  const resetUpload = () => {
    setUploadRows([]);
    setUploadFileName('');
    setUploadResult(null);
    setUploadError('');
    setUploadStep('idle');
    if (fileRef.current) fileRef.current.value = '';
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
            <p className="text-sm text-muted mt-1">Contact the factory owner to get your machine assignment.</p>
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
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
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

        {/* Main Grid: Left (Production + Energy), Right (Upload + Suggestion) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Production & Energy Entry */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Record Today's Data</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="space-y-1.5">
                  <Label>Machine</Label>
                  <Input type="text" value={`Machine ${machineNumber}`} disabled className="bg-slate-50 cursor-not-allowed text-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label>Manager Name</Label>
                  <Input type="text" value={managerName} disabled className="bg-slate-50 cursor-not-allowed text-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label>kWh (Energy)</Label>
                  <Input type="number" min="0" step="0.1" placeholder="e.g. 120.5" value={energyKwh} onChange={(e) => setEnergyKwh(e.target.value)} />
                </div>

                {/* Row 2 */}
                <div className="space-y-1.5">
                  <Label>Total Parts</Label>
                  <Input type="number" min="0" placeholder="e.g. 500" value={partsProduced} onChange={(e) => handleTotalPartsChange(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Good Products</Label>
                  <Input type="number" min="0" placeholder="e.g. 495" value={goodProducts} onChange={(e) => handleGoodProductsChange(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Defect</Label>
                  <Input type="number" min="0" placeholder="e.g. 5" value={defects} onChange={(e) => handleDefectsChange(e.target.value)} />
                </div>

                {/* Row 3 */}
                <div className="space-y-1.5">
                  <Label>Total Workers</Label>
                  <Input type="number" min="0" placeholder="e.g. 6" value={totalWorkers} onChange={(e) => handleTotalWorkersChange(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Present</Label>
                  <Input type="number" min="0" placeholder="e.g. 5" value={workersPresent} onChange={(e) => handlePresentChange(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Absent</Label>
                  <Input type="number" min="0" placeholder="e.g. 1" value={workersAbsent} onChange={(e) => handleAbsentChange(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleSaveProduction} disabled={saving} className="w-full mt-6 bg-primary hover:bg-primary/90 text-white">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save All Data</>}
              </Button>
              {machineData?.updatedAt && (
                <p className="text-xs text-muted text-center mt-2">Last updated: {new Date(machineData.updatedAt).toLocaleTimeString('en-IN')}</p>
              )}
            </Card>

            {/* Excel Upload Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <h2 className="text-base font-bold text-foreground">Upload Production Report</h2>
              </div>
              <p className="text-xs text-muted mb-4">Upload an Excel/CSV file with your daily production data.</p>

              {uploadStep === 'done' && uploadResult ? (
                <div className="p-6 bg-green-50 rounded-lg text-center border border-green-200">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">Report Uploaded Successfully!</p>
                  <p className="text-xs text-green-600 mt-1">{uploadRows.length} records submitted</p>
                  <Button onClick={resetUpload} variant="outline" size="sm" className="mt-3">Upload Another</Button>
                </div>
              ) : uploadStep === 'uploading' ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted">Uploading report...</p>
                </div>
              ) : uploadStep === 'preview' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{uploadFileName} ({uploadRows.length} rows)</span>
                    <button onClick={resetUpload} className="text-xs text-muted hover:text-red-500"><X className="w-3.5 h-3.5 inline" /> Remove</button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-background sticky top-0">
                        <tr>
                          <th className="text-left p-2">Date</th>
                          <th className="text-right p-2">Parts</th>
                          <th className="text-right p-2">Defects</th>
                          <th className="text-right p-2">kWh</th>
                          <th className="text-right p-2">Present</th>
                          <th className="text-right p-2">Absent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadRows.map((r, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{r.date}</td>
                            <td className="p-2 text-right">{r.parts_produced}</td>
                            <td className="p-2 text-right">{r.defects}</td>
                            <td className="p-2 text-right">{r.energy_kwh}</td>
                            <td className="p-2 text-right">{r.workers_present}</td>
                            <td className="p-2 text-right">{r.workers_absent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={resetUpload}>Cancel</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmUpload}>
                      Upload Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:bg-green-50/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                >
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {uploadStep === 'parsing' ? (
                    <><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" /><p className="text-xs text-muted">Parsing file...</p></>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Drop your Excel file here or click to browse</p>
                    </>
                  )}
                </div>
              )}
              {uploadError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">{uploadError}</div>
              )}
            </Card>
          </div>

          {/* Right Sidebar: Template + Suggestions */}
          <div className="space-y-6">
            {/* Template Download */}
            <Card className="p-5 bg-linear-to-br from-green-50/50 border-green-100/50">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-foreground">Excel Template</h3>
              </div>
              <p className="text-xs text-muted mb-3">Download the template with required columns:</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {REPORT_TEMPLATE_COLUMNS.map((col) => (
                  <span key={col} className="text-[10px] px-2 py-1 bg-white border border-border rounded font-mono">{col}</span>
                ))}
              </div>
              <Button onClick={downloadReportTemplate} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs gap-2">
                <Download className="w-3.5 h-3.5" /> Download Template CSV
              </Button>
            </Card>

            {/* Suggestions */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Submit Suggestion</h3>
              </div>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Share ideas or report issues..."
                rows={3}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary mb-3"
              />
              <Button onClick={handleSubmitSuggestion} disabled={suggestionSaving || !suggestion.trim()} className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs">
                {suggestionSaving ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...</> : <><Send className="w-3.5 h-3.5 mr-1" /> Submit</>}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
