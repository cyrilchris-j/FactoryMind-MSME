'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap, Loader2, RefreshCw, Cpu, TrendingUp, Gauge
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function EnergyPage() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ totalKwh: 0, totalAmps: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/machine-energy/overview');
      setMachinesData(res.data ?? []);
      setTotals({ totalKwh: res.totalKwh || 0, totalAmps: res.totalAmps || 0 });
    } catch (err) {
      console.error('Failed to fetch energy data', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" /> Energy
            </h1>
            <p className="text-muted text-sm">Machine-wise energy consumption & current</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <Zap className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totals.totalKwh.toLocaleString()} kWh</p>
            <p className="text-sm text-muted">Total Energy Today</p>
          </Card>
          <Card className="p-5">
            <Gauge className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totals.totalAmps.toLocaleString()} A</p>
            <p className="text-sm text-muted">Total Current Draw</p>
          </Card>
          <Card className="p-5">
            <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {loading ? '—' : machinesData.length > 0 ? (totals.totalKwh / machinesData.length).toFixed(1) : 0} kWh
            </p>
            <p className="text-sm text-muted">Avg per Machine</p>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Machine-wise Energy Consumption</h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Machine</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Manager</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Energy (kWh)</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Current (Amps)</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Parts Produced</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">kWh / Part</th>
                  </tr>
                </thead>
                <tbody>
                  {machinesData.map((m: any) => {
                    const kwhPerPart = m.partsProduced > 0 ? ((m.energyKwh || 0) / m.partsProduced).toFixed(2) : '-';
                    return (
                      <tr key={m.machineNumber} className="border-b border-border last:border-0 hover:bg-background">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-foreground">Machine {m.machineNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{m.managerName}</td>
                        <td className="py-3 px-4 text-right font-numbers font-bold">{m.energyKwh || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers">{m.currentAmps || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers text-muted">{m.partsProduced || 0}</td>
                        <td className="py-3 px-4 text-right font-numbers text-muted">{kwhPerPart}</td>
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
