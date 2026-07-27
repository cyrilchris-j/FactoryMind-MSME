'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, TrendingUp, TrendingDown, DollarSign,
  Search, Filter, Loader2, RefreshCw, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  completedQuantity: number;
  orderDate: string;
  dueDate: string;
  priority: string;
  status: string;
  orderValue: number;
  productId: string;
}

interface OrderFeasibility {
  orderId: string;
  orderNumber: string;
  remainingQuantity: number;
  maxBuildable: number;
  primaryConstraint: string;
  riskLevel: string;
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [feasibilityMap, setFeasibilityMap] = useState<Record<string, OrderFeasibility>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/customer-orders');
      const data = res.data ?? [];
      const filtered = search
        ? data.filter((o: any) =>
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.orderNumber?.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setOrders(filtered);

      const feasMap: Record<string, OrderFeasibility> = {};
      for (const order of filtered) {
        try {
          const feas: any = await apiGet(`/api/order-feasibility/${order.id}`);
          feasMap[order.id] = feas;
        } catch { /* ignore */ }
      }
      setFeasibilityMap(feasMap);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-accent/10 text-accent',
      IN_PROGRESS: 'bg-warning/10 text-warning',
      PENDING: 'bg-primary/10 text-primary',
      DELAYED: 'bg-[#D93025]/10 text-danger',
    };
    return colors[status] || 'bg-muted/10 text-muted';
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      'ON TRACK': 'bg-accent/10 text-accent border-accent/20',
      'AT RISK': 'bg-warning/10 text-warning border-warning/20',
      DELAYED: 'bg-[#D93025]/10 text-danger border-danger/20',
      COMPLETED: 'bg-accent/10 text-accent border-accent/20',
    };
    return colors[risk] || 'bg-muted/10 text-muted';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: 'text-danger bg-danger/10',
      MEDIUM: 'text-warning bg-warning/10',
      LOW: 'text-accent bg-accent/10',
    };
    return colors[priority] || 'text-muted bg-muted/10';
  };

  const totalOrderValue = orders.reduce((s, o) => s + (o.orderValue || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED').length;
  const atRiskOrders = Object.values(feasibilityMap).filter(f => f?.riskLevel === 'AT RISK' || f?.riskLevel === 'DELAYED').length;

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales & Orders</h1>
            <p className="text-muted">Customer orders with feasibility analysis</p>
          </div>
          <Button variant="outline" onClick={fetchOrders} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-2xl font-bold text-foreground">₹{(totalOrderValue / 100000).toFixed(1)}L</p>
            <p className="text-sm text-muted">Total Order Value</p>
          </Card>
          <Card className="p-5">
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted">Total Orders</p>
          </Card>
          <Card className="p-5">
            <p className="text-2xl font-bold text-warning">{activeOrders}</p>
            <p className="text-sm text-muted">Active Orders</p>
          </Card>
          <Card className="p-5">
            <p className="text-2xl font-bold text-danger">{atRiskOrders}</p>
            <p className="text-sm text-muted">Orders at Risk</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Customer Orders</h2>
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Order #</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Completed</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Remaining</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Buildable</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Constraint</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Due</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Risk</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-muted">No customer orders found.</td>
                  </tr>
                ) : orders.map((order) => {
                  const feas = feasibilityMap[order.id];
                  const remaining = (order.quantity || 0) - (order.completedQuantity || 0);
                  return (
                    <tr key={order.id} className={`border-b border-border hover:bg-background ${feas?.riskLevel === 'AT RISK' || feas?.riskLevel === 'DELAYED' ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 px-4 text-foreground font-medium">{order.orderNumber}</td>
                      <td className="py-4 px-4 text-foreground">{order.customerName}</td>
                      <td className="py-4 px-4 text-muted">{order.productName}</td>
                      <td className="py-4 px-4 text-right font-numbers">{order.quantity?.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-numbers text-accent">{order.completedQuantity?.toLocaleString()}</td>
                      <td className={`py-4 px-4 text-right font-numbers ${remaining > 0 ? 'text-warning' : 'text-accent'}`}>
                        {remaining.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 text-right font-numbers ${feas ? (feas.maxBuildable < remaining ? 'text-danger' : 'text-accent') : 'text-muted'}`}>
                        {feas?.maxBuildable ?? '-'}
                      </td>
                      <td className="py-4 px-4 text-muted text-xs">
                        {feas?.primaryConstraint && feas?.riskLevel !== 'COMPLETED' ? feas.primaryConstraint : '-'}
                      </td>
                      <td className="py-4 px-4 text-foreground text-xs">
                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {feas ? (
                          <Badge className={getRiskColor(feas.riskLevel)}>
                            {feas.riskLevel}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Order Risk Alert */}
        {atRiskOrders > 0 && (
          <Card className="p-5 border-2 border-danger/30 bg-danger/[0.02]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Order Risk Detected</h3>
                <p className="text-sm text-muted mt-1">
                  {atRiskOrders} order(s) are currently at risk of delay due to material constraints.
                  The primary constraint is Wear Sensor availability. Review the BOM Intelligence
                  for detailed component-level analysis.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </OwnerLayout>
  );
}
