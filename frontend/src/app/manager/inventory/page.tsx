'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Package, AlertTriangle, CheckCircle2, Loader2, RefreshCw,
  Save, UploadCloud, FileSpreadsheet, Download, X, ArrowLeft, Plus, Search
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

interface ComponentStatus {
  id: string;
  componentCode: string;
  componentName: string;
  currentStock: number;
  incomingStock: number;
  reservedStock: number;
  totalRequired: number;
  shortage: number;
  status: string;
  supplier: string;
  leadTimeDays: number;
  unitCost: number;
  unit: string;
}

interface ParsedRow {
  component_code: string;
  component_name: string;
  current_stock: number;
  incoming_quantity: number;
  reserved_quantity: number;
  _valid: boolean;
  _errors: string[];
  _row: number;
}

const BOM_REQUIRED_PER_ASSEMBLY: Record<string, number> = {
  'Brake Disc': 1,
  'Brake Caliper': 1,
  'Brake Pad': 2,
  'Piston': 1,
  'Caliper Bracket': 1,
  'Guide Pin': 2,
  'Seal Ring': 1,
  'Dust Boot': 1,
  'Bolt Kit': 1,
  'Wear Sensor': 1,
};

function validateUploadRow(row: Record<string, any>, index: number): ParsedRow {
  const errors: string[] = [];
  const code = String(row.component_code || row.componentCode || '');
  const name = String(row.component_name || row.componentName || '');
  const stock = Number(row.current_stock ?? row.currentStock ?? -1);
  const incoming = Number(row.incoming_quantity ?? row.incomingStock ?? 0);
  const reserved = Number(row.reserved_quantity ?? row.reservedStock ?? 0);

  if (!code) errors.push('Missing component_code');
  if (!name) errors.push('Missing component_name');
  if (isNaN(stock) || stock < 0) errors.push('Invalid current_stock');

  return {
    component_code: code,
    component_name: name,
    current_stock: isNaN(stock) ? 0 : stock,
    incoming_quantity: isNaN(incoming) ? 0 : incoming,
    reserved_quantity: isNaN(reserved) ? 0 : reserved,
    _valid: errors.length === 0,
    _errors: errors,
    _row: index + 2,
  };
}

async function parseComponentFile(file: File): Promise<ParsedRow[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const normalized = raw.map((r) => {
    const obj: Record<string, any> = {};
    Object.entries(r).forEach(([k, v]) => {
      const nk = k.trim().toLowerCase().replace(/\s+/g, '_');
      obj[nk] = v instanceof Date ? v.toISOString().split('T')[0] : v;
    });
    return obj;
  });
  return normalized.map((r, i) => validateUploadRow(r, i));
}

