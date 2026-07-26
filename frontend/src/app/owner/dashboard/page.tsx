'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import {
  TrendingUp, TrendingDown, Activity, DollarSign, Zap, Users, Package,
  Wrench, AlertTriangle, Bot, RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';

interface DashboardMetrics {
  todayProduction: number;
  productionTarget: number;
  machineUtilization: number;
  activeMachines: number;
  maintenanceMachines: number;
  totalDowntime: number;
  lowStockItems: number;
  energyCost: number;
  workerAttendance: number;
  pendingOrders: number;
  revenue: number;
}

function SkeletonCard() {
  return (
    <div className="p-4 md:p-6 rounded-xl border border-border bg-white animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="w-12 h-4 bg-gray-200 rounded" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
      <div className="h-7 bg-gray-200 rounded w-20" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const data: any = await apiGet('/api/dashboard')
      setMetrics({
        todayProduction: data.hero?.productionTarget?.actual ?? 0,
        productionTarget: data.hero?.productionTarget?.target ?? 0,
        machineUtilization: data.hero?.overallEfficiency ?? 0,
        activeMachines: data.hero?.runningMachines ?? 0,
        maintenanceMachines: 0,
        totalDowntime: 0,
        lowStockItems: 0,
        energyCost: data.hero?.energyUsage ?? 0,
        workerAttendance: data.kpis?.[2]?.value ?? 0,
        pendingOrders: 0,
        revenue: data.hero?.profitToday ?? 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
      setMounted(true);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!user?.factoryId) return

    const today = new Date().toISOString().split('T')[0]
    const prodQ = query(
      collection(db, 'production'),
      where('factoryId', '==', user.factoryId),
      where('date', '==', today),
      limit(100)
    )
    const unsubProd = onSnapshot(prodQ, (snap) => {
      const todayActual = snap.docs.reduce((s, d) => s + (d.data().actualQuantity || 0), 0)
      setMetrics(prev => prev ? { ...prev, todayProduction: todayActual } : prev)
      setRealtimeUpdates(c => c + 1)
    })

    const notifQ = query(
      collection(db, 'notifications'),
      where('factoryId', '==', user.factoryId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    const unsubNotif = onSnapshot(notifQ, () => {
      setRealtimeUpdates(c => c + 1)
    })

    return () => { unsubProd(); unsubNotif() }
  }, [user?.factoryId])

  const productionPct = metrics && metrics.productionTarget > 0
    ? Math.round((metrics.todayProduction / metrics.productionTarget) * 100)
    : 0;

  const kpiData = metrics ? [
    {
      title: "Today's Production",
      value: metrics.todayProduction.toLocaleString(),
      unit: 'units',
      trend: `${productionPct}% of target`,
      trendUp: productionPct >= 80,
      icon: Activity,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Machine Utilization',
      value: `${metrics.machineUtilization}`,
      unit: '%',
      trend: `${metrics.activeMachines} running`,
      trendUp: metrics.machineUtilization >= 70,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Machines in Maintenance',
      value: `${metrics.maintenanceMachines}`,
      unit: 'machines',
      trend: metrics.maintenanceMachines > 3 ? 'Needs attention' : 'Normal',
      trendUp: metrics.maintenanceMachines <= 3,
      icon: Wrench,
      color: 'text-danger',
      bgColor: 'bg-[#D93025]/10',
    },
    {
      title: 'Total Downtime',
      value: `${Math.round(metrics.totalDowntime / 60 * 10) / 10}`,
      unit: 'hrs',
      trend: metrics.totalDowntime > 180 ? 'High' : 'Acceptable',
      trendUp: metrics.totalDowntime <= 180,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Low Stock Items',
      value: `${metrics.lowStockItems}`,
      unit: 'items',
      trend: metrics.lowStockItems > 0 ? 'Needs replenishment' : 'All stocked',
      trendUp: metrics.lowStockItems === 0,
      icon: Package,
      color: 'text-secondary',
      bgColor: 'bg-[#4F6D7A]/10',
    },
    {
      title: 'Energy Cost Today',
      value: `₹${(metrics.energyCost / 1000).toFixed(1)}K`,
      unit: '',
      trend: 'Today',
      trendUp: true,
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Worker Attendance',
      value: `${metrics.workerAttendance}`,
      unit: '%',
      trend: metrics.workerAttendance >= 90 ? 'Excellent' : 'Below average',
      trendUp: metrics.workerAttendance >= 90,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Orders',
      value: `${metrics.pendingOrders}`,
      unit: 'orders',
      trend: 'In progress',
      trendUp: true,
      icon: DollarSign,
      color: 'text-secondary',
      bgColor: 'bg-[#4F6D7A]/10',
    },
  ] : [];

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="bg-linear-to-r from-primary to-secondary rounded-xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Owner'}
                </h1>
                {realtimeUpdates > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-100 text-xs font-medium animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-white/70 mt-1">Here's your factory status for today.</p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchMetrics(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Production Achievement</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${productionPct}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Machine Utilization</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${metrics?.machineUtilization ?? 0}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Worker Attendance</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${metrics?.workerAttendance ?? 0}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Pending Orders</p>
              <p className="text-2xl font-bold">{loading ? '—' : metrics?.pendingOrders ?? 0}</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : kpiData.map((kpi, index) => (
              <Card key={index} className="p-4 md:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${kpi.trendUp ? 'text-accent' : 'text-danger'}`}>
                    {kpi.trendUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                    {kpi.trend}
                  </div>
                </div>
                <p className="text-muted text-xs mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value}
                  {kpi.unit && <span className="text-sm font-normal text-muted ml-1">{kpi.unit}</span>}
                </p>
              </Card>
            ))
          }
        </div>

        {/* Quick Actions */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/owner/production" className="p-4 border border-border rounded-xl hover:bg-background hover:border-primary/30 transition-all text-left group">
              <Activity className="w-5 h-5 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">View Production</p>
              <p className="text-xs text-muted">Orders & output</p>
            </Link>
            <Link href="/owner/maintenance" className="p-4 border border-border rounded-xl hover:bg-background hover:border-warning/30 transition-all text-left">
              <Wrench className="w-5 h-5 text-warning mb-2" />
              <p className="font-medium text-foreground text-sm">Maintenance</p>
              <p className="text-xs text-muted">Machine health</p>
            </Link>
            <Link href="/owner/inventory" className="p-4 border border-border rounded-xl hover:bg-background hover:border-secondary/30 transition-all text-left">
              <Package className="w-5 h-5 text-secondary mb-2" />
              <p className="font-medium text-foreground text-sm">Inventory</p>
              <p className="text-xs text-muted">Stock levels</p>
            </Link>
            <Link href="/owner/ai-copilot" className="p-4 border border-border rounded-xl hover:bg-background hover:border-purple-300 transition-all text-left">
              <Bot className="w-5 h-5 text-purple-600 mb-2" />
              <p className="font-medium text-foreground text-sm">Ask AI</p>
              <p className="text-xs text-muted">Get insights</p>
            </Link>
          </div>
        </Card>

        {/* Last Updated */}
        <p className="text-center text-xs text-muted">
          Dashboard data last refreshed at {mounted ? lastUpdated.toLocaleTimeString() : ''}
          {realtimeUpdates > 0 && ` · ${realtimeUpdates} realtime update${realtimeUpdates > 1 ? 's' : ''} received`}
        </p>
      </div>
    </OwnerLayout>
  );
}
