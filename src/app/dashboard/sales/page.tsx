'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Package,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

const orders = [
  {
    id: 'ORD-001',
    customer: 'Apex Industries Ltd',
    product: 'Automotive Part A',
    quantity: 500,
    revenue: 250000,
    profit: 71250,
    status: 'delivered',
    date: '2024-01-10',
  },
  {
    id: 'ORD-002',
    customer: 'TechCorp Solutions',
    product: 'Industrial Component B',
    quantity: 350,
    revenue: 175000,
    profit: 43750,
    status: 'shipped',
    date: '2024-01-12',
  },
  {
    id: 'ORD-003',
    customer: 'Global Manufacturing',
    product: 'Custom Assembly C',
    quantity: 200,
    revenue: 120000,
    profit: 30000,
    status: 'processing',
    date: '2024-01-15',
  },
  {
    id: 'ORD-004',
    customer: 'Precision Parts Inc',
    product: 'Precision Part D',
    quantity: 150,
    revenue: 90000,
    profit: 22500,
    status: 'pending',
    date: '2024-01-18',
  },
  {
    id: 'ORD-005',
    customer: 'AutoParts Ltd',
    product: 'Standard Component E',
    quantity: 800,
    revenue: 320000,
    profit: 80000,
    status: 'delivered',
    date: '2024-01-08',
  },
];

const topCustomers = [
  {
    name: 'Apex Industries Ltd',
    totalRevenue: 1250000,
    orders: 15,
    profitMargin: 28.5,
  },
  {
    name: 'TechCorp Solutions',
    totalRevenue: 890000,
    orders: 12,
    profitMargin: 25.0,
  },
  {
    name: 'Global Manufacturing',
    totalRevenue: 750000,
    orders: 10,
    profitMargin: 25.0,
  },
  {
    name: 'Precision Parts Inc',
    totalRevenue: 620000,
    orders: 8,
    profitMargin: 25.0,
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    delivered: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    shipped: 'bg-[#1F3A5F]/10 text-[#1F3A5F]',
    processing: 'bg-[#F4B400]/10 text-[#F4B400]',
    pending: 'bg-[#4F6D7A]/10 text-[#4F6D7A]',
    cancelled: 'bg-[#D93025]/10 text-[#D93025]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function SalesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Sales</h1>
            <p className="text-[#6B7280]">Track orders, customers, and revenue</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <ShoppingCart className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">₹45.2L</p>
            <p className="text-sm text-[#6B7280]">Total Revenue (Month)</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">₹10.5L</p>
            <p className="text-sm text-[#6B7280]">Total Profit (Month)</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-5 h-5 text-[#4F6D7A]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +5
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">48</p>
            <p className="text-sm text-[#6B7280]">Orders This Month</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">23.2%</p>
            <p className="text-sm text-[#6B7280]">Profit Margin</p>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Recent Orders</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </Button>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Profit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{order.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{order.customer}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{order.product}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">{order.quantity}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">
                      ₹{(order.revenue / 1000).toFixed(1)}K
                    </td>
                    <td className="py-4 px-4 text-sm text-[#2E8B57] font-numbers">
                      ₹{(order.profit / 1000).toFixed(1)}K
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{order.date}</td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Top Customers</h2>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{customer.name}</p>
                    <p className="text-sm text-[#6B7280]">{customer.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#1A1A1A] font-numbers">
                      ₹{(customer.totalRevenue / 100000).toFixed(1)}L
                    </p>
                    <p className="text-sm text-[#2E8B57]">{customer.profitMargin}% margin</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-[#1F3A5F]/5 to-[#4F6D7A]/5 border-l-4 border-l-[#1F3A5F]">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#1F3A5F]/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#1F3A5F]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Sales Forecast</h3>
                <p className="text-sm text-[#6B7280] mb-3">
                  Next month's revenue is projected to be ₹52.5L with 89% confidence, a 16% increase from current month.
                </p>
                <div className="flex space-x-4 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Growth:</span>
                    <span className="ml-2 font-medium text-[#2E8B57]">+16%</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Top Product:</span>
                    <span className="ml-2 font-medium text-[#1A1A1A]">Automotive Part A</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
