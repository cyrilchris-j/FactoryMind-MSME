'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const productionOrders = [
  {
    id: 'PO-001',
    product: 'Automotive Part A',
    quantity: 500,
    target: 500,
    status: 'completed',
    priority: 'high',
    deadline: '2024-01-15',
    machine: 'CNC-01',
  },
  {
    id: 'PO-002',
    product: 'Industrial Component B',
    quantity: 350,
    target: 500,
    status: 'in_progress',
    priority: 'high',
    deadline: '2024-01-20',
    machine: 'CNC-02',
  },
  {
    id: 'PO-003',
    product: 'Custom Assembly C',
    quantity: 200,
    target: 200,
    status: 'pending',
    priority: 'medium',
    deadline: '2024-01-25',
    machine: 'CNC-03',
  },
  {
    id: 'PO-004',
    product: 'Precision Part D',
    quantity: 150,
    target: 300,
    status: 'delayed',
    priority: 'critical',
    deadline: '2024-01-18',
    machine: 'CNC-04',
  },
  {
    id: 'PO-005',
    product: 'Standard Component E',
    quantity: 800,
    target: 1000,
    status: 'in_progress',
    priority: 'low',
    deadline: '2024-01-30',
    machine: 'CNC-05',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    in_progress: 'bg-[#1F3A5F]/10 text-[#1F3A5F]',
    pending: 'bg-[#4F6D7A]/10 text-[#4F6D7A]',
    delayed: 'bg-[#D93025]/10 text-[#D93025]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-[#D93025]/10 text-[#D93025]',
    high: 'bg-[#F4B400]/10 text-[#F4B400]',
    medium: 'bg-[#4F6D7A]/10 text-[#4F6D7A]',
    low: 'bg-[#2E8B57]/10 text-[#2E8B57]',
  };
  return colors[priority] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function ProductionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Production</h1>
            <p className="text-[#6B7280]">Manage production orders and schedules</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">2,450</p>
            <p className="text-sm text-[#6B7280]">Units Produced Today</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[#4F6D7A]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">23</p>
            <p className="text-sm text-[#6B7280]">Active Orders</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">94.5%</p>
            <p className="text-sm text-[#6B7280]">On-Time Delivery</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-[#D93025]" />
              <span className="text-sm text-[#D93025] flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">3</p>
            <p className="text-sm text-[#6B7280]">Delayed Orders</p>
          </Card>
        </div>

        {/* Production Orders Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Production Orders</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                This Week
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Machine</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Deadline</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productionOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{order.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{order.product}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#E5E7EB] rounded-full h-2 w-24">
                          <div
                            className="bg-[#1F3A5F] h-2 rounded-full"
                            style={{ width: `${(order.quantity / order.target) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#6B7280]">{Math.round((order.quantity / order.target) * 100)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{order.machine}</td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{order.deadline}</td>
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

        {/* AI Prediction Card */}
        <Card className="p-6 bg-gradient-to-r from-[#1F3A5F]/5 to-[#4F6D7A]/5 border-l-4 border-l-[#1F3A5F]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#1F3A5F]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#1F3A5F]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Production Forecast</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Based on current trends, tomorrow's production is estimated at 2,680 units with 94% confidence.
              </p>
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Optimal Shift:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A]">Morning (6AM-2PM)</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Bottleneck:</span>
                  <span className="ml-2 font-medium text-[#D93025]">CNC-04</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
