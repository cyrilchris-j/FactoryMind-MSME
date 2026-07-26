'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsCard {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: any;
  color: string;
  bgColor: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [productionTrend, setProductionTrend] = useState<any[]>([]);
  const [machineDowntime, setMachineDowntime] = useState<any[]>([]);
  const [inventoryABC, setInventoryABC] = useState<any[]>([]);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);
  const [cards, setCards] = useState<AnalyticsCard[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiGet('/api/analytics');
      setProductionTrend(data.productionTrend ?? []);
      setProfitTrend(data.profitTrend ?? []);
      
      const maintRes: any = await apiGet('/api/maintenance');
      const maintData = maintRes.data ?? [];
      const downtimeMap: Record<string, number> = {};
      maintData.forEach((m: any) => {
        const code = m.machineCode || 'Unknown';
        downtimeMap[code] = (downtimeMap[code] || 0) + (m.downtimeMinutes || 0);
      });
      const formattedDowntime = Object.entries(downtimeMap).map(([machine, downtime]) => ({
        machine,
        downtime,
      })).sort((a: any, b: any) => b.downtime - a.downtime);
      setMachineDowntime(formattedDowntime);

      const invRes: any = await apiGet('/api/inventory');
      const invData = invRes.data ?? [];
      const catMap: Record<string, number> = {};
      invData.forEach((i: any) => {
        const cat = i.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + Number(i.currentStock || 0);
      });
      const colors = ['#2563EB', '#4F6D7A', '#2E8B57', '#F4B400'];
      const formattedABC = Object.entries(catMap).map(([category, value], index) => ({
        category,
        value,
        color: colors[index % colors.length],
      }));
      setInventoryABC(formattedABC);

      setCards([
        {
          title: 'Machine Utilization',
          value: '87.3%',
          trend: '+3.2%',
          trendUp: true,
          icon: Activity,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        },
        {
          title: 'Production Efficiency',
          value: '92.1%',
          trend: '+2.5%',
          trendUp: true,
          icon: TrendingUp,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
        },
        {
          title: 'Downtime Reduction',
          value: '15.2%',
          trend: '-5.8%',
          trendUp: true,
          icon: TrendingDown,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
        },
        {
          title: 'Cost Per Unit',
          value: '₹245',
          trend: '+2.1%',
          trendUp: false,
          icon: BarChart3,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted">Deep dive into factory performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchAnalytics} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="border-border">
              <Calendar className="w-4 h-4 mr-2" />
              Last 6 Months
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse bg-white">
                <div className="h-10 w-10 bg-slate-100 rounded mb-4" />
                <div className="h-6 w-24 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </Card>
            ))
          ) : (
            cards.map((card, index) => (
              <Card key={index} className="p-6 bg-white border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className={`text-sm flex items-center ${card.trendUp ? 'text-accent' : 'text-danger'}`}>
                    {card.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground font-numbers">{card.value}</p>
                <p className="text-sm text-muted">{card.title}</p>
              </Card>
            ))
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            Generating Interactive Charts...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Production Trend</h3>
                <p className="text-sm text-muted">Weekly production output vs target</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productionTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Machine Downtime Analysis</h3>
                <p className="text-sm text-muted">Total downtime in minutes per machine</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineDowntime}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="machine" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="downtime" fill="#4F6D7A" name="Downtime (min)">
                      {machineDowntime.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#D93025' : '#4F6D7A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Inventory Category Breakdown</h3>
                <p className="text-sm text-muted">Current stock levels by category</p>
              </div>
              <div className="h-64 flex justify-center items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryABC}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {inventoryABC.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2 text-sm text-muted">
                  {inventoryABC.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.category}: {entry.value.toLocaleString()} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Profit Margin Trend</h3>
                <p className="text-sm text-muted">Monthly average profit margin (%)</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="profit" stroke="#2E8B57" strokeWidth={3} name="Margin (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-6 bg-linear-to-r from-primary/5 to-secondary/5 border-l-4 border-l-primary">
          <h3 className="font-semibold text-foreground mb-4">AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="font-medium text-foreground">Production</span>
              </div>
              <p className="text-sm text-muted">
                Output increased by 15% after implementing shift optimization
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="font-medium text-foreground">Maintenance</span>
              </div>
              <p className="text-sm text-muted">
                Preventive maintenance reduced downtime by 22%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="font-medium text-foreground">Cost</span>
              </div>
              <p className="text-sm text-muted">
                Energy optimization saved ₹28,000 this month
              </p>
            </div>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
