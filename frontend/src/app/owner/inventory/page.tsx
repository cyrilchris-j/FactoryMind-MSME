'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Search, Filter, Loader2, RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface Component {
  id: string;
  componentCode: string;
  componentName: string;
  description: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  reorderLevel: number;
  supplier: string;
  leadTimeDays: number;
  unitCost: number;
  reservedStock: number;
}

export default function InventoryPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/components');
      const data = res.data ?? [];
      const filtered = search
        ? data.filter((c: any) =>
            c.componentName.toLowerCase().includes(search.toLowerCase()) ||
            c.componentCode.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setComponents(filtered);
    } catch (err) {
      console.error('Failed to fetch components', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const getStatus = (comp: Component) => {
    const available = (comp.currentStock || 0) - (comp.reservedStock || 0);
    if (available <= 0) return { label: 'OUT OF STOCK', color: 'bg-red-100 text-red-800' };
    if (available < (comp.minimumStock || 0)) return { label: 'CRITICAL', color: 'bg-[#D93025]/10 text-danger' };
    if (available < (comp.minimumStock || 0) * 1.5) return { label: 'LOW', color: 'bg-warning/10 text-warning' };
    return { label: 'IN STOCK', color: 'bg-accent/10 text-accent' };
  };

  const stats = {
    totalItems: components.length,
    criticalItems: components.filter(c => (c.currentStock - (c.reservedStock || 0)) < (c.minimumStock || 0)).length,
    lowStockItems: components.filter(c => {
      const avail = c.currentStock - (c.reservedStock || 0);
      return avail > 0 && avail < (c.minimumStock || 0) * 1.5;
    }).length,
    totalValue: components.reduce((s, c) => s + ((c.currentStock || 0) * (c.unitCost || 0)), 0),
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory — Components</h1>
            <p className="text-muted">Manage automotive component stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchComponents} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : stats.totalItems}</p>
            <p className="text-sm text-muted">Total Components</p>
          </Card>
          <Card className="p-6">
            <p className="text-2xl font-bold text-danger">{loading ? '—' : stats.criticalItems}</p>
            <p className="text-sm text-muted">Critical Shortages</p>
          </Card>
          <Card className="p-6">
            <p className="text-2xl font-bold text-warning">{loading ? '—' : stats.lowStockItems}</p>
            <p className="text-sm text-muted">Low Stock</p>
          </Card>
          <Card className="p-6">
            <p className="text-2xl font-bold text-foreground">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-muted">Total Component Value</p>
          </Card>
        </div>

        {/* Wear Sensor Shortage Alert */}
        {components.filter(c => c.componentCode === 'BRK-WSR-001').length > 0 && (
          <Card className="p-5 border-2 border-danger/30 bg-danger/[0.02]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Wear Sensor Shortage</h3>
                <p className="text-sm text-muted mt-1">
                  Wear Sensor stock ({components.find(c => c.componentCode === 'BRK-WSR-001')?.currentStock || 0} units)
                  is insufficient to fulfill Order ORD-2026-001 (250 required).
                  This is the primary material constraint affecting Brake Assembly production.
                  Lead time: 14 days from SensoParts GmbH.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Component Inventory</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search components..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Component Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Component</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Current Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Min Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Reserved</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Available</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Supplier</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Lead Time</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Unit Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : components.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">No components found.</td>
                  </tr>
                ) : components.map((comp) => {
                  const status = getStatus(comp);
                  const available = (comp.currentStock || 0) - (comp.reservedStock || 0);
                  return (
                    <tr key={comp.id} className={`border-b border-border hover:bg-background ${status.label === 'OUT OF STOCK' || status.label === 'CRITICAL' ? 'bg-red-50/50' : ''}`}>
                      <td className="py-4 px-4 text-foreground font-medium">{comp.componentCode}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{comp.componentName}</td>
                      <td className={`py-4 px-4 text-right font-numbers ${available < (comp.minimumStock || 0) ? 'text-danger font-bold' : ''}`}>
                        {comp.currentStock?.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-muted font-numbers">{comp.minimumStock?.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-muted font-numbers">{comp.reservedStock || 0}</td>
                      <td className={`py-4 px-4 text-right font-numbers ${available < (comp.minimumStock || 0) ? 'text-danger font-bold' : 'text-accent'}`}>
                        {available.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-muted">{comp.supplier || '-'}</td>
                      <td className="py-4 px-4 text-right text-muted">{comp.leadTimeDays || '-'}d</td>
                      <td className="py-4 px-4 text-right font-numbers">₹{comp.unitCost?.toLocaleString() || '-'}</td>
                      <td className="py-4 px-4">
                        <Badge className={status.color}>{status.label}</Badge>
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
