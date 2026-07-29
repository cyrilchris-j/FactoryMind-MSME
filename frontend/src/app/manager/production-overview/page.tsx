'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3, Factory, Target, CheckCircle2, AlertTriangle,
  Loader2, RefreshCw, TrendingUp, Package, Wrench, Users
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

const COMPONENT_NAMES: Record<string, string> = {
  BRAKE_DISC: 'Brake Disc',
  BRAKE_CALIPER: 'Brake Caliper',
  BRAKE_PAD: 'Brake Pad',
  PISTON: 'Piston',
  CALIPER_BRACKET: 'Caliper Bracket',
  GUIDE_PIN: 'Guide Pin',
  SEAL_RING: 'Seal Ring',
  DUST_BOOT: 'Dust Boot',
  BOLT_KIT: 'Bolt Kit',
  WEAR_SENSOR: 'Wear Sensor',
};

const BOM_QTY: Record<string, number> = {
  BRAKE_DISC: 1, BRAKE_CALIPER: 1, BRAKE_PAD: 2, PISTON: 1,
  CALIPER_BRACKET: 1, GUIDE_PIN: 2, SEAL_RING: 1, DUST_BOOT: 1,
  BOLT_KIT: 1, WEAR_SENSOR: 1,
};

interface ComponentSummary {
  componentCode: string;
  componentName: string;
  currentStock: number;
  requiredPerAssembly: number;
  maxBuildable: number;
  shortage: number;
  isReady: boolean;
  status: string;
}

export default function ProductionOverviewPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allComponents, setAllComponents] = useState<ComponentSummary[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiGet('/api/manufacturing-kpis');
      setKpi(data);

      const res: any = await apiGet('/api/components');
      const comps = (res?.data ?? []).map((c: any) => {
        const code = c.componentCode || c.materialCode || '';
        const name = COMPONENT_NAMES[code] || c.componentName || c.materialName || code;
        const qty = BOM_QTY[code] || 1;
        const stock = Number(c.currentStock || c.availableQuantity || 0);
        const maxB = Math.floor(stock / qty);
        const short = Math.max(0, qty - stock);
        return {
          componentCode: code,
          componentName: name,
          currentStock: stock,
          requiredPerAssembly: qty,
          maxBuildable: maxB,
          shortage: short,
          isReady: short === 0,
          status: short > 10 ? 'CRITICAL' : short > 0 ? 'LOW' : 'OK',
        };
      });
      setAllComponents(comps);
    } catch {
      console.error('Failed to fetch production data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const orderQty = kpi?.primaryOrder?.quantity || 250;
  const maxBuildable = allComponents.length > 0
    ? Math.min(...allComponents.map(c => c.maxBuildable || 0))
    : 0;
  const constraint = allComponents.find(c => c.maxBuildable === maxBuildable);

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Overall Production View</h1>
            </div>
            <p className="text-sm text-muted mt-1">Across all 10 BOM components · Brake Assembly</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading production overview...
          </div>
        ) : (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-medium uppercase">Order Target</span>
                  <Target className="w-4 h-4 text-muted" />
                </div>
                <p className="text-2xl font-bold font-numbers text-foreground">{kpi?.productionTarget || orderQty}</p>
                <p className="text-xs text-muted">assemblies due</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-medium uppercase">Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold font-numbers text-emerald-600">{kpi?.completedProduction || 0}</p>
                <p className="text-xs text-muted">{kpi?.productionAchievement || 0}% of target</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-medium uppercase">Max Buildable</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold font-numbers text-primary">{maxBuildable}</p>
                <p className="text-xs text-muted">with current stock</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted font-medium uppercase">Material Status</span>
                  <Package className="w-4 h-4 text-amber-500" />
                </div>
                <p className={`text-2xl font-bold font-numbers ${allComponents.every(c => c.isReady) ? 'text-emerald-600' : 'text-red-600'}`}>
                  {allComponents.filter(c => c.isReady).length}/{allComponents.length}
                </p>
                <p className="text-xs text-muted">components ready</p>
              </Card>
            </div>

            {/* Constraint Alert */}
            {constraint && !constraint.isReady && (
              <Card className="p-4 border-2 border-red-200 bg-red-50/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Primary Constraint: {constraint.componentName}</p>
                    <p className="text-sm text-red-700">Stock: {constraint.currentStock} · Need: {constraint.requiredPerAssembly} per assembly · Max buildable: {constraint.maxBuildable} assemblies</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Component Status Grid */}
            <Card className="p-5">
              <h2 className="text-base font-bold text-foreground mb-4">BOM Component Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {allComponents.map(c => {
                  const isConstraint = constraint?.componentCode === c.componentCode && !c.isReady;
                  return (
                    <div key={c.componentCode}
                      className={`p-3 rounded-xl border transition-all ${
                        isConstraint ? 'bg-red-50 border-red-300 ring-1 ring-red-300' :
                        c.isReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                      <div className="flex items-start justify-between mb-2">
                        {c.isReady ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className={`w-4 h-4 ${isConstraint ? 'text-red-500' : 'text-amber-500'}`} />
                        )}
                        <span className="text-[10px] font-medium text-muted">×{c.requiredPerAssembly}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground mb-1">{c.componentName}</p>
                      <p className={`text-lg font-bold font-numbers ${isConstraint ? 'text-red-600' : c.isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {c.currentStock}
                      </p>
                      <p className="text-[10px] text-muted">
                        {c.isReady ? `Builds ${c.maxBuildable}` : `Short ${c.shortage}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="w-4 h-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">Machines</span>
                </div>
                <p className="text-lg font-bold font-numbers">{kpi?.runningMachines || 0}/{kpi?.totalMachines || 0}</p>
                <p className="text-xs text-muted">running</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">Downtime</span>
                </div>
                <p className="text-lg font-bold font-numbers">{kpi?.totalDowntime || 0} min</p>
                <p className="text-xs text-muted">today</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted" />
                  <span className="text-sm font-medium text-foreground">Workforce</span>
                </div>
                <p className="text-lg font-bold font-numbers">{kpi?.presentWorkers || 0}/{kpi?.totalWorkers || 0}</p>
                <p className="text-xs text-muted">present</p>
              </Card>
            </div>
          </>
        )}
      </div>
    </ManagerLayout>
  );
}