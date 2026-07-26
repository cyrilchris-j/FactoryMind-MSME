'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface InventoryItem {
  id: string;
  material_name: string;
  material_code: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  supplier: string;
  status?: string;
}

interface Stats {
  totalItems: number;
  lowStockAlerts: number;
  stockAccuracy: number;
  inventoryValue: string;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/inventory' + (search ? `?category=${search}` : ''));
      const data = res.data ?? [];
      const items = data.map((d: any) => {
        let status = 'in_stock';
        if (d.currentStock <= d.minimumStock) status = 'critical';
        else if (d.currentStock <= d.minimumStock * 1.2) status = 'low_stock';
        return {
          id: d.id,
          material_name: d.materialName || '',
          material_code: d.materialCode || '',
          category: d.category || '',
          current_stock: d.currentStock || 0,
          minimum_stock: d.minimumStock || 0,
          unit: d.unit || '',
          supplier: d.supplier || '-',
          status,
        };
      });
      const filtered = search
        ? items.filter((i: any) => i.material_name.toLowerCase().includes(search.toLowerCase()))
        : items;
      setInventoryItems(filtered);
      setStats({
        totalItems: filtered.length,
        lowStockAlerts: filtered.filter((i: any) => i.status === 'critical' || i.status === 'low_stock').length,
        stockAccuracy: 92,
        inventoryValue: '₹4.2L',
      });
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: 'bg-accent/10 text-accent',
      low_stock: 'bg-warning/10 text-warning',
      critical: 'bg-[#D93025]/10 text-danger',
    };
    return colors[status] || 'bg-[#4F6D7A]/10 text-secondary';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Raw Material': 'bg-primary/10 text-primary',
      'Finished Goods': 'bg-accent/10 text-accent',
      'Consumable': 'bg-[#4F6D7A]/10 text-secondary',
    };
    return colors[category] || 'bg-[#4F6D7A]/10 text-secondary';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted">Manage raw materials and finished goods</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchInventory} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Package className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.totalItems}
            </p>
            <p className="text-sm text-muted">Total Items</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span className="text-sm text-danger flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                2
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.lowStockAlerts}
            </p>
            <p className="text-sm text-muted">Low Stock Alerts</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : `${stats?.stockAccuracy}%`}
            </p>
            <p className="text-sm text-muted">Stock Accuracy</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownRight className="w-5 h-5 text-secondary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.inventoryValue}
            </p>
            <p className="text-sm text-muted">Inventory Value</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Inventory Items</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search items..."
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
                  <th className="text-left py-3 px-4 font-medium text-muted">Item Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Min Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">No inventory items found.</td>
                  </tr>
                ) : inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-background">
                    <td className="py-4 px-4 text-foreground font-medium">{item.material_code}</td>
                    <td className="py-4 px-4 text-foreground">{item.material_name}</td>
                    <td className="py-4 px-4">
                      <Badge className={getCategoryColor(item.category || '')}>
                        {item.category || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium">
                      {item.current_stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-muted">
                      {item.minimum_stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-foreground">{item.supplier || '-'}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(item.status || '')}>
                        {(item.status || '').replace('_', ' ').toUpperCase()}
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
