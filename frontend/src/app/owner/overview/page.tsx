'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Cpu, Users, UserCheck, UserX, Target, AlertTriangle, RefreshCw, Loader2, Award
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function MachineOverviewPage() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/managers-with-machines');
      setMachinesData(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch machine overview data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate Stats
  const totalPresent = machinesData.reduce((s: number, m: any) => s + (m.workersPresent || 0), 0);
  const totalAbsent = machinesData.reduce((s: number, m: any) => s + (m.workersAbsent || 0), 0);
  const totalWorkers = totalPresent + totalAbsent;
  const attendanceRate = totalWorkers > 0 ? Math.round((totalPresent / totalWorkers) * 100) : 0;

  const totalProduction = machinesData.reduce((s: number, m: any) => s + (m.partsProduced || 0), 0);
  const totalDefects = machinesData.reduce((s: number, m: any) => s + (m.defects || 0), 0);
  const averageDefectRate = totalProduction > 0 ? ((totalDefects / totalProduction) * 100).toFixed(1) : '0.0';

  return (
    <OwnerLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" /> Machine Overview
            </h1>
            <p className="text-muted text-sm">Combined machine production status and worker attendance</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border self-start sm:self-center">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border-border">
            <div>
              <p className="text-sm text-muted">Total Production</p>
              <p className="text-2xl font-bold text-foreground mt-1">{loading ? '—' : totalProduction.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-border">
            <div>
              <p className="text-sm text-muted">Total Defects</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{loading ? '—' : `${totalDefects.toLocaleString()} (${averageDefectRate}%)`}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-border">
            <div>
              <p className="text-sm text-muted">Present Employees</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{loading ? '—' : `${totalPresent} / ${totalWorkers}`}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-border">
            <div>
              <p className="text-sm text-muted">Absent Employees</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{loading ? '—' : totalAbsent}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Machine Status & Workforce Report</h2>
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200 text-slate-700">
              Today's Live Records
            </Badge>
          </div>

          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted text-sm">Loading overview data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Machine</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Manager Name</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Total Parts</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Good Products</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Defect</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Total Workers</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Present</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">Absent</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted">kWh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {machinesData.map((m: any) => {
                    const totalMembers = (m.workersPresent || 0) + (m.workersAbsent || 0);
                    const goodProduct = Math.max(0, (m.partsProduced || 0) - (m.defects || 0));

                    return (
                      <tr key={m.machineNumber} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-primary" />
                            <span>Machine {m.machineNumber}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-foreground">
                          {m.managerName === 'Unassigned' ? (
                            <span className="text-muted text-center">-</span>
                          ) : (
                            <span className="font-medium">{m.managerName}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-numbers text-foreground font-semibold">{m.partsProduced || 0}</td>
                        <td className="py-3.5 px-4 text-right font-numbers text-green-600 font-semibold">{goodProduct}</td>
                        <td className={`py-3.5 px-4 text-right font-numbers ${m.defects > 0 ? 'text-red-500 font-medium' : 'text-muted'}`}>
                          {m.defects || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-numbers text-foreground">{totalMembers}</td>
                        <td className="py-3.5 px-4 text-right font-numbers text-green-600 font-medium">+{m.workersPresent || 0}</td>
                        <td className="py-3.5 px-4 text-right font-numbers text-red-500">{m.workersAbsent || 0}</td>
                        <td className="py-3.5 px-4 text-right font-numbers text-amber-600 font-medium">{m.energyKwh || 0}</td>
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
