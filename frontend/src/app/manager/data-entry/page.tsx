'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  Download,
  FileText,
  X,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
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

interface ParsedRow {
  date: string;
  shift: string;
  machine: string;
  product_name: string;
  target_quantity: number;
  actual_quantity: number;
  rejected_quantity: number;
  downtime_minutes: number;
  notes?: string;
  _valid: boolean;
  _errors: string[];
  _row: number;
}

// Predefined Automotive Brake Components list
const BRAKE_PARTS_OPTIONS = [
  { code: 'BRAKE-ASSY-001', name: 'Automotive Brake Assembly' },
  { code: 'BRK-DISC-001', name: 'Brake Disc Rotor' },
  { code: 'BRK-CAL-001', name: 'Brake Caliper Assembly' },
  { code: 'BRK-PAD-001', name: 'Brake Pad Set Heavy Duty' },
  { code: 'BRK-PST-001', name: 'Hydraulic Brake Piston' },
  { code: 'BRK-CBR-001', name: 'Caliper Mounting Bracket' },
  { code: 'BRK-GPN-001', name: 'Stainless Steel Guide Pin' },
  { code: 'BRK-SRG-001', name: 'High-Temp Rubber Seal Ring' },
  { code: 'BRK-DBT-001', name: 'Neoprene Dust Boot' },
  { code: 'BRK-BLT-001', name: 'Fastener Bolt Kit' },
  { code: 'BRK-WSR-001', name: 'Electronic Brake Wear Sensor' },
];

const REQUIRED_COLUMNS = ['date', 'shift', 'machine', 'product_name', 'target_quantity', 'actual_quantity'];

function downloadBrakePartsTemplate() {
  const headers = ['date', 'shift', 'machine', 'product_name', 'target_quantity', 'actual_quantity', 'rejected_quantity', 'downtime_minutes', 'notes'];
  const today = new Date().toISOString().split('T')[0];
  const examples = [
    [today, 'Morning', 'CNC-01', 'Brake Pad Set Heavy Duty', '1500', '1450', '12', '15', 'Regular maintenance completed on shift start'],
    [today, 'Morning', 'LATHE-02', 'Brake Disc Rotor', '800', '780', '8', '20', 'Tool tip change done at 10 AM'],
    [today, 'Evening', 'PRESS-01', 'Brake Caliper Assembly', '600', '590', '5', '0', 'Normal operation']
  ];
  const csvContent = [headers.join(','), ...examples.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'brake_parts_production_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function validateRow(row: Record<string, any>, index: number): ParsedRow {
  const errors: string[] = [];

  REQUIRED_COLUMNS.forEach((col) => {
    if (!row[col] && row[col] !== 0) errors.push(`Missing: ${col}`);
  });

  const date = String(row.date || '');
  const shift = String(row.shift || '');
  const machine = String(row.machine || '');
  const product_name = String(row.product_name || row.product || '');
  const target_quantity = Number(row.target_quantity || row.target_qty || 0);
  const actual_quantity = Number(row.actual_quantity || row.actual_qty || 0);
  const rejected_quantity = Number(row.rejected_quantity || row.rejected_qty || 0);
  const downtime_minutes = Number(row.downtime_minutes || row.downtime || 0);

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Date must be YYYY-MM-DD');
  if (shift && !['Morning', 'Evening', 'Night'].includes(shift)) errors.push('Shift must be Morning/Evening/Night');
  if (isNaN(target_quantity) || target_quantity < 0) errors.push('Invalid target_quantity');
  if (isNaN(actual_quantity) || actual_quantity < 0) errors.push('Invalid actual_quantity');

  return {
    date,
    shift,
    machine,
    product_name,
    target_quantity: isNaN(target_quantity) ? 0 : target_quantity,
    actual_quantity: isNaN(actual_quantity) ? 0 : actual_quantity,
    rejected_quantity: isNaN(rejected_quantity) ? 0 : rejected_quantity,
    downtime_minutes: isNaN(downtime_minutes) ? 0 : downtime_minutes,
    notes: String(row.notes || ''),
    _valid: errors.length === 0,
    _errors: errors,
    _row: index + 2,
  };
}

async function parseFile(file: File): Promise<ParsedRow[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

  const normalized = raw.map((r) => {
    const obj: Record<string, any> = {};
    Object.entries(r).forEach(([k, v]) => {
      const normalKey = k.trim().toLowerCase().replace(/\s+/g, '_');
      if (v instanceof Date) {
        obj[normalKey] = v.toISOString().split('T')[0];
      } else {
        obj[normalKey] = v;
      }
    });
    return obj;
  });

  return normalized.map((r, i) => validateRow(r, i));
}

export default function ManualDataEntryPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('Brake Pad Set Heavy Duty');
  const [customProduct, setCustomProduct] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bulk Upload State
  const [uploadStep, setUploadStep] = useState<'idle' | 'parsing' | 'preview' | 'uploading' | 'done'>('idle');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploadResult, setUploadResult] = useState<{ inserted: number; failed: number } | null>(null);
  const [uploadError, setUploadError] = useState('');

  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);

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

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const finalProductName = selectedProduct === 'CUSTOM' ? customProduct : selectedProduct;

    if (!finalProductName) {
      setErrors({ productName: 'Please select or enter a Brake Part name' });
      setLoading(false);
      return;
    }

    const payload = {
      date: formData.get('date'),
      shift: formData.get('shift'),
      machineCode: formData.get('machine'),
      productName: finalProductName,
      targetQuantity: parseInt(formData.get('targetQty') as string),
      actualQuantity: parseInt(formData.get('actualQty') as string),
      rejectedQuantity: parseInt(formData.get('rejectedQty') as string) || 0,
      downtimeMinutes: parseInt(formData.get('downtime') as string) || 0,
      notes: formData.get('notes'),
    };

    try {
      await apiPost('/api/production', payload);
      setToast({ type: 'success', message: `Production data for "${finalProductName}" saved successfully!` });
      formRef.current?.reset();
      setSelectedProduct('Brake Pad Set Heavy Duty');
      setCustomProduct('');
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save production data' });
    }

    setLoading(false);
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setUploadError('');
    setUploadStep('parsing');

    try {
      const parsed = await parseFile(file);
      setRows(parsed);
      setUploadStep('preview');
    } catch (err: any) {
      setUploadError('Failed to parse file: ' + err.message);
      setUploadStep('idle');
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmBatchUpload = async () => {
    if (!validRows.length) return;
    setUploadStep('uploading');

    const formDataRows = validRows.map((r) => ({
      date: r.date,
      shift: r.shift,
      machine: r.machine,
      product: r.product_name,
      targetQty: String(r.target_quantity),
      actualQty: String(r.actual_quantity),
      rejectedQty: String(r.rejected_quantity),
      downtime: String(r.downtime_minutes),
      notes: r.notes || '',
    }));

    try {
      const result = await apiPost<{ inserted: number; failed: number }>('/api/production/batch', { records: formDataRows });
      setUploadResult(result);
      setUploadStep('done');
      setToast({ type: 'success', message: `Imported ${result.inserted} Brake Parts production records!` });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload batch records');
      setUploadStep('preview');
    }
  };

  const resetUpload = () => {
    setRows([]);
    setFileName('');
    setUploadResult(null);
    setUploadError('');
    setUploadStep('idle');
    if (fileRef.current) fileRef.current.value = '';
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <ManagerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard">
              <Button variant="outline" size="icon" className="border-border">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Brake Parts Production Data Entry</h1>
              <p className="text-sm text-muted">
                {user?.department || 'Production'} Department · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadBrakePartsTemplate} className="border-border gap-2 text-xs font-semibold">
            <Download className="w-4 h-4 text-primary" />
            Download Excel Template
          </Button>
        </div>

        {/* Entry Method Tabs: Manual vs Excel Upload */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Manual Entry Form
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Excel / CSV File
          </button>
        </div>

        {/* TAB 1: MANUAL ENTRY FORM */}
        {activeTab === 'manual' && (
          <Card className="p-8 border border-border shadow-sm">
            <form ref={formRef} onSubmit={handleManualSubmit} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-semibold text-foreground text-base">Shift Production Details</h3>
                <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full border border-blue-200">
                  Automotive Brake Division
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="date">Production Date <span className="text-red-500">*</span></Label>
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

                {/* Shift */}
                <div className="space-y-1.5">
                  <Label htmlFor="shift">Shift <span className="text-red-500">*</span></Label>
                  <Select id="shift" name="shift" required defaultValue="Morning" className={errors.shift ? 'border-red-400' : ''}>
                    <option value="Morning">Morning (6 AM – 2 PM)</option>
                    <option value="Evening">Evening (2 PM – 10 PM)</option>
                    <option value="Night">Night (10 PM – 6 AM)</option>
                  </Select>
                  {errors.shift && <p className="text-xs text-red-500">{errors.shift}</p>}
                </div>

                {/* Machine */}
                <div className="space-y-1.5">
                  <Label htmlFor="machine">Production Machine <span className="text-red-500">*</span></Label>
                  <Select id="machine" name="machine" required defaultValue="" className={errors.machineCode ? 'border-red-400' : ''}>
                    <option value="" disabled>Select machine</option>
                    {machines.length === 0 ? (
                      <option disabled>Loading machines...</option>
                    ) : (
                      machines.map((m) => (
                        <option key={m.id} value={m.machine_code}>
                          {m.machine_code} — {m.machine_name} {m.status !== 'RUNNING' ? `(${m.status})` : ''}
                        </option>
                      ))
                    )}
                  </Select>
                  {errors.machineCode && <p className="text-xs text-red-500">{errors.machineCode}</p>}
                </div>

                {/* Product / Brake Part Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="productSelect">Brake Part / Component <span className="text-red-500">*</span></Label>
                  <Select
                    id="productSelect"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    {BRAKE_PARTS_OPTIONS.map((part) => (
                      <option key={part.code} value={part.name}>
                        {part.name} ({part.code})
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom / Other Brake Part...</option>
                  </Select>
                </div>

                {/* Custom Product Input if Selected */}
                {selectedProduct === 'CUSTOM' && (
                  <div className="space-y-1.5 md:col-span-2 bg-slate-50 p-3 rounded-lg border border-border">
                    <Label htmlFor="customProduct">Specify Custom Brake Part Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="customProduct"
                      value={customProduct}
                      onChange={(e) => setCustomProduct(e.target.value)}
                      placeholder="e.g. Dual Brake Booster Valve, Ceramic Pad B2"
                      required
                    />
                  </div>
                )}

                {/* Target Qty */}
                <div className="space-y-1.5">
                  <Label htmlFor="targetQty">Target Quantity (Units) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    id="targetQty"
                    name="targetQty"
                    min="1"
                    placeholder="e.g. 1500"
                    required
                    className={errors.targetQuantity ? 'border-red-400' : ''}
                  />
                  {errors.targetQuantity && <p className="text-xs text-red-500">{errors.targetQuantity}</p>}
                </div>

                {/* Actual Produced Qty */}
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

                {/* Rejected Qty */}
                <div className="space-y-1.5">
                  <Label htmlFor="rejectedQty">Scrap / Defective Qty (Units)</Label>
                  <Input
                    type="number"
                    id="rejectedQty"
                    name="rejectedQty"
                    min="0"
                    defaultValue="0"
                  />
                </div>

                {/* Downtime */}
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

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Shift Notes / Quality Observations (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Record any brake lining wear tests, machine calibration notes, or material defect observations..."
                />
              </div>

              {/* Action Bar */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <div className="text-xs text-muted flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Have multiple records? <button type="button" onClick={() => setActiveTab('upload')} className="text-primary font-semibold hover:underline">Upload via Excel</button></span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
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
                      <><Save className="w-4 h-4 mr-2" /> Save Production Record</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 2: EXCEL / CSV BULK UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {uploadStep === 'done' && uploadResult ? (
              <Card className="p-10 text-center border border-border">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Brake Parts Import Complete!</h2>
                <p className="text-muted mb-6">
                  <span className="text-green-600 font-semibold">{uploadResult.inserted} records</span> imported successfully to live database.
                  {uploadResult.failed > 0 && (
                    <span className="text-red-600"> · {uploadResult.failed} failed</span>
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetUpload} variant="outline">Upload Another File</Button>
                  <Link href="/manager/history">
                    <Button className="bg-primary text-white">View Submission History</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  {/* Drop zone */}
                  {(uploadStep === 'idle' || uploadStep === 'parsing') && (
                    <Card
                      className="p-10 border-2 border-dashed border-primary/30 rounded-xl bg-blue-50/20 flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary transition-all cursor-pointer shadow-xs"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                      />
                      {uploadStep === 'parsing' ? (
                        <><Loader2 className="w-10 h-10 text-primary animate-spin mb-4" /><p className="text-muted font-medium">Parsing Brake Parts file...</p></>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-white shadow-md rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="text-base font-bold text-foreground mb-1">Upload Brake Parts Excel / CSV Sheet</h3>
                          <p className="text-xs text-muted mb-4 max-w-md">
                            Drag and drop your daily shift production file here, or click to browse. Supports <strong>.xlsx, .xls, and .csv</strong> files.
                          </p>
                          <Button className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-6">
                            Choose File
                          </Button>
                        </>
                      )}
                    </Card>
                  )}

                  {/* Preview Table & Validation */}
                  {(uploadStep === 'preview' || uploadStep === 'uploading') && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-sm text-foreground">{fileName}</span>
                          <button onClick={resetUpload} className="text-xs text-muted hover:text-red-500 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                            ✓ {validRows.length} Valid
                          </span>
                          {invalidRows.length > 0 && (
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                              ⚠ {invalidRows.length} Invalid
                            </span>
                          )}
                        </div>
                      </div>

                      <Card className="overflow-hidden border border-border">
                        <div className="overflow-x-auto max-h-80">
                          <table className="w-full text-xs">
                            <thead className="bg-background border-b border-border sticky top-0 font-semibold">
                              <tr>
                                <th className="text-left py-2 px-3 text-muted">Row</th>
                                <th className="text-left py-2 px-3 text-muted">Date</th>
                                <th className="text-left py-2 px-3 text-muted">Shift</th>
                                <th className="text-left py-2 px-3 text-muted">Machine</th>
                                <th className="text-left py-2 px-3 text-muted">Brake Part Name</th>
                                <th className="text-right py-2 px-3 text-muted">Target</th>
                                <th className="text-right py-2 px-3 text-muted">Actual</th>
                                <th className="text-left py-2 px-3 text-muted">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr key={r._row} className={`border-b border-border last:border-0 ${!r._valid ? 'bg-red-50/70' : 'hover:bg-background'}`}>
                                  <td className="py-2 px-3 text-muted font-mono">{r._row}</td>
                                  <td className="py-2 px-3 font-medium">{r.date}</td>
                                  <td className="py-2 px-3 text-muted">{r.shift}</td>
                                  <td className="py-2 px-3 font-mono">{r.machine}</td>
                                  <td className="py-2 px-3 font-medium truncate max-w-[150px]">{r.product_name}</td>
                                  <td className="py-2 px-3 text-right text-muted">{r.target_quantity}</td>
                                  <td className="py-2 px-3 text-right font-semibold">{r.actual_quantity}</td>
                                  <td className="py-2 px-3">
                                    {r._valid ? (
                                      <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-medium">Ready</span>
                                    ) : (
                                      <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-medium">
                                        {r._errors[0]}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>

                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={resetUpload} className="border-border">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmBatchUpload}
                          disabled={validRows.length === 0 || uploadStep === 'uploading'}
                          className="bg-primary hover:bg-primary/90 text-white px-8"
                          id="confirm-import-btn"
                        >
                          {uploadStep === 'uploading' ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing Records...</>
                          ) : (
                            <>Import {validRows.length} Valid Brake Part Records</>
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {uploadError}
                    </div>
                  )}
                </div>

                {/* Sidebar Guide */}
                <div>
                  <Card className="p-5 border border-border space-y-4">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      Brake Parts File Columns
                    </h3>
                    <p className="text-xs text-muted">Ensure your Excel sheet contains the following exact column headers:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {REQUIRED_COLUMNS.map((col) => (
                        <span key={col} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-border rounded font-mono font-medium">
                          {col}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted mb-3">Pre-configured Brake Components:</p>
                      <ul className="text-xs text-muted space-y-1.5 list-disc pl-4">
                        <li>Brake Pad Set Heavy Duty</li>
                        <li>Brake Disc Rotor</li>
                        <li>Brake Caliper Assembly</li>
                        <li>Hydraulic Brake Piston</li>
                      </ul>
                    </div>
                    <Button variant="outline" onClick={downloadBrakePartsTemplate} className="w-full text-xs border-border gap-2">
                      <Download className="w-3.5 h-3.5 text-primary" />
                      Download Sample Template
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
