'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, TrendingDown, TrendingUp, AlertTriangle,
  Search, Filter, Loader2, RefreshCw, IndianRupee, Activity
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface EnergyRecord {
  id: string;
  date: string;
  shift: string;
  machineCode: string;
  workingHours: number;
  energyConsumptionKwh: number;
  energyCost: number;
  productionOutput: number;
  energyPerUnit: string;
  peakDemandKw: number;
  powerFactor: number;
}

export default function EnergyPage() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnergy = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/energy');
      const data = res.records ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        date: d.date,
        shift: d.shift || '',
        machineCode: d.machineCode || 'FACTORY',
        workingHours: d.workingHours || 0,
        energyConsumptionKwh: d.energyConsumptionKwh || 0,
        energyCost: d.energyCost || 0,
        productionOutput: d.productionOutput || 0,
        energyPerUnit: d.energyPerUnit || '0',
        peakDemandKw: d.peakDemandKw || 0,
        powerFactor: d.powerFactor || 0,
      }));
      setRecords(formatted);
    } catch (err) {
      console.error('Failed to fetch energy', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEnergy();
  }, [fetchEnergy]);

  const totalConsumption = records.reduce((s, r) => s + r.energyConsumptionKwh, 0);
  const totalOutput = records.reduce((s, r) => s + r.productionOutput, 0);
  const avgEnergyPerUnit = totalOutput > 0 ? (totalConsumption / totalOutput).toFixed(2) : '0';
  const avgPowerFactor = records.length > 0 ? records.reduce((s, r) => s + r.powerFactor, 0) / records.length : 0;
  const totalCost = records.reduce((s, r) => s + r.energyCost, 0);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energy Metrics</h1>
            <p className="text-muted">Track energy consumption per brake assembly</p>
          </div>
          <Button variant="outline" onClick={fetchEnergy} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totalConsumption.toLocaleString()} kWh</p>
            <p className="text-sm text-muted">Total Consumption (30d)</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{loading ? '—' : avgEnergyPerUnit} kWh</p>
            <p className="text-sm text-muted">Energy / Brake Assembly</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">₹{(totalCost / 1000).toFixed(1)}K</p>
            <p className="text-sm text-muted">Total Energy Cost (30d)</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgPowerFactor.toFixed(2)}</p>
            <p className="text-sm text-muted">Average Power Factor</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Daily Energy Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Shift</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Working Hours</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Consumption</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Production</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">kWh / Unit</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Cost</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Power Factor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading logs...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted">No energy logs found.</td>
                  </tr>
                ) : records.slice(0, 30).map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-foreground text-xs">{record.date}</td>
                    <td className="py-3 px-4 text-muted text-xs">{record.shift}</td>
                    <td className="py-3 px-4 text-right font-numbers text-xs">{record.workingHours}h</td>
                    <td className="py-3 px-4 text-right font-numbers text-xs">{record.energyConsumptionKwh?.toLocaleString()} kWh</td>
                    <td className="py-3 px-4 text-right font-numbers text-xs">{record.productionOutput}</td>
                    <td className={`py-3 px-4 text-right font-numbers text-xs ${parseFloat(record.energyPerUnit) > 8 ? 'text-danger' : 'text-accent'}`}>
                      {record.energyPerUnit}
                    </td>
                    <td className="py-3 px-4 text-right font-numbers text-xs">₹{record.energyCost?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className={record.powerFactor >= 0.95 ? 'bg-accent/10 text-accent' : record.powerFactor >= 0.90 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}>
                        {record.powerFactor.toFixed(2)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
