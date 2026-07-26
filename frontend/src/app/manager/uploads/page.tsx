'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileSpreadsheet, ArrowLeft, Download, CheckCircle2, AlertCircle, Loader2, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useCallback } from 'react';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

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

interface UploadStep {
  step: 'idle' | 'parsing' | 'preview' | 'uploading' | 'done';
}

const REQUIRED_COLUMNS = ['date', 'shift', 'machine', 'product_name', 'target_quantity', 'actual_quantity'];

function downloadTemplate() {
  const headers = ['date', 'shift', 'machine', 'product_name', 'target_quantity', 'actual_quantity', 'rejected_quantity', 'downtime_minutes', 'notes'];
  const example = [
    new Date().toISOString().split('T')[0],
    'Morning',
    'CNC-01',
    'Steel Bracket A4',
    '500',
    '480',
    '5',
    '15',
    'Routine shift notes here'
  ];
  const csvContent = [headers.join(','), example.join(',')].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'production_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function validateRow(row: Record<string, any>, index: number): ParsedRow {
  const errors: string[] = [];

  // Check required fields
  REQUIRED_COLUMNS.forEach((col) => {
    if (!row[col] && row[col] !== 0) errors.push(`Missing: ${col}`);
  });

  const date = String(row.date || '');
  const shift = String(row.shift || '');
  const machine = String(row.machine || '');
  const product_name = String(row.product_name || '');
  const target_quantity = Number(row.target_quantity);
  const actual_quantity = Number(row.actual_quantity);
  const rejected_quantity = Number(row.rejected_quantity || 0);
  const downtime_minutes = Number(row.downtime_minutes || 0);

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

  // Normalize column names: lowercase, trim, replace spaces with _
  const normalized = raw.map((r) => {
    const obj: Record<string, any> = {};
    Object.entries(r).forEach(([k, v]) => {
      const normalKey = k.trim().toLowerCase().replace(/\s+/g, '_');
      // Handle Excel date objects
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

export default function BulkUploadPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadStep>({ step: 'idle' });
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploadResult, setUploadResult] = useState<{ inserted: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    setUploadState({ step: 'parsing' });

    try {
      const parsed = await parseFile(file);
      setRows(parsed);
      setUploadState({ step: 'preview' });
    } catch (err: any) {
      setError('Failed to parse file: ' + err.message);
      setUploadState({ step: 'idle' });
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!validRows.length) return;
    setUploadState({ step: 'uploading' });

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

    const result = await apiPost<{ inserted: number; failed: number }>('/api/production/batch', { records: formDataRows });
    setUploadResult(result);
    setUploadState({ step: 'done' });
  };

  const reset = () => {
    setRows([]);
    setFileName('');
    setUploadResult(null);
    setError('');
    setUploadState({ step: 'idle' });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <ManagerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard">
              <Button variant="outline" size="icon" className="border-border">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bulk Upload (Excel/CSV)</h1>
              <p className="text-sm text-muted">{user?.department || 'Production'} Department</p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 text-xs text-muted">
          {['Select File', 'Validate', 'Preview', 'Import'].map((s, i) => {
            const stepMap: Record<string, number> = { idle: 0, parsing: 1, preview: 2, uploading: 3, done: 4 };
            const current = stepMap[uploadState.step];
            return (
              <div key={s} className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${current > i ? 'bg-green-500 text-white' : current === i ? 'bg-primary text-white' : 'bg-border text-muted'}`}>
                  {current > i ? '✓' : i + 1}
                </span>
                <span className={current >= i ? 'text-foreground font-medium' : ''}>{s}</span>
                {i < 3 && <ChevronRight className="w-3 h-3" />}
              </div>
            );
          })}
        </div>

        {uploadState.step === 'done' && uploadResult ? (
          <Card className="p-10 text-center border border-border">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Upload Complete!</h2>
            <p className="text-muted mb-6">
              <span className="text-green-600 font-semibold">{uploadResult.inserted} records</span> imported successfully.
              {uploadResult.failed > 0 && (
                <span className="text-red-600"> · {uploadResult.failed} failed</span>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} variant="outline">Upload Another File</Button>
              <Link href="/manager/history">
                <Button className="bg-primary text-white">View Submission History</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main upload + preview */}
            <div className="lg:col-span-2 space-y-5">
              {/* Drop zone */}
              {(uploadState.step === 'idle' || uploadState.step === 'parsing') && (
                <Card
                  className="p-10 border-2 border-dashed border-border rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary/40 transition-colors cursor-pointer"
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
                  {uploadState.step === 'parsing' ? (
                    <><Loader2 className="w-10 h-10 text-primary animate-spin mb-4" /><p className="text-muted">Parsing file...</p></>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-5">
                        <UploadCloud className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-2">Drag & Drop your file here</h3>
                      <p className="text-sm text-muted mb-5 max-w-sm">
                        Supports .xlsx, .xls, and .csv files. Use the template for correct column format.
                      </p>
                      <Button className="bg-primary hover:bg-primary/90 text-white">Browse Files</Button>
                    </>
                  )}
                </Card>
              )}

              {/* Validation Summary */}
              {(uploadState.step === 'preview' || uploadState.step === 'uploading') && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileSpreadsheet className="w-4 h-4 text-muted" />
                        <span className="text-foreground">{fileName}</span>
                      </div>
                      <button onClick={reset} className="text-xs text-muted hover:text-red-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {validRows.length} Valid
                      </span>
                      {invalidRows.length > 0 && (
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertCircle className="w-4 h-4" /> {invalidRows.length} Invalid
                        </span>
                      )}
                      <span className="text-muted">· {rows.length} Total</span>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <Card className="overflow-hidden border border-border">
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-sm">
                        <thead className="bg-background border-b border-border sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Row</th>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Date</th>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Shift</th>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Machine</th>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Product</th>
                            <th className="text-right py-2 px-3 text-xs text-muted font-medium">Target</th>
                            <th className="text-right py-2 px-3 text-xs text-muted font-medium">Actual</th>
                            <th className="text-left py-2 px-3 text-xs text-muted font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r._row} className={`border-b border-border last:border-0 ${!r._valid ? 'bg-red-50' : 'hover:bg-background'}`}>
                              <td className="py-2 px-3 text-muted text-xs">{r._row}</td>
                              <td className="py-2 px-3 text-foreground">{r.date}</td>
                              <td className="py-2 px-3 text-muted">{r.shift}</td>
                              <td className="py-2 px-3 text-foreground">{r.machine}</td>
                              <td className="py-2 px-3 text-foreground max-w-[120px] truncate">{r.product_name}</td>
                              <td className="py-2 px-3 text-right text-muted">{r.target_quantity}</td>
                              <td className="py-2 px-3 text-right text-foreground">{r.actual_quantity}</td>
                              <td className="py-2 px-3">
                                {r._valid ? (
                                  <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Valid</span>
                                ) : (
                                  <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded" title={r._errors.join(', ')}>
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
                    <Button variant="outline" onClick={reset} className="border-border">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmUpload}
                      disabled={validRows.length === 0 || uploadState.step === 'uploading'}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                      id="confirm-import-btn"
                    >
                      {uploadState.step === 'uploading' ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                      ) : (
                        <>Import {validRows.length} Valid Records</>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Instructions Sidebar */}
            <div>
              <Card className="p-5 border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  Upload Instructions
                </h3>
                <ul className="space-y-4 text-sm text-muted">
                  {[
                    { step: 1, text: 'Download the production_template.csv using the button above.' },
                    { step: 2, text: 'Fill in your data. Do NOT change column headers.' },
                    { step: 3, text: 'Date format: YYYY-MM-DD. Shift must be Morning/Evening/Night.' },
                    { step: 4, text: 'Upload here. Invalid rows are highlighted in red.' },
                    { step: 5, text: 'Review validation results, then click Import.' },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-xs font-medium text-primary">
                        {step}
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs text-muted font-medium mb-2">Required Columns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REQUIRED_COLUMNS.map((col) => (
                      <span key={col} className="text-[10px] px-2 py-0.5 bg-background border border-border rounded font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
