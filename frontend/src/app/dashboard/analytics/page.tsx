'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';

const analyticsCards = [
  {
    title: 'Machine Utilization',
    value: '87.3%',
    trend: '+3.2%',
    trendUp: true,
    icon: Activity,
    color: 'text-[#1F3A5F]',
    bgColor: 'bg-[#1F3A5F]/10',
  },
  {
    title: 'Production Efficiency',
    value: '92.1%',
    trend: '+2.5%',
    trendUp: true,
    icon: TrendingUp,
    color: 'text-[#2E8B57]',
    bgColor: 'bg-[#2E8B57]/10',
  },
  {
    title: 'Downtime Reduction',
    value: '15.2%',
    trend: '-5.8%',
    trendUp: true,
    icon: TrendingDown,
    color: 'text-[#2E8B57]',
    bgColor: 'bg-[#2E8B57]/10',
  },
  {
    title: 'Cost Per Unit',
    value: '₹245',
    trend: '+2.1%',
    trendUp: false,
    icon: BarChart3,
    color: 'text-[#F4B400]',
    bgColor: 'bg-[#F4B400]/10',
  },
];

const chartSections = [
  {
    title: 'Production Trend',
    description: 'Monthly production output vs target',
    type: 'line',
    data: [
      { month: 'Jan', actual: 45000, target: 42000 },
      { month: 'Feb', actual: 48000, target: 44000 },
      { month: 'Mar', actual: 52000, target: 48000 },
      { month: 'Apr', actual: 49000, target: 50000 },
      { month: 'May', actual: 55000, target: 52000 },
      { month: 'Jun', actual: 58000, target: 54000 },
    ],
  },
  {
    title: 'Machine Pareto Analysis',
    description: 'Top contributing machines to downtime',
    type: 'bar',
    data: [
      { machine: 'CNC-04', downtime: 45 },
      { machine: 'HVAC-02', downtime: 32 },
      { machine: 'CNC-03', downtime: 28 },
      { machine: 'CNC-01', downtime: 18 },
      { machine: 'CNC-02', downtime: 15 },
    ],
  },
  {
    title: 'Inventory ABC Analysis',
    description: 'Value-based inventory classification',
    type: 'pie',
    data: [
      { category: 'A Items', value: 65, color: '#1F3A5F' },
      { category: 'B Items', value: 25, color: '#4F6D7A' },
      { category: 'C Items', value: 10, color: '#2E8B57' },
    ],
  },
  {
    title: 'Profit Trend',
    description: 'Monthly profit margin analysis',
    type: 'line',
    data: [
      { month: 'Jan', profit: 18.5 },
      { month: 'Feb', profit: 19.2 },
      { month: 'Mar', profit: 20.1 },
      { month: 'Apr', profit: 21.5 },
      { month: 'May', profit: 22.8 },
      { month: 'Jun', profit: 23.2 },
    ],
  },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
            <p className="text-[#6B7280]">Deep dive into factory performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 6 Months
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analyticsCards.map((card, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className={`text-sm flex items-center ${card.trendUp ? 'text-[#2E8B57]' : 'text-[#D93025]'}`}>
                  {card.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">{card.value}</p>
              <p className="text-sm text-[#6B7280]">{card.title}</p>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartSections.map((section, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-[#1A1A1A]">{section.title}</h3>
                <p className="text-sm text-[#6B7280]">{section.description}</p>
              </div>
              
              {/* Placeholder for charts - In production, use Recharts */}
              <div className="h-64 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-[#4F6D7A] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">Interactive Chart</p>
                  <p className="text-xs text-[#6B7280]">Recharts integration pending</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-[#6B7280]">
                  Data updated: Today, 9:00 AM
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Key Insights */}
        <Card className="p-6 bg-gradient-to-r from-[#1F3A5F]/5 to-[#4F6D7A]/5 border-l-4 border-l-[#1F3A5F]">
          <h3 className="font-semibold text-[#1A1A1A] mb-4">AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-[#2E8B57] rounded-full" />
                <span className="font-medium text-[#1A1A1A]">Production</span>
              </div>
              <p className="text-sm text-[#6B7280]">
                Output increased by 15% after implementing shift optimization
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-[#F4B400] rounded-full" />
                <span className="font-medium text-[#1A1A1A]">Maintenance</span>
              </div>
              <p className="text-sm text-[#6B7280]">
                Preventive maintenance reduced downtime by 22%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-[#1F3A5F] rounded-full" />
                <span className="font-medium text-[#1A1A1A]">Cost</span>
              </div>
              <p className="text-sm text-[#6B7280]">
                Energy optimization saved ₹28,000 this month
              </p>
            </div>
          </div>
        </Card>

        {/* Performance Comparison */}
        <Card className="p-6">
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Performance vs Industry Benchmark</h3>
          <div className="space-y-4">
            {[
              { metric: 'OEE (Overall Equipment Effectiveness)', factory: 87, industry: 75 },
              { metric: 'First Pass Yield', factory: 94, industry: 85 },
              { metric: 'On-Time Delivery', factory: 96, industry: 90 },
              { metric: 'Inventory Turnover', factory: 8.5, industry: 6.0 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">{item.metric}</span>
                  <div className="space-x-4">
                    <span className="font-medium text-[#2E8B57]">{item.factory}%</span>
                    <span className="text-[#6B7280]">Industry: {item.industry}%</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-[#E5E7EB] rounded-full h-2">
                    <div className="bg-[#2E8B57] h-2 rounded-full" style={{ width: `${item.factory}%` }} />
                  </div>
                  <div className="flex-1 bg-[#E5E7EB] rounded-full h-2">
                    <div className="bg-[#4F6D7A] h-2 rounded-full" style={{ width: `${item.industry}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
