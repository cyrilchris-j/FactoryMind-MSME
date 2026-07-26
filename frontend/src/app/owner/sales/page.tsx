'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface SalesRecord {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  order_value: number;
  profit_margin: number;
  order_date: string;
  delivery_date: string;
  status: string;
}

interface Stats {
  totalRevenue: string;
  avgMargin: string;
  activeOrders: number;
  deliveredOrders: number;
}

export default function SalesPage() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/sales');
      const data = res.orders ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        order_number: d.orderNumber || '',
        customer_name: d.customerName || '',
        product_name: d.productName || '',
        quantity: d.quantity || 0,
        order_value: d.orderValue || 0,
        profit_margin: d.profitMargin || 0,
        order_date: d.orderDate || '',
        delivery_date: d.deliveryDate || '',
        status: d.status || 'PENDING',
      }));
      const filtered = search
        ? formatted.filter((r: any) =>
            r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            r.order_number.toLowerCase().includes(search.toLowerCase())
          )
        : formatted;
      setRecords(filtered);

      const totalRevenue = formatted.reduce((sum: number, r: any) => sum + r.order_value, 0);
      const avgMargin = formatted.length > 0 ? formatted.reduce((sum: number, r: any) => sum + r.profit_margin, 0) / formatted.length : 0;
      const activeOrders = filtered.filter((r: any) => r.status !== 'DELIVERED').length;
      const deliveredOrders = filtered.filter((r: any) => r.status === 'DELIVERED').length;

      setStats({
        totalRevenue: '₹' + (totalRevenue / 100000).toFixed(1) + 'L',
        avgMargin: avgMargin.toFixed(1) + '%',
        activeOrders,
        deliveredOrders,
      });
    } catch (err) {
      console.error('Failed to fetch sales', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'bg-accent/10 text-accent',
      READY: 'bg-accent/10 text-accent',
      IN_PRODUCTION: 'bg-warning/10 text-warning',
      PENDING: 'bg-primary/10 text-primary',
      DELAYED: 'bg-[#D93025]/10 text-danger',
    };
    return colors[status] || 'bg-[#4F6D7A]/10 text-secondary';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales & Orders</h1>
            <p className="text-muted">Manage customer orders and revenue</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSales} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.totalRevenue}
            </p>
            <p className="text-sm text-muted">Total Revenue</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2.4%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.avgMargin}
            </p>
            <p className="text-sm text-muted">Avg Profit Margin</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-warning" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.activeOrders}
            </p>
            <p className="text-sm text-muted">Active Orders</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="text-sm text-accent flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.deliveredOrders}
            </p>
            <p className="text-sm text-muted">Delivered</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search orders..."
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
                  <th className="text-left py-3 px-4 font-medium text-muted">Order #</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Quantity</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Value</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Margin</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Delivery By</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading orders...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted">No sales orders found.</td>
                  </tr>
                ) : records.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-background">
                    <td className="py-4 px-4 text-foreground font-medium">{record.order_number}</td>
                    <td className="py-4 px-4 text-foreground">{record.customer_name}</td>
                    <td className="py-4 px-4 text-muted">{record.product_name}</td>
                    <td className="py-4 px-4 text-foreground font-numbers text-right">
                      {record.quantity.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-foreground font-numbers text-right">
                      ₹{record.order_value.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-accent font-numbers text-right">
                      {record.profit_margin}%
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {record.delivery_date ? new Date(record.delivery_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ')}
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
