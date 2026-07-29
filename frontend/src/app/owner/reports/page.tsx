'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, FileSpreadsheet, Loader2, RefreshCw,
  Cpu, TrendingUp, Zap, Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function ReportsPage() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [machinesRes, reportsRes] = await Promise.all([
        apiGet<any>('/api/managers-with-machines'),
        apiGet<any>('/api/production-reports'),
      ]);
      setMachinesData(machinesRes.data ?? []);
      setReports(reportsRes.data ?? []);
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadCSV = () => {
    const headers = ['Machine', 'Manager', 'Parts Produced', 'Defects', 'Defect %', 'Good Parts', 'Energy (kWh)', 'Workers Present'];
    const rows = machinesData.map((m: any) => {
      const defectPct = m.partsProduced > 0 ? ((m.defects / m.partsProduced) * 100).toFixed(1) : '0';
      return [m.machineNumber, m.managerName, m.partsProduced, m.defects, defectPct + '%', (m.partsProduced || 0) - (m.defects || 0), m.energyKwh || 0, m.workersPresent || 0];
    });
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalParts = machinesData.reduce((s: number, m: any) => s + (m.partsProduced || 0), 0);
  const totalDefects = machinesData.reduce((s: number, m: any) => s + (m.defects || 0), 0);
  const defectRate = totalParts > 0 ? ((totalDefects / totalParts) * 100).toFixed(1) : '0.0';
  const totalEnergy = machinesData.reduce((s: number, m: any) => s + (m.energyKwh || 0), 0);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Reports
            </h1>
            <p className="text-muted text-sm">Machine-wise production reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={downloadCSV} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <TrendingUp className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totalParts}</p>
            <p className="text-sm text-muted">Total Parts Produced</p>
          </Card>
          <Card className="p-5">
            <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{loading ? '—' : totalDefects}</p>
            <p className="text-sm text-muted">Total Defects ({defectRate}%)</p>
          </Card>
          <Card className="p-5">
            <Zap className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totalEnergy} kWh</p>
            <p className="text-sm text-muted">Total Energy</p>
          </Card>
          <Card className="p-5">
            <Users className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : reports.length}</p>
            <p className="text-sm text-muted">Excel Reports Uploaded</p>
          </Card>
        </div>

        {/* Machine-wise Production Report Table */}
        <Card className="p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Machine-wise Production Report</h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Machine</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Manager</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Parts</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Defects</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Defect %</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Good</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">kWh</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Workers</th>
                  </tr>
                </thead>
                <tbody>
                  {machinesData.map((m: any) => {
                    const dPct = m.partsProduced > 0 ? ((m.defects / m.partsProduced) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={m.machineNumber} className="border-b border-border last:border-0 hover:bg-background">
                        <td className="py-3 px-4"><Cpu className="w-4 h-4 inline text-blue-500 mr-1" /> Machine {m.machineNumber}</td>
                        <td className="py-3 px-4 text-foreground">{m.managerName}</td>
                        <td className="py-3 px-4 text-right font-numbers">{m.partsProduced}</td>
                        <td className={`py-3 px-4 text-right font-numbers ${parseFloat(dPct) > 5 ? 'text-red-600 font-bold' : ''}`}>{m.defects}</td>
                        <td className={`py-3 px-4 text-right ${parseFloat(dPct) > 5 ? 'text-red-600 font-bold' : 'text-muted'}`}>{dPct}%</td>
                        <td className="py-3 px-4 text-right font-numbers text-green-600">{(m.partsProduced || 0) - (m.defects || 0)}</td>
                        <td className="py-3 px-4 text-right font-numbers">{m.energyKwh || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers text-muted">{m.workersPresent || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Uploaded Reports */}
        <Card className="p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Excel Reports from Managers</h2>
          {loading ? (
            <div className="h-24 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : reports.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-border">
              <FileSpreadsheet className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-muted">No reports uploaded yet. Managers can upload Excel reports from their dashboard.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 20).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.managerName} &mdash; Machine {r.machineNumber}</p>
                      <p className="text-xs text-muted">{r.recordCount} records &bull; {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit' })}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                    const headers = Object.keys(r.records[0] || {});
                    const csv = [headers.join(','), ...r.records.map((row: any) => headers.map((h: string) => row[h]).join(','))].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report_machine_${r.machineNumber}_${r.createdAt?.split('T')[0] || 'today'}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
