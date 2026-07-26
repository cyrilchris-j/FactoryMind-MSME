'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Activity, Loader2, RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import { exportToExcel } from '@/utils/excel/exporter';
interface ProductionRecord {
  id: string;
  date: string;
  product_name: string;
  actual_quantity: number;
  target_quantity: number;
  shift: string;
  machine_code: string;
}

interface Stats {
  unitsProduced: number;
  activeOrders: number;
  onTimeDelivery: number;
  delayedOrders: number;
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
        product_name: d.productName || '',
        actual_quantity: d.actualQuantity || 0,
        target_quantity: d.targetQuantity || 0,
        shift: d.shift || '',
        machine_code: d.machineCode || 'Unknown'
      }));
      setRecords(formatted);

      const today = new Date().toISOString().split('T')[0];
      const todayRecords = formatted.filter((r: any) => r.date === today);
      const unitsProduced = todayRecords.reduce((sum: number, r: any) => sum + r.actual_quantity, 0);

      setStats({
        unitsProduced,
        activeOrders: formatted.length,
        onTimeDelivery: 94.5,
        delayedOrders: 3,
      });
    } catch (err) {
      console.error('Failed to fetch production', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProduction();
  }, [fetchProduction]);

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return 'bg-accent/10 text-accent';
    if (pct >= 80) return 'bg-warning/10 text-warning';
    return 'bg-[#D93025]/10 text-danger';
  };

  const getStatusText = (pct: number) => {
    if (pct >= 100) return 'Completed';
    if (pct >= 80) return 'In Progress';
    return 'Delayed';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Production</h1>
            <p className="text-muted">Manage production orders and schedules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProduction} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => exportToExcel(records, 'Production_Report')} disabled={loading || records.length === 0} className="border-border">
              Export Excel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.unitsProduced.toLocaleString()}
            </p>
            <p className="text-sm text-muted">Units Produced Today</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-secondary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.activeOrders}
            </p>
            <p className="text-sm text-muted">Active Records (7d)</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : `${stats?.onTimeDelivery}%`}
            </p>
            <p className="text-sm text-muted">On-Time Delivery</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <span className="text-sm text-danger flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.delayedOrders}
            </p>
            <p className="text-sm text-muted">Delayed Orders</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Production Records</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-border">
                <Calendar className="w-4 h-4 mr-2" />
                This Week
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Shift</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">No production records found.</td>
                  </tr>
                ) : records.map((order) => {
                  const pct = order.target_quantity > 0 ? (order.actual_quantity / order.target_quantity) * 100 : 0;
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-background">
                      <td className="py-4 px-4 text-foreground">{order.date}</td>
                      <td className="py-4 px-4 text-foreground">{order.product_name}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{order.machine_code}</td>
                      <td className="py-4 px-4 text-muted">{order.shift}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-border rounded-full h-2 w-24">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted">{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(pct)}>
                          {getStatusText(pct)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
