'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell, AlertTriangle, Package, Wrench, ShieldAlert,
  Users, Clock, CheckCircle2, Zap, ShoppingCart, Loader2, RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface AlertItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

const alertIcons: Record<string, any> = {
  material: Package,
  machine: Wrench,
  quality: ShieldAlert,
  workforce: Users,
  order: ShoppingCart,
  energy: Zap,
  production: Clock,
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
};

const severityBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const kpiRes: any = await apiGet('/api/manufacturing-kpis');
      const kpi = kpiRes;
      const items: AlertItem[] = [];

      if (kpi?.criticalIssues) {
        kpi.criticalIssues.forEach((issue: any, idx: number) => {
          items.push({
            id: `issue-${idx}`,
            type: issue.type || 'material',
            title: issue.title || 'Critical Issue',
            description: issue.description || '',
            severity: issue.severity || 'high',
            source: 'Factory Monitor',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          });
        });
      }

      if (kpi?.primaryConstraintShortage > 0) {
        items.push({
          id: 'bom-constraint',
          type: 'material',
          title: `BOM Constraint: ${kpi.primaryConstraint}`,
          description: `${kpi.primaryConstraintShortage} units short — max buildable: ${kpi.maxBuildable} assemblies`,
          severity: 'critical',
          source: 'BOM Intelligence',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      if (kpi?.breakdownMachinesList?.length > 0) {
        kpi.breakdownMachinesList.forEach((m: any, idx: number) => {
          items.push({
            id: `breakdown-${idx}`,
            type: 'machine',
            title: `Machine Breakdown: ${m.machineName}`,
            description: `${m.machineCode} is currently down. Check maintenance log for details.`,
            severity: 'critical',
            source: 'Machine Monitoring',
            timestamp: new Date().toISOString(),
            acknowledged: false,
          });
        });
      }

      if (kpi?.orderRiskStatus === 'AT RISK' || kpi?.orderRiskStatus === 'CRITICAL') {
        items.push({
          id: 'order-risk',
          type: 'order',
          title: `Order Risk: ${kpi.orderRiskStatus}`,
          description: kpi.primaryOrder
            ? `${kpi.primaryOrder.orderNumber} (${kpi.primaryOrder.customerName}) — ${kpi.primaryOrder.remaining} units remaining, due ${kpi.primaryOrder.dueDate}`
            : 'One or more orders at risk of delay',
          severity: kpi.orderRiskStatus === 'CRITICAL' ? 'critical' : 'high',
          source: 'Order Tracking',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      try {
        const maintRes: any = await apiGet('/api/maintenance');
        const maintData = maintRes.data ?? [];
        const criticalMaint = maintData.filter((m: any) => m.priority === 'CRITICAL' && m.status !== 'COMPLETED');
        criticalMaint.forEach((m: any, idx: number) => {
          items.push({
            id: `maint-critical-${idx}`,
            type: 'machine',
            title: `Critical Maintenance: ${m.machineName || m.machineCode}`,
            description: m.description || `${m.issueType} issue reported`,
            severity: 'critical',
            source: 'Maintenance Log',
            timestamp: m.reportedDate || new Date().toISOString(),
            acknowledged: false,
          });
        });
      } catch {}

      if (kpi?.rejectionRate && parseFloat(kpi.rejectionRate) > 5) {
        items.push({
          id: 'quality-alert',
          type: 'quality',
          title: `High Rejection Rate: ${kpi.rejectionRate}`,
          description: `${kpi.rejectedQuantity} units rejected out of ${kpi.totalInspected} inspected`,
          severity: parseFloat(kpi.rejectionRate) > 10 ? 'critical' : 'high',
          source: 'Quality Control',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      if (kpi?.workerAttendance && kpi.workerAttendance < 80) {
        items.push({
          id: 'attendance-alert',
          type: 'workforce',
          title: `Low Attendance: ${kpi.workerAttendance}%`,
          description: `${kpi.absentWorkers} workers absent today`,
          severity: 'high',
          source: 'Workforce Management',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }

      items.sort((a, b) => {
        const sev: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (sev[a.severity] ?? 4) - (sev[b.severity] ?? 4);
      });

      setAlerts(items);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <OwnerLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Alerts & Notifications</h1>
            </div>
            <p className="text-sm text-muted mt-1">Real-time issues requiring owner attention</p>
          </div>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-background transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-2xl font-bold font-numbers text-red-600">{criticalCount}</p>
            <p className="text-xs text-muted">Critical</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold font-numbers text-orange-600">{highCount}</p>
            <p className="text-xs text-muted">High Priority</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold font-numbers text-foreground">{alerts.length}</p>
            <p className="text-xs text-muted">Total Alerts</p>
          </Card>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">All Clear</p>
            <p className="text-sm text-muted">No critical issues detected. Factory is operating normally.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = alertIcons[alert.type] || AlertTriangle;
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${severityColors[alert.severity] || 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <Badge className={severityBadge[alert.severity] || ''}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] opacity-60">{alert.source}</span>
                      <span className="text-[10px] opacity-60">
                        {new Date(alert.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
