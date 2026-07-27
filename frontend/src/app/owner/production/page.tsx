'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Activity, Loader2, RefreshCw, Target, Factory
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface ProductionRecord {
  id: string;
  date: string;
  shift: string;
  machineCode: string;
  productName: string;
  targetQuantity: number;
  actualQuantity: number;
  rejectedQuantity: number;
  downtimeMinutes: number;
  notes: string;
  status: string;
}

interface Stats {
  todayTarget: number;
  todayActual: number;
  todayRejected: number;
  todayDowntime: number;
  achievement: number;
  rejectionRate: string;
  totalRecords: number;
}

export default function ProductionPage() {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduction = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/production?limit=100');
      const data = res.data ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        date: d.date,
        shift: d.shift || '',
        machineCode: d.machineCode || 'Unknown',
        productName: d.productName || '',
        targetQuantity: d.targetQuantity || 0,
        actualQuantity: d.actualQuantity || 0,
        rejectedQuantity: d.rejectedQuantity || 0,
        downtimeMinutes: d.downtimeMinutes || 0,
        notes: d.notes || '',
        status: d.status || 'in_progress',
      }));
      formatted.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(formatted);

      const today = new Date().toISOString().split('T')[0];
      const todayRecords = formatted.filter((r: any) => r.date === today);
      const todayTarget = todayRecords.reduce((s: number, r: any) => s + r.targetQuantity, 0);
      const todayActual = todayRecords.reduce((s: number, r: any) => s + r.actualQuantity, 0);
      const todayRejected = todayRecords.reduce((s: number, r: any) => s + r.rejectedQuantity, 0);
      const todayDowntime = todayRecords.reduce((s: number, r: any) => s + r.downtimeMinutes, 0);

      setStats({
        todayTarget,
        todayActual,
        todayRejected,
        todayDowntime,
        achievement: todayTarget > 0 ? Math.round((todayActual / todayTarget) * 100) : 0,
        rejectionRate: todayActual > 0 ? ((todayRejected / todayActual) * 100).toFixed(1) : '0.0',
        totalRecords: formatted.length,
      });
    } catch (err) {
      console.error('Failed to fetch production', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Production</h1>
            <p className="text-muted">Automotive Brake Assembly — production tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProduction} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Today's Production Overview */}
        {stats && (
          <Card className="p-6 border-2 border-primary/20">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Today's Production — Automotive Brake Assembly
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted mb-0.5">Target</p>
                <p className="text-xl font-bold text-foreground">{stats.todayTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Completed</p>
                <p className="text-xl font-bold text-accent">{stats.todayActual.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">In Progress</p>
                <p className="text-xl font-bold text-warning">
                  {stats.todayTarget > 0 ? Math.max(0, stats.todayTarget - stats.todayActual).toLocaleString() : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Remaining</p>
                <p className="text-xl font-bold text-danger">
                  {Math.max(0, stats.todayTarget - stats.todayActual).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Achievement</p>
                <p className={`text-xl font-bold ${stats.achievement >= 80 ? 'text-accent' : 'text-danger'}`}>
                  {stats.achievement}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Rejected</p>
                <p className="text-xl font-bold text-danger">{stats.todayRejected} ({stats.rejectionRate}%)</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Downtime</p>
                <p className="text-xl font-bold text-warning">{stats.todayDowntime}m</p>
              </div>
            </div>
            <div className="w-full bg-border rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${stats.achievement >= 80 ? 'bg-accent' : stats.achievement >= 50 ? 'bg-warning' : 'bg-danger'}`}
                style={{ width: `${Math.min(stats.achievement, 100)}%` }}
              />
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : stats?.todayActual.toLocaleString()}</p>
            <p className="text-sm text-muted">Units Produced Today</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : stats?.totalRecords}</p>
            <p className="text-sm text-muted">Total Records (30d)</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : `${stats?.achievement || 0}%`}</p>
            <p className="text-sm text-muted">Achievement vs Target</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-danger" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : `${stats?.rejectionRate || '0.0'}%`}</p>
            <p className="text-sm text-muted">Rejection Rate</p>
          </Card>
        </div>

        {/* Production Records */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Production Records</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-border">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 Days
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Shift</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Target</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Actual</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Rejected</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Downtime</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-muted">No production records found.</td>
                  </tr>
                ) : records.slice(0, 20).map((record) => {
                  const pct = record.targetQuantity > 0 ? (record.actualQuantity / record.targetQuantity) * 100 : 0;
                  return (
                    <tr key={record.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4 text-foreground text-xs">{record.date}</td>
                      <td className="py-3 px-4 text-foreground font-medium text-xs">{record.productName}</td>
                      <td className="py-3 px-4 text-muted text-xs">{record.shift}</td>
                      <td className="py-3 px-4 text-foreground text-xs">{record.machineCode}</td>
                      <td className="py-3 px-4 text-right font-numbers text-xs">{record.targetQuantity}</td>
                      <td className={`py-3 px-4 text-right font-numbers text-xs ${record.actualQuantity >= record.targetQuantity ? 'text-accent' : 'text-warning'}`}>
                        {record.actualQuantity}
                      </td>
                      <td className="py-3 px-4 text-right font-numbers text-xs text-danger">{record.rejectedQuantity}</td>
                      <td className="py-3 px-4 text-right font-numbers text-xs">{record.downtimeMinutes}m</td>
                      <td className="py-3 px-4">
                        <Badge className={`text-[10px] ${pct >= 100 ? 'bg-accent/10 text-accent' : pct >= 80 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                          {pct >= 100 ? 'Completed' : pct >= 80 ? 'In Progress' : 'Delayed'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
