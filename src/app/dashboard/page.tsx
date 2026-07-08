'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Zap, 
  Users,
  Package,
  Wrench,
  AlertTriangle,
  Bot
} from 'lucide-react';

export default function DashboardPage() {
  const kpiData = [
    {
      title: "Today's Production",
      value: '2,450',
      unit: 'units',
      trend: '+12.5%',
      trendUp: true,
      icon: Activity,
      color: 'text-[#2E8B57]',
      bgColor: 'bg-[#2E8B57]/10',
    },
    {
      title: 'Machine Utilization',
      value: '87.3',
      unit: '%',
      trend: '+3.2%',
      trendUp: true,
      icon: Activity,
      color: 'text-[#1F3A5F]',
      bgColor: 'bg-[#1F3A5F]/10',
    },
    {
      title: 'Active Orders',
      value: '23',
      unit: 'orders',
      trend: '+5',
      trendUp: true,
      icon: Package,
      color: 'text-[#4F6D7A]',
      bgColor: 'bg-[#4F6D7A]/10',
    },
    {
      title: 'Inventory Status',
      value: '92',
      unit: '%',
      trend: '-2.1%',
      trendUp: false,
      icon: Package,
      color: 'text-[#F4B400]',
      bgColor: 'bg-[#F4B400]/10',
    },
    {
      title: 'Pending Maintenance',
      value: '5',
      unit: 'machines',
      trend: '+1',
      trendUp: false,
      icon: Wrench,
      color: 'text-[#D93025]',
      bgColor: 'bg-[#D93025]/10',
    },
    {
      title: 'Revenue Today',
      value: '₹4.8L',
      unit: '',
      trend: '+8.4%',
      trendUp: true,
      icon: DollarSign,
      color: 'text-[#2E8B57]',
      bgColor: 'bg-[#2E8B57]/10',
    },
    {
      title: 'Profit Margin',
      value: '23.5',
      unit: '%',
      trend: '+1.2%',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-[#1F3A5F]',
      bgColor: 'bg-[#1F3A5F]/10',
    },
    {
      title: 'Energy Cost',
      value: '₹12.5K',
      unit: '',
      trend: '-5.3%',
      trendUp: true,
      icon: Zap,
      color: 'text-[#4F6D7A]',
      bgColor: 'bg-[#4F6D7A]/10',
    },
    {
      title: 'Worker Attendance',
      value: '94',
      unit: '%',
      trend: '+2.0%',
      trendUp: true,
      icon: Users,
      color: 'text-[#2E8B57]',
      bgColor: 'bg-[#2E8B57]/10',
    },
    {
      title: 'Downtime',
      value: '1.2',
      unit: 'hrs',
      trend: '-0.5',
      trendUp: true,
      icon: AlertTriangle,
      color: 'text-[#D93025]',
      bgColor: 'bg-[#D93025]/10',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1F3A5F] to-[#4F6D7A] rounded-xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{getGreeting()}, Mr. Kumar</h1>
          <p className="text-white/80 mb-6">Here's what's happening in your factory today.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Today's Factory Health</p>
              <p className="text-2xl font-bold">92%</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Overall Efficiency</p>
              <p className="text-2xl font-bold">87.3%</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Machine Health Score</p>
              <p className="text-2xl font-bold">89/100</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Profit Today</p>
              <p className="text-2xl font-bold">₹1.1L</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`flex items-center text-sm ${kpi.trendUp ? 'text-[#2E8B57]' : 'text-[#D93025]'}`}>
                  {kpi.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-[#6B7280] text-sm mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">
                {kpi.value}
                {kpi.unit && <span className="text-sm font-normal text-[#6B7280] ml-1">{kpi.unit}</span>}
              </p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FA] transition-colors text-left">
              <Activity className="w-6 h-6 text-[#1F3A5F] mb-2" />
              <p className="font-medium text-[#1A1A1A]">Start Production</p>
              <p className="text-sm text-[#6B7280]">Begin new order</p>
            </button>
            <button className="p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FA] transition-colors text-left">
              <Wrench className="w-6 h-6 text-[#F4B400] mb-2" />
              <p className="font-medium text-[#1A1A1A]">Schedule Maintenance</p>
              <p className="text-sm text-[#6B7280]">Plan repairs</p>
            </button>
            <button className="p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FA] transition-colors text-left">
              <Package className="w-6 h-6 text-[#4F6D7A] mb-2" />
              <p className="font-medium text-[#1A1A1A]">Check Inventory</p>
              <p className="text-sm text-[#6B7280]">Stock levels</p>
            </button>
            <button className="p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FA] transition-colors text-left">
              <Bot className="w-6 h-6 text-[#2E8B57] mb-2" />
              <p className="font-medium text-[#1A1A1A]">Ask AI</p>
              <p className="text-sm text-[#6B7280]">Get insights</p>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
