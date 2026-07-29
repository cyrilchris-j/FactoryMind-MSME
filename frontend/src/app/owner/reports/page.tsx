'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, Loader2, RefreshCw, Cpu, UserCircle, TrendingUp, AlertCircle, Zap
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function ReportsPage() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/managers-with-machines');
      setMachinesData(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadMachineCSV = (m: any) => {
    const headers = ['Metric', 'Value'];
    const defectPct = m.partsProduced > 0 ? ((m.defects / m.partsProduced) * 100).toFixed(1) : '0.0';
    const goodParts = (m.partsProduced || 0) - (m.defects || 0);
    const rows = [
      ['Machine', `Machine ${m.machineNumber}`],
      ['Manager', m.managerName],
      ['Parts Produced', m.partsProduced],
      ['Defects', m.defects],
      ['Defect %', defectPct + '%'],
      ['Good Parts', goodParts],
      ['Energy (kWh)', m.energyKwh || 0],
      ['Current (Amps)', m.currentAmps || 0],
      ['Workers Present', m.workersPresent || 0],
      ['Workers Absent', m.workersAbsent || 0],
      ['Report Date', new Date().toISOString().split('T')[0]],
    ];
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Machine_${m.machineNumber}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllCSV = () => {
    const headers = ['Machine', 'Manager', 'Parts Produced', 'Defects', 'Defect %', 'Good Parts', 'Energy (kWh)', 'Current (Amps)', 'Workers Present', 'Workers Absent'];
    const rows = machinesData.map((m: any) => {
      const defectPct = m.partsProduced > 0 ? ((m.defects / m.partsProduced) * 100).toFixed(1) : '0.0';
      return [m.machineNumber, m.managerName, m.partsProduced, m.defects, defectPct + '%', (m.partsProduced || 0) - (m.defects || 0), m.energyKwh || 0, m.currentAmps || 0, m.workersPresent || 0, m.workersAbsent || 0];
    });
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_Machines_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Machine Reports
            </h1>
            <p className="text-muted text-sm">Download machine-wise production reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={downloadAllCSV} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Download className="w-4 h-4" /> Download All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machinesData.map((m: any) => {
              const defectPct = m.partsProduced > 0 ? ((m.defects / m.partsProduced) * 100).toFixed(1) : '0.0';
              return (
                <Card key={m.machineNumber} className="p-5 hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Machine {m.machineNumber}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <UserCircle className="w-3 h-3" /> {m.managerName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <TrendingUp className="w-3 h-3" /> {m.partsProduced}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-700">{m.partsProduced}</p>
                      <p className="text-[10px] text-green-600">Parts</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-700">{m.defects}</p>
                      <p className="text-[10px] text-red-600">Defects</p>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-700">{defectPct}%</p>
                      <p className="text-[10px] text-amber-600">Defect %</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mb-4 px-1">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {m.energyKwh || 0} kWh</span>
                    <span>Good: {(m.partsProduced || 0) - (m.defects || 0)}</span>
                    <span>Workers: {m.workersPresent || 0}/{((m.workersPresent || 0) + (m.workersAbsent || 0))}</span>
                  </div>

                  <Button onClick={() => downloadMachineCSV(m)} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm">
                    <Download className="w-4 h-4" /> Download Report
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
