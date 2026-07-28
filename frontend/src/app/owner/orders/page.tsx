'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface Order {
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
  notes: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/customer-orders');
      const data = (res?.data ?? []).map((d: any) => ({
        id: d.id,
        orderNumber: d.orderNumber || '',
        customerName: d.customerName || '',
        productName: d.productName || 'Automotive Brake Assembly',
        quantity: d.quantity || 0,
        completedQuantity: d.completedQuantity || 0,
        orderDate: d.orderDate || '',
        dueDate: d.dueDate || '',
        priority: d.priority || 'MEDIUM',
        status: d.status || 'PENDING',
        orderValue: d.orderValue || 0,
        notes: d.notes || '',
      }));
      data.sort((a: Order, b: Order) => {
        const prio: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (prio[a.priority] ?? 1) - (prio[b.priority] ?? 1);
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
    if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const prioColor = (p: string) => {
    if (p === 'HIGH') return 'bg-red-100 text-red-700';
    if (p === 'LOW') return 'bg-gray-100 text-gray-600';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <OwnerLayout>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Customer Orders
            </h1>
            <p className="text-sm text-muted">Brake Assembly order tracking</p>
          </div>
          <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-gray-100 text-muted">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center text-muted">No orders found.</Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const remaining = Math.max(0, order.quantity - order.completedQuantity);
              const progress = order.quantity > 0 ? Math.round((order.completedQuantity / order.quantity) * 100) : 0;
              const isOverdue = order.dueDate && new Date(order.dueDate) < new Date() && order.status !== 'COMPLETED';

              return (
                <Card key={order.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{order.orderNumber}</span>
                        <Badge className={prioColor(order.priority)}>{order.priority}</Badge>
                        <Badge className={statusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                        {isOverdue && <Badge className="bg-red-100 text-red-700">OVERDUE</Badge>}
                      </div>
                      <p className="text-sm text-muted">{order.customerName} • {order.productName}</p>
                      {order.notes && <p className="text-xs text-muted mt-1 italic">{order.notes}</p>}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted">Quantity</p>
                        <p className="font-bold font-numbers">{order.quantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted">Completed</p>
                        <p className="font-bold font-numbers text-emerald-600">{order.completedQuantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted">Remaining</p>
                        <p className="font-bold font-numbers text-amber-600">{remaining}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted">Due</p>
                        <p className="font-medium font-numbers text-xs">{order.dueDate || '-'}</p>
                      </div>
                    </div>

                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted">Progress</span>
                        <span className="font-bold font-numbers">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
