'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Activity, Zap, Users, Package,
  Wrench, AlertTriangle, Bot, RefreshCw, Target, CheckCircle2, Clock, Factory
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface ManufacturingKPI {
  factoryName: string;
  industry: string;
  productionTarget: number;
  completedProduction: number;
  productionAchievement: number;
  rejectionRate: string;
  totalDowntime: number;
  maxBuildable: number;
  materialReadiness: number;
  criticalShortages: number;
  primaryConstraint: string;
  totalMachines: number;
  runningMachines: number;
  breakdownMachines: number;
  maintenanceMachines: number;
  machineUtilization: number;
  totalWorkers: number;
  presentWorkers: number;
  workerAttendance: number;
  ordersAtRisk: number;
  totalEnergyKwh: number;
  energyPerUnit: string;
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
  const [kpi, setKpi] = useState<ManufacturingKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchKPI = useCallback(async () => {
    try {
      const data: any = await apiGet('/api/manufacturing-kpis');
      setKpi(data);
    } catch (err) {
      console.error('Failed to fetch manufacturing KPIs', err);
    } finally {
      setLoading(false);
      setMounted(true);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchKPI();
  }, [fetchKPI]);

  useEffect(() => {
    if (!user?.factoryId) return;

    const prodQ = query(
      collection(db, 'production'),
      where('factoryId', '==', user.factoryId)
    );
    const unsubProd = onSnapshot(prodQ, () => {
      setRealtimeUpdates(c => c + 1);
    });

    const notifQ = query(
      collection(db, 'notifications'),
      where('factoryId', '==', user.factoryId),
      where('isRead', '==', false)
    );
    const unsubNotif = onSnapshot(notifQ, () => {
      setRealtimeUpdates(c => c + 1);
    });

    return () => { unsubProd(); unsubNotif(); };
  }, [user?.factoryId]);

  const isHighRisk = kpi && (
    kpi.productionAchievement < 70 ||
    kpi.criticalShortages > 0 ||
    kpi.breakdownMachines > 0 ||
    kpi.ordersAtRisk > 0
  );

  const kpiCards = kpi ? [
    {
      title: 'Production Target',
      value: kpi.productionTarget.toLocaleString(),
      unit: 'units',
      trend: '',
      trendUp: true,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: kpi.completedProduction.toLocaleString(),
      unit: 'units',
      trend: '',
      trendUp: true,
      icon: CheckCircle2,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Production Achievement',
      value: `${kpi.productionAchievement}`,
      unit: '%',
      trend: kpi.productionAchievement >= 80 ? 'On track' : 'Below target',
      trendUp: kpi.productionAchievement >= 80,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Material Readiness',
      value: `${kpi.materialReadiness}`,
      unit: '%',
      trend: kpi.criticalShortages > 0 ? `${kpi.criticalShortages} shortages` : 'All stocked',
      trendUp: kpi.criticalShortages === 0,
      icon: Package,
      color: 'text-secondary',
      bgColor: 'bg-[#4F6D7A]/10',
    },
    {
      title: 'Maximum Buildable',
      value: kpi.maxBuildable.toLocaleString(),
      unit: 'units',
      trend: `Constraint: ${kpi.primaryConstraint || 'None'}`,
      trendUp: kpi.maxBuildable >= kpi.productionTarget,
      icon: Factory,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Critical Shortages',
      value: `${kpi.criticalShortages}`,
      unit: 'items',
      trend: kpi.criticalShortages > 0 ? 'Needs attention' : 'None',
      trendUp: kpi.criticalShortages === 0,
      icon: AlertTriangle,
      color: 'text-danger',
      bgColor: 'bg-[#D93025]/10',
    },
    {
      title: 'Machines Running',
      value: `${kpi.runningMachines}/${kpi.totalMachines}`,
      unit: '',
      trend: `${kpi.machineUtilization}% utilization`,
      trendUp: kpi.machineUtilization >= 70,
      icon: Wrench,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Machine Downtime',
      value: `${Math.round(kpi.totalDowntime / 60)}`,
      unit: 'hrs',
      trend: kpi.breakdownMachines > 0 ? `${kpi.breakdownMachines} breakdown(s)` : 'Normal',
      trendUp: kpi.breakdownMachines === 0,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Worker Attendance',
      value: `${kpi.workerAttendance}`,
      unit: '%',
      trend: `${kpi.presentWorkers}/${kpi.totalWorkers} present`,
      trendUp: kpi.workerAttendance >= 90,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Orders at Risk',
      value: `${kpi.ordersAtRisk}`,
      unit: 'orders',
      trend: kpi.ordersAtRisk > 0 ? 'Requires action' : 'All clear',
      trendUp: kpi.ordersAtRisk === 0,
      icon: AlertTriangle,
      color: 'text-danger',
      bgColor: 'bg-[#D93025]/10',
    },
    {
      title: 'Rejection Rate',
      value: kpi.rejectionRate,
      unit: '%',
      trend: 'Of total produced',
      trendUp: parseFloat(kpi.rejectionRate) < 3,
      icon: Activity,
      color: 'text-secondary',
      bgColor: 'bg-[#4F6D7A]/10',
    },
    {
      title: 'Energy / Unit',
      value: kpi.energyPerUnit,
      unit: 'kWh',
      trend: 'Per brake assembly',
      trendUp: true,
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ] : [];

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className={`rounded-xl p-6 md:p-8 text-white ${isHighRisk ? 'bg-linear-to-r from-danger to-red-700' : 'bg-linear-to-r from-primary to-secondary'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
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
              <p className="text-white/80 text-lg font-semibold">{kpi?.factoryName || 'Prime Auto Components'}</p>
              <p className="text-white/60 text-sm">{kpi?.industry || 'Automotive Component Manufacturing'}</p>
            </div>
            <button
              onClick={() => { setLoading(true); fetchKPI(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <p className="text-white/70 text-sm mb-3 font-medium">Today's Factory Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Production Achievement</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${kpi?.productionAchievement ?? 0}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Machine Utilization</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${kpi?.machineUtilization ?? 0}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Worker Attendance</p>
              <p className="text-2xl font-bold">{loading ? '—' : `${kpi?.workerAttendance ?? 0}%`}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Orders at Risk</p>
              <p className="text-2xl font-bold">{loading ? '—' : kpi?.ordersAtRisk ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Production Readiness Card */}
        {kpi && (
          <Card className={`p-5 border-2 ${kpi.criticalShortages > 0 || kpi.breakdownMachines > 0 ? 'border-warning/30 bg-warning/[0.02]' : 'border-accent/20 bg-accent/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                PRODUCTION READINESS
              </h2>
              <Badge className={kpi.criticalShortages > 0 || kpi.ordersAtRisk > 0 ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}>
                {kpi.criticalShortages > 0 || kpi.ordersAtRisk > 0 ? 'AT RISK' : 'ON TRACK'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-muted mb-0.5">Target</p>
                <p className="text-xl font-bold text-foreground">{kpi.productionTarget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Completed</p>
                <p className="text-xl font-bold text-accent">{kpi.completedProduction.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Remaining</p>
                <p className="text-xl font-bold text-warning">{Math.max(0, kpi.productionTarget - kpi.completedProduction).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Buildable Now</p>
                <p className={`text-xl font-bold ${kpi.maxBuildable >= kpi.productionTarget ? 'text-accent' : 'text-danger'}`}>
                  {kpi.maxBuildable.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Primary Constraint</p>
                <p className="text-lg font-bold text-danger">{kpi.primaryConstraint}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-0.5">Shortage</p>
                <p className="text-xl font-bold text-danger">{Math.max(0, kpi.productionTarget - kpi.maxBuildable).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : kpiCards.map((kpiItem, index) => (
              <Card key={index} className="p-4 md:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${kpiItem.bgColor}`}>
                    <kpiItem.icon className={`w-4 h-4 ${kpiItem.color}`} />
                  </div>
                  {kpiItem.trend && (
                    <div className={`flex items-center text-xs font-medium ${kpiItem.trendUp ? 'text-accent' : 'text-danger'}`}>
                      {kpiItem.trendUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {kpiItem.trend}
                    </div>
                  )}
                </div>
                <p className="text-muted text-xs mb-1">{kpiItem.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {kpiItem.value}
                  {kpiItem.unit && <span className="text-sm font-normal text-muted ml-1">{kpiItem.unit}</span>}
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
              <p className="text-xs text-muted">Shift output & targets</p>
            </Link>
            <Link href="/owner/products" className="p-4 border border-border rounded-xl hover:bg-background hover:border-primary/30 transition-all text-left group">
              <Package className="w-5 h-5 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">Products & BOM</p>
              <p className="text-xs text-muted">Bill of Materials</p>
            </Link>
            <Link href="/owner/inventory" className="p-4 border border-border rounded-xl hover:bg-background hover:border-secondary/30 transition-all text-left">
              <Package className="w-5 h-5 text-secondary mb-2" />
              <p className="font-medium text-foreground text-sm">Inventory</p>
              <p className="text-xs text-muted">Component stock</p>
            </Link>
            <Link href="/owner/ai-copilot" className="p-4 border border-border rounded-xl hover:bg-background hover:border-purple-300 transition-all text-left">
              <Bot className="w-5 h-5 text-purple-600 mb-2" />
              <p className="font-medium text-foreground text-sm">Ask AI</p>
              <p className="text-xs text-muted">Get insights</p>
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-muted">
          Dashboard data last refreshed at {mounted ? lastUpdated.toLocaleTimeString() : ''}
          {realtimeUpdates > 0 && ` · ${realtimeUpdates} realtime update${realtimeUpdates > 1 ? 's' : ''} received`}
        </p>
      </div>
    </OwnerLayout>
  );
}