export default function InventoryManagerPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [components, setComponents] = useState<ComponentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderQty, setOrderQty] = useState(250);

  const [activeTab, setActiveTab] = useState<'status' | 'add' | 'upload'>(
    (searchParams.get('tab') as any) || 'status'
  );

  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  // Manual add form
  const [selectedComponent, setSelectedComponent] = useState('');
  const [currentQty, setCurrentQty] = useState('');
  const [incomingQty, setIncomingQty] = useState('0');
  const [reservedQty, setReservedQty] = useState('0');
  const [supplier, setSupplier] = useState('');
  const [expectedArrival, setExpectedArrival] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploadStep, setUploadStep] = useState<'idle' | 'parsing' | 'preview' | 'done'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploadResult, setUploadResult] = useState<{ updated: number; failed: number } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet(`/api/components/inventory-status`);
      if (res?.data) setComponents(res.data);
      if (res?.totalOrderQty) setOrderQty(res.totalOrderQty);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (toast) setTimeout(() => setToast(null), 4000);
  }, [toast]);

  const showToast = (type: string, message: string) => setToast({ type, message });

  const handleSave = async () => {
    if (!selectedComponent) { showToast('error', 'Select a component'); return; }
    setSaving(true);
    try {
      const comp = components.find(c => c.id === selectedComponent);
      if (!comp) throw new Error('Component not found');
      await apiPut(`/api/components/${selectedComponent}`, {
        currentStock: Number(currentQty),
        incomingStock: Number(incomingQty),
        reservedStock: Number(reservedQty),
        supplier: supplier || comp.supplier,
        expectedArrival,
        notes,
      });
      showToast('success', `${comp.componentName} stock updated`);
      resetForm();
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const resetForm = () => {
    setSelectedComponent(''); setCurrentQty(''); setIncomingQty('0');
    setReservedQty('0'); setSupplier(''); setExpectedArrival(''); setNotes('');
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setUploadStep('parsing');
    try {
      const parsed = await parseComponentFile(file);
      setRows(parsed);
      setUploadStep('preview');
    } catch (err: any) {
      showToast('error', 'Failed to parse: ' + err.message);
      setUploadStep('idle');
    }
  }, []);

  const handleConfirmUpload = async () => {
    const valid = rows.filter(r => r._valid);
    if (!valid.length) return;
    setIsUploading(true);
    try {
      const result = await apiPost<{ updated: number; failed: number }>('/api/components/batch-update', { records: valid });
      setUploadResult(result);
      setUploadStep('done');
      showToast('success', `Updated ${result.updated} components!`);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Upload failed');
    }
    setIsUploading(false);
  };

  const resetUpload = () => {
    setRows([]); setFileName(''); setUploadResult(null); setUploadStep('idle');
    if (fileRef.current) fileRef.current.value = '';
  };

  const componentsReady = components.filter(c => c.shortage === 0).length;
  const componentsTotal = components.length;
  const criticalComponents = components.filter(c => c.shortage > 0);
  const maxBuildable = components.length > 0 ? Math.min(...components.map(c => Math.floor((c.currentStock - c.reservedStock) / (BOM_REQUIRED_PER_ASSEMBLY[c.componentName] || 1)))) : 0;
  const primaryConstraint = components.reduce((min, c) => {
    const perProduct = BOM_REQUIRED_PER_ASSEMBLY[c.componentName] || 1;
    const possible = perProduct > 0 ? Math.floor((c.currentStock - c.reservedStock) / perProduct) : Infinity;
    return possible < min.possible ? { name: c.componentName, shortage: c.shortage, possible } : min;
  }, { name: 'None', shortage: 0, possible: Infinity });

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Component Inventory</h1>
            <p className="text-sm text-muted">Manage all 10 Brake Assembly BOM components</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : componentsTotal}</p>
            <p className="text-xs text-muted">Total Components</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-emerald-600">{loading ? '—' : componentsReady}</p>
            <p className="text-xs text-muted">Components Ready</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-red-600">{loading ? '—' : criticalComponents.length}</p>
            <p className="text-xs text-muted">Shortages</p>
          </Card>
          <Card className="p-4">
            <p className={`text-2xl font-bold ${maxBuildable >= orderQty ? 'text-emerald-600' : 'text-amber-600'}`}>
              {loading ? '—' : maxBuildable}
            </p>
            <p className="text-xs text-muted">Max Buildable</p>
          </Card>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-border">
          {(['status', 'add', 'upload'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-foreground'
              }`}>
              {tab === 'status' && <Package className="w-4 h-4" />}
              {tab === 'add' && <Plus className="w-4 h-4" />}
              {tab === 'upload' && <UploadCloud className="w-4 h-4" />}
              {tab === 'status' ? 'Component Status' : tab === 'add' ? 'Add Stock' : 'Upload Excel/CSV'}
            </button>
          ))}
        </div>

        {activeTab === 'status' && (
          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="text-base font-bold text-foreground mb-4">Today's Component Status</h2>
              {loading ? (
                <div className="py-8 text-center text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
              ) : components.length === 0 ? (
                <p className="text-muted text-center py-8">No components found. Run the demo seed first.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="text-left py-3 px-3 font-medium text-muted">Component</th>
                        <th className="text-right py-3 px-3 font-medium text-muted">Required</th>
                        <th className="text-right py-3 px-3 font-medium text-muted">Available</th>
                        <th className="text-right py-3 px-3 font-medium text-muted">Incoming</th>
                        <th className="text-right py-3 px-3 font-medium text-muted">Reserved</th>
                        <th className="text-right py-3 px-3 font-medium text-muted">Shortage</th>
                        <th className="text-left py-3 px-3 font-medium text-muted">Status</th>
                        <th className="text-left py-3 px-3 font-medium text-muted">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((comp) => (
                        <tr key={comp.id} className={`border-b border-border hover:bg-background ${comp.shortage > 0 ? 'bg-red-50/50' : ''}`}>
                          <td className="py-3 px-3 font-medium text-foreground">{comp.componentName}</td>
                          <td className="py-3 px-3 text-right font-numbers">{comp.totalRequired}</td>
                          <td className={`py-3 px-3 text-right font-numbers ${comp.currentStock - comp.reservedStock < comp.totalRequired ? 'text-red-600 font-bold' : 'text-emerald-600'}`}>
                            {comp.currentStock - comp.reservedStock}
                          </td>
                          <td className="py-3 px-3 text-right font-numbers text-muted">{comp.incomingStock}</td>
                          <td className="py-3 px-3 text-right font-numbers text-muted">{comp.reservedStock}</td>
                          <td className={`py-3 px-3 text-right font-numbers ${comp.shortage > 0 ? 'text-red-600 font-bold' : 'text-emerald-600'}`}>
                            {comp.shortage > 0 ? comp.shortage : '0'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              comp.status === 'READY' ? 'bg-emerald-100 text-emerald-700' :
                              comp.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {comp.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-muted">{comp.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {criticalComponents.length > 0 && (
              <Card className="p-4 border-2 border-red-200 bg-red-50/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Component Shortages Detected</p>
                    {criticalComponents.map(c => (
                      <p key={c.id} className="text-sm text-red-700">{c.componentName}: {c.shortage} units short ({c.componentCode})</p>
                    ))}
                    <p className="text-sm text-red-700 mt-1">Max buildable: {maxBuildable} assemblies. Primary constraint: {primaryConstraint.name}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Add / Update Component Stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Component</Label>
                <Select value={selectedComponent} onChange={(e: any) => {
                  const comp = components.find(c => c.id === e.target.value);
                  setSelectedComponent(e.target.value);
                  if (comp) {
                    setCurrentQty(String(comp.currentStock));
                    setSupplier(comp.supplier);
                  }
                }}>
                  <option value="">Select component...</option>
                  {components.map(c => (
                    <option key={c.id} value={c.id}>{c.componentName} ({c.componentCode})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Current Quantity</Label>
                <Input type="number" value={currentQty} onChange={e => setCurrentQty(e.target.value)} placeholder="e.g. 300" />
              </div>
              <div className="space-y-1.5">
                <Label>Incoming Quantity</Label>
                <Input type="number" value={incomingQty} onChange={e => setIncomingQty(e.target.value)} placeholder="e.g. 100" />
              </div>
              <div className="space-y-1.5">
                <Label>Reserved Quantity</Label>
                <Input type="number" value={reservedQty} onChange={e => setReservedQty(e.target.value)} placeholder="e.g. 20" />
              </div>
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Arrival</Label>
                <Input type="date" value={expectedArrival} onChange={e => setExpectedArrival(e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Optional notes..." />
              </div>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <Button variant="outline" onClick={resetForm} className="border-border">Reset</Button>
              <Button onClick={handleSave} disabled={saving || !selectedComponent} className="bg-primary text-white">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save</>}
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {uploadStep === 'done' && uploadResult ? (
              <Card className="p-10 text-center">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Upload Complete!</h2>
                <p className="text-muted mb-6">
                  <span className="text-green-600 font-semibold">{uploadResult.updated} components</span> updated.
                  {uploadResult.failed > 0 && <span className="text-red-600"> · {uploadResult.failed} failed</span>}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetUpload} variant="outline" className="border-border">Upload Another</Button>
                  <Button onClick={() => setActiveTab('status')} className="bg-primary text-white">View Status</Button>
                </div>
              </Card>
            ) : (
              <>
                {(uploadStep === 'idle' || uploadStep === 'parsing') && (
                  <Card className="p-10 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary transition-all cursor-pointer"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    {uploadStep === 'parsing' ? (
                      <><Loader2 className="w-10 h-10 text-primary animate-spin mb-4" /><p className="text-muted font-medium">Parsing file...</p></>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-base font-bold text-foreground mb-1">Upload Component Stock (Excel/CSV)</h3>
                        <p className="text-xs text-muted mb-4">Drag & drop or click to browse. Supports .xlsx, .xls, .csv</p>
                        <Button className="bg-primary text-white text-xs px-6">Choose File</Button>
                      </>
                    )}
                  </Card>
                )}

                {uploadStep === 'preview' && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-sm">{fileName}</span>
                        <button onClick={resetUpload} className="text-xs text-muted hover:text-red-500"><X className="w-3.5 h-3.5 inline" /> Remove</button>
                      </div>
                      <div className="flex gap-2 text-xs font-semibold">
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">✓ {rows.filter(r => r._valid).length} Valid</span>
                        {rows.filter(r => !r._valid).length > 0 && (
                          <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">⚠ {rows.filter(r => !r._valid).length} Invalid</span>
                        )}
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-60 mb-4">
                      <table className="w-full text-xs">
                        <thead className="bg-background border-b border-border sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 text-muted">Row</th>
                            <th className="text-left py-2 px-3 text-muted">Component Code</th>
                            <th className="text-left py-2 px-3 text-muted">Component Name</th>
                            <th className="text-right py-2 px-3 text-muted">Current Stock</th>
                            <th className="text-right py-2 px-3 text-muted">Incoming</th>
                            <th className="text-right py-2 px-3 text-muted">Reserved</th>
                            <th className="text-left py-2 px-3 text-muted">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r._row} className={`border-b border-border ${!r._valid ? 'bg-red-50/70' : ''}`}>
                              <td className="py-2 px-3 text-muted font-mono">{r._row}</td>
                              <td className="py-2 px-3 font-medium">{r.component_code}</td>
                              <td className="py-2 px-3">{r.component_name}</td>
                              <td className="py-2 px-3 text-right font-numbers">{r.current_stock}</td>
                              <td className="py-2 px-3 text-right text-muted">{r.incoming_quantity}</td>
                              <td className="py-2 px-3 text-right text-muted">{r.reserved_quantity}</td>
                              <td className="py-2 px-3">
                                {r._valid ? (
                                  <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-medium">Valid</span>
                                ) : (
                                  <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-medium">{r._errors[0]}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={resetUpload} className="border-border">Cancel</Button>
                      <Button onClick={handleConfirmUpload} disabled={isUploading || rows.filter(r => r._valid).length === 0}
                        className="bg-primary text-white">
                        {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <>Import {rows.filter(r => r._valid).length} Records</>}
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
