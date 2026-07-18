'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Leaf,
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react';

const energyConsumption = [
  {
    id: 'E-001',
    machine: 'CNC-01',
    consumption: 450,
    unit: 'kWh',
    cost: 4500,
    efficiency: '92%',
    status: 'optimal',
  },
  {
    id: 'E-002',
    machine: 'CNC-02',
    consumption: 520,
    unit: 'kWh',
    cost: 5200,
    efficiency: '88%',
    status: 'optimal',
  },
  {
    id: 'E-003',
    machine: 'HVAC-02',
    consumption: 1200,
    unit: 'kWh',
    cost: 12000,
    efficiency: '65%',
    status: 'critical',
  },
  {
    id: 'E-004',
    machine: 'Lighting-B',
    consumption: 350,
    unit: 'kWh',
    cost: 3500,
    efficiency: '72%',
    status: 'warning',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    optimal: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    warning: 'bg-[#F4B400]/10 text-[#F4B400]',
    critical: 'bg-[#D93025]/10 text-[#D93025]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function EnergyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Energy Management</h1>
            <p className="text-[#6B7280]">Monitor and optimize energy consumption</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <Zap className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#D93025] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">12,450</p>
            <p className="text-sm text-[#6B7280]">kWh This Month</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#4F6D7A]" />
              <span className="text-sm text-[#D93025] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">₹1.24L</p>
            <p className="text-sm text-[#6B7280]">Energy Cost</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Leaf className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -5%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">2.4</p>
            <p className="text-sm text-[#6B7280]">Tons CO₂</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-[#F4B400]" />
              <span className="text-sm text-[#F4B400]">
                2 PM
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">Peak</p>
            <p className="text-sm text-[#6B7280]">Peak Hour</p>
          </Card>
        </div>

        {/* Machine-wise Consumption */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Machine-wise Consumption</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Machine</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Consumption</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Efficiency</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {energyConsumption.map((item) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{item.machine}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">
                      {item.consumption.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">
                      ₹{item.cost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">{item.efficiency}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        Analyze
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Energy Saving Suggestions */}
        <Card className="p-6 bg-gradient-to-r from-[#2E8B57]/5 to-[#1F3A5F]/5 border-l-4 border-l-[#2E8B57]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#2E8B57]/10 rounded-lg">
              <Leaf className="w-6 h-6 text-[#2E8B57]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Energy Optimization</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Implementing these suggestions could reduce energy consumption by 22% and save ₹28,000/month.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-[#1A1A1A]">HVAC Optimization</p>
                  <p className="text-[#6B7280]">Save ₹12,000/month</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-[#1A1A1A]">LED Lighting Upgrade</p>
                  <p className="text-[#6B7280]">Save ₹8,000/month</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-[#1A1A1A]">Peak Hour Shifting</p>
                  <p className="text-[#6B7280]">Save ₹8,000/month</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </Card>

        {/* Carbon Footprint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Carbon Footprint</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">This Month</span>
                  <span className="font-medium text-[#1A1A1A]">2.4 tons CO₂</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div className="bg-[#2E8B57] h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Industry Average</span>
                  <span className="font-medium text-[#6B7280]">4.0 tons CO₂</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div className="bg-[#4F6D7A] h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <p className="text-sm text-[#2E8B57] mt-2">
                ✓ 40% below industry average
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Renewable Energy Potential</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Solar Panels</p>
                  <p className="text-sm text-[#6B7280]">Rooftop installation</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#2E8B57]">35% savings</p>
                  <p className="text-sm text-[#6B7280]">₹45K/month</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Wind Energy</p>
                  <p className="text-sm text-[#6B7280]">Grid connection</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#2E8B57]">25% savings</p>
                  <p className="text-sm text-[#6B7280]">₹32K/month</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
