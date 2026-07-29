'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, UserCheck, UserX, Loader2, RefreshCw, Cpu, TrendingUp
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function WorkforcePage() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/managers-with-machines');
      setMachinesData(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch workforce data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPresent = machinesData.reduce((s: number, m: any) => s + (m.workersPresent || 0), 0);
  const totalAbsent = machinesData.reduce((s: number, m: any) => s + (m.workersAbsent || 0), 0);
  const totalWorkers = totalPresent + totalAbsent;
  const attendanceRate = totalWorkers > 0 ? Math.round((totalPresent / totalWorkers) * 100) : 0;

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Workforce
            </h1>
            <p className="text-muted text-sm">Machine-wise worker attendance</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totalWorkers}</p>
            <p className="text-sm text-muted">Total Workers</p>
          </Card>
          <Card className="p-5">
            <UserCheck className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">{loading ? '—' : totalPresent}</p>
            <p className="text-sm text-muted">Present Today</p>
          </Card>
          <Card className="p-5">
            <UserX className="w-5 h-5 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{loading ? '—' : totalAbsent}</p>
            <p className="text-sm text-muted">Absent Today</p>
          </Card>
          <Card className="p-5">
            <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : attendanceRate}%</p>
            <p className="text-sm text-muted">Attendance Rate</p>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Machine-wise Attendance</h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Machine</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Manager</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Present</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Absent</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Total</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {machinesData.map((m: any) => {
                    const total = (m.workersPresent || 0) + (m.workersAbsent || 0);
                    const pct = total > 0 ? Math.round((m.workersPresent / total) * 100) : 0;
                    return (
                      <tr key={m.machineNumber} className="border-b border-border last:border-0 hover:bg-background">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-foreground">Machine {m.machineNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{m.managerName}</td>
                        <td className="py-3 px-4 text-right font-numbers text-green-600">{m.workersPresent || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers text-red-600">{m.workersAbsent || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers">{total}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${pct >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
