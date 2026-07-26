'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  IndianRupee,
  Activity
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface EnergyRecord {
  id: string;
  date: string;
  machine_code: string;
  machine_name: string;
  energy_consumption_kwh: number;
  working_hours: number;
  peak_demand: number;
  energy_cost: number;
  power_factor: number;
}

interface Stats {
  totalConsumption: string;
  energyCost: string;
  avgPowerFactor: string;
  peakDemandAlerts: number;
}

export default function EnergyPage() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEnergy = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/energy');
      const data = res.records ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        date: d.date,
        machine_code: d.machineCode || 'Unknown',
        machine_name: d.machineName || '',
        energy_consumption_kwh: d.energyConsumptionKwh || 0,
        working_hours: d.workingHours || 0,
        peak_demand: d.peakDemand || 0,
        energy_cost: d.energyCost || 0,
        power_factor: d.powerFactor || 0,
      }));
      const filtered = search
        ? formatted.filter((r: any) =>
            r.machine_code.toLowerCase().includes(search.toLowerCase()) ||
            r.machine_name.toLowerCase().includes(search.toLowerCase())
          )
        : formatted;
      setRecords(filtered);

      const totalConsumption = formatted.reduce((sum: number, r: any) => sum + r.energy_consumption_kwh, 0);
      const energyCost = formatted.reduce((sum: number, r: any) => sum + r.energy_cost, 0);
      const avgPowerFactor = formatted.length > 0 ? formatted.reduce((sum: number, r: any) => sum + r.power_factor, 0) / formatted.length : 0;
      const peakDemandAlerts = formatted.filter((r: any) => r.peak_demand > 85).length;

      setStats({
        totalConsumption: totalConsumption.toLocaleString() + ' kWh',
        energyCost: '₹' + energyCost.toLocaleString(),
        avgPowerFactor: avgPowerFactor.toFixed(2),
        peakDemandAlerts,
      });
    } catch (err) {
      console.error('Failed to fetch energy', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchEnergy();
  }, [fetchEnergy]);

  const getPowerFactorColor = (pf: number) => {
    if (pf >= 0.95) return 'bg-accent/10 text-accent';
    if (pf >= 0.90) return 'bg-warning/10 text-warning';
    return 'bg-[#D93025]/10 text-danger';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energy Metrics</h1>
            <p className="text-muted">Monitor power consumption and efficiency</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchEnergy} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm text-danger flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.totalConsumption}
            </p>
            <p className="text-sm text-muted">Total Consumption (Month)</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <IndianRupee className="w-5 h-5 text-secondary" />
              <span className="text-sm text-danger flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.energyCost}
            </p>
            <p className="text-sm text-muted">Energy Cost</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.02
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.avgPowerFactor}
            </p>
            <p className="text-sm text-muted">Avg Power Factor</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span className="text-sm text-danger flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +1
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.peakDemandAlerts}
            </p>
            <p className="text-sm text-muted">Peak Demand Alerts</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Daily Energy Logs</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search machine..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Consumption</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Working Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Peak Demand</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Power Factor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Cost</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading logs...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">No energy logs found.</td>
                  </tr>
                ) : records.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-background">
                    <td className="py-4 px-4 text-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium">
                      {record.machine_code}
                    </td>
                    <td className="py-4 px-4 text-foreground font-numbers">
                      {record.energy_consumption_kwh.toLocaleString()} kWh
                    </td>
                    <td className="py-4 px-4 text-muted font-numbers">
                      {record.working_hours} h
                    </td>
                    <td className="py-4 px-4 text-danger font-numbers">
                      {record.peak_demand} kW
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getPowerFactorColor(record.power_factor)}>
                        {record.power_factor.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-foreground font-numbers">
                      ₹{record.energy_cost.toLocaleString()}
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
