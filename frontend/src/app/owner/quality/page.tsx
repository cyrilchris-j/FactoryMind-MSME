'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface QualityRecord {
  id: string;
  product: string;
  batch: string;
  inspectedQuantity: number;
  passedQuantity: number;
  rejectedQuantity: number;
  defectType: string;
  rejectionReason: string;
  date: string;
  shift: string;
  passRate: string;
  rejectionRate: string;
}

export default function QualityPage() {
  const [records, setRecords] = useState<QualityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuality = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/quality');
      setRecords(res?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch quality data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuality(); }, [fetchQuality]);

  const totals = records.reduce((acc, r) => ({
    inspected: acc.inspected + (r.inspectedQuantity || 0),
    passed: acc.passed + (r.passedQuantity || 0),
    rejected: acc.rejected + (r.rejectedQuantity || 0),
  }), { inspected: 0, passed: 0, rejected: 0 });

  const overallPassRate = totals.inspected > 0 ? ((totals.passed / totals.inspected) * 100).toFixed(1) : '0';

  return (
    <OwnerLayout>
      <div className="p-6 lg:p-8 max-w-350 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Quality Inspections
            </h1>
            <p className="text-sm text-muted">Brake Assembly quality control records</p>
          </div>
          <button onClick={fetchQuality} className="p-2 rounded-lg hover:bg-gray-100 text-muted">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted uppercase font-medium">Total Inspected</p>
            <p className="text-2xl font-bold font-numbers">{totals.inspected}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted uppercase font-medium">Passed</p>
            <p className="text-2xl font-bold font-numbers text-emerald-600">{totals.passed}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted uppercase font-medium">Rejected</p>
            <p className="text-2xl font-bold font-numbers text-red-600">{totals.rejected}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted uppercase font-medium">Pass Rate</p>
            <p className={`text-2xl font-bold font-numbers ${parseFloat(overallPassRate) >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>{overallPassRate}%</p>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
        ) : records.length === 0 ? (
          <Card className="p-8 text-center text-muted">No quality inspection records yet.</Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Shift</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Batch</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Inspected</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Passed</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Rejected</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Pass Rate</th>
                    <th className="px-4 py-3 text-left font-medium text-muted">Defect Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-numbers">{r.date}</td>
                      <td className="px-4 py-3">{r.shift || '-'}</td>
                      <td className="px-4 py-3 font-medium">{r.batch || '-'}</td>
                      <td className="px-4 py-3 text-right font-numbers">{r.inspectedQuantity}</td>
                      <td className="px-4 py-3 text-right font-numbers text-emerald-600">{r.passedQuantity}</td>
                      <td className="px-4 py-3 text-right font-numbers text-red-600">{r.rejectedQuantity}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className={parseFloat(r.passRate) >= 95 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {r.passRate}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.defectType || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </OwnerLayout>
  );
}
