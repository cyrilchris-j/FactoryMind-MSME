'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, FileDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

interface HistoryRecord {
  id: string;
  date: string;
  machine_number: number;
  manager_name: string;
  parts_produced: number;
  defects: number;
  energy_kwh: number;
  workers_present: number;
  workers_absent: number;
  good_products: number;
  total_workers: number;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [allRecords, setAllRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res: any = await apiGet('/api/machine-production?limit=200');
        const data = res.data ?? [];
        const formatted = data.map((d: any) => {
          const partsVal = d.partsProduced || 0;
          const defectVal = d.defects || 0;
          const presentVal = d.workersPresent || 0;
          const absentVal = d.workersAbsent || 0;
          return {
            id: d.id,
            date: d.date,
            machine_number: d.machineNumber || 0,
            manager_name: d.managerName || 'Unknown',
            parts_produced: partsVal,
            defects: defectVal,
            energy_kwh: d.energyKwh || 0,
            workers_present: presentVal,
            workers_absent: absentVal,
            good_products: Math.max(0, partsVal - defectVal),
            total_workers: presentVal + absentVal,
            created_at: d.createdAt || d.date,
          };
        });

        setAllRecords(formatted);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const records = useMemo(() => {
    if (!search) return allRecords;
    return allRecords.filter(r =>
      r.manager_name.toLowerCase().includes(search.toLowerCase()) ||
      String(r.machine_number).includes(search)
    );
  }, [allRecords, search]);

  const handleExport = async () => {
    if (records.length === 0) return;
    const XLSX = await import('xlsx');
    const dataToExport = records.map(r => ({
      Date: r.date,
      Machine: `Machine ${r.machine_number}`,
      Manager: r.manager_name,
      'Total Parts': r.parts_produced,
      'Good Products': r.good_products,
      Defects: r.defects,
      'Total Workers': r.total_workers,
      'Present Workers': r.workers_present,
      'Absent Workers': r.workers_absent,
      'Energy (kWh)': r.energy_kwh,
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
              <p className="text-sm text-muted">View past records for Machine {user?.machineNumber || 'N/A'}</p>
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
                placeholder="Search by manager name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium text-muted">Date</th>
                  <th className="py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="py-3 px-4 font-medium text-muted">Manager</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Parts</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Good Products</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Defects</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Total Workers</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Present</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">Absent</th>
                  <th className="py-3 px-4 font-medium text-muted text-right">kWh</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading history...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      No records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    return (
                      <tr key={r.id} className="border-b border-border hover:bg-background">
                        <td className="py-3 px-4 text-foreground whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4 text-foreground font-medium whitespace-nowrap">Machine {r.machine_number}</td>
                        <td className="py-3 px-4 text-foreground whitespace-nowrap">{r.manager_name}</td>
                        <td className="py-3 px-4 text-right font-numbers">{r.parts_produced.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-numbers text-green-600 font-medium">{r.good_products.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-numbers text-danger">{r.defects}</td>
                        <td className="py-3 px-4 text-right font-numbers">{r.total_workers}</td>
                        <td className="py-3 px-4 text-right font-numbers">{r.workers_present}</td>
                        <td className="py-3 px-4 text-right font-numbers">{r.workers_absent}</td>
                        <td className="py-3 px-4 text-right font-numbers text-primary font-medium">{r.energy_kwh} kWh</td>
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
