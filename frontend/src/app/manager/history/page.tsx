'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, FileDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

interface HistoryRecord {
  id: string;
  date: string;
  shift: string;
  product_name: string;
  target_quantity: number;
  actual_quantity: number;
  rejected_quantity: number;
  downtime_minutes: number;
  created_at: string;
  machine_code: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterShift, setFilterShift] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res: any = await apiGet('/api/production?limit=200');
        const data = res.data ?? [];
        const formatted = data.map((d: any) => ({
          id: d.id,
          date: d.date,
          shift: d.shift || '',
          product_name: d.productName || '',
          target_quantity: d.targetQuantity || 0,
          actual_quantity: d.actualQuantity || 0,
          rejected_quantity: d.rejectedQuantity || 0,
          downtime_minutes: d.downtimeMinutes || 0,
          created_at: d.createdAt || d.date,
          machine_code: d.machineCode || 'Unknown',
        }));

        let filtered = formatted;
        if (filterShift !== 'All') {
          filtered = filtered.filter((r: any) => r.shift === filterShift);
        }
        if (search) {
          filtered = filtered.filter((r: any) =>
            r.product_name.toLowerCase().includes(search.toLowerCase())
          );
        }
        setRecords(filtered);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [search, filterShift]);

  const handleExport = async () => {
    if (records.length === 0) return;
    const XLSX = await import('xlsx');
    const dataToExport = records.map(r => ({
      Date: r.date,
      Shift: r.shift,
      Machine: r.machine_code,
      Product: r.product_name,
      'Target Qty': r.target_quantity,
      'Actual Qty': r.actual_quantity,
      Rejects: r.rejected_quantity,
      'Downtime (mins)': r.downtime_minutes,
      'Submitted At': new Date(r.created_at).toLocaleString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production History");
    XLSX.writeFile(workbook, "production_history.xlsx");
  };

  return (
    <ManagerLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard">
              <Button variant="outline" size="icon" className="border-border">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Submission History</h1>
              <p className="text-sm text-muted">View past records for {user?.department || 'Production'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={records.length === 0} className="border-border">
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted" />
              <Select value={filterShift} onChange={(e: any) => setFilterShift(e.target.value)} className="w-full sm:w-40">
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium text-muted">Date</th>
                  <th className="py-3 px-4 font-medium text-muted">Shift</th>
                  <th className="py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="py-3 px-4 font-medium text-muted">Product</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Target</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Actual</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Rejects</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Downtime</th>
                  <th className="py-3 px-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading history...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted">
                      No records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const pct = r.target_quantity > 0 ? (r.actual_quantity / r.target_quantity) * 100 : 0;
                    return (
                      <tr key={r.id} className="border-b border-border hover:bg-background">
                        <td className="py-3 px-4 text-foreground whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4 text-muted">{r.shift}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{r.machine_code}</td>
                        <td className="py-3 px-4 text-foreground">{r.product_name}</td>
                        <td className="py-3 px-4 text-right text-muted">{r.target_quantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">{r.actual_quantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-danger">{r.rejected_quantity}</td>
                        <td className="py-3 px-4 text-right text-muted">{r.downtime_minutes}m</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-medium ${pct >= 100 ? 'bg-green-100 text-green-700' : pct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {pct >= 100 ? 'Achieved' : pct >= 80 ? 'Near Target' : 'Under Target'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ManagerLayout>
  );
}
