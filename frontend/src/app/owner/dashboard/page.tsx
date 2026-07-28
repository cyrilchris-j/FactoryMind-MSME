'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Factory, Target, AlertTriangle, CheckCircle2, XCircle,
  Activity, Wrench, Users, Zap, Sparkles, Send,
  TrendingUp, Package, ShieldAlert, Clock, ArrowRight
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface BomItem {
  componentName: string;
  componentCode: string;
  available: number;
  totalRequired: number;
  shortage: number;
  isReady: boolean;
  status: string;
  requiredPerProduct: number;
}

interface CriticalIssue {
  type: string;
  title: string;
  description: string;
  severity: string;
}

interface PrimaryOrder {
  orderNumber: string;
  customerName: string;
  quantity: number;
  completedQuantity: number;
  remaining: number;
  dueDate: string;
  priority: string;
  status: string;
}

interface KpiData {
  factoryName: string;
  productName: string;
  date: string;
  productionTarget: number;
  completedProduction: number;
  wip: number;
  remaining: number;
  productionAchievement: number;
  rejectedQuantity: number;
  rejectionRate: string;
  totalDowntime: number;
  bomReadiness: BomItem[];
  componentsReady: number;
  componentsTotal: number;
  maxBuildable: number;
  materialReadiness: number;
  materialReady: boolean;
  primaryConstraint: string;
  primaryConstraintShortage: number;
  orderRiskStatus: string;
  ordersAtRisk: number;
  primaryOrder: PrimaryOrder | null;
  totalMachines: number;
  runningMachines: number;
  breakdownMachines: number;
  maintenanceMachines: number;
  machineUtilization: number;
  breakdownMachinesList: { machineCode: string; machineName: string }[];
  activeMaintenance: number;
  totalWorkers: number;
  presentWorkers: number;
  absentWorkers: number;
  workerAttendance: number;
  totalEnergyKwh: number;
  energyPerUnit: string;
  qualityPassRate: string;
  totalInspected: number;
  criticalIssues: CriticalIssue[];
}

export default function OwnerDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchKpis = useCallback(async () => {
    try {
      const data: any = await apiGet('/api/manufacturing-kpis');
      setKpi(data);
    } catch (err) {
      console.error('Failed to fetch KPIs', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKpis();
    const interval = setInterval(fetchKpis, 30000);
    return () => clearInterval(interval);
  }, [fetchKpis]);

  const handleAiAsk = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/backend/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput, history: [] }),
      });
      const data = await res.json();
      if (data.structured && data.data) {
        setAiResponse(data.data.summary);
      } else {
        setAiResponse(data.text || 'No response.');
      }
    } catch {
      setAiResponse('Failed to get AI response.');
    }
    setAiLoading(false);
  };

  const suggestedPrompts = [
    'Why is production low today?',
    'Can we complete today\'s order?',
    'Which component is blocking production?',
    'Which machine requires attention?',
    'What should I prioritize today?',
  ];

  const riskColor = (status: string) => {
    if (status === 'CRITICAL') return 'bg-red-500 text-white';
    if (status === 'AT RISK') return 'bg-amber-500 text-white';
    if (status === 'COMPLETED') return 'bg-green-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  const issueIcon = (type: string) => {
    if (type === 'material') return <Package className="w-4 h-4" />;
    if (type === 'machine') return <Wrench className="w-4 h-4" />;
    if (type === 'quality') return <ShieldAlert className="w-4 h-4" />;
    if (type === 'workforce') return <Users className="w-4 h-4" />;
    if (type === 'order') return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const issueSeverityColor = (sev: string) => {
    if (sev === 'critical') return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-amber-50 border-amber-200 text-amber-800';
  };

  if (loading) {
    return (
      <OwnerLayout>
        <div className="p-8 flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Loading factory data...</p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  if (!kpi) {
    return (
      <OwnerLayout>
        <div className="p-8">
          <p className="text-muted">Unable to load dashboard data.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* ── SECTION 1: Factory Status Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{kpi.factoryName}</h1>
            </div>
            <p className="text-sm text-muted">
              {kpi.productName} • {new Date(kpi.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {kpi.primaryOrder && (
              <div className="text-right text-sm">
                <p className="font-medium text-foreground">{kpi.primaryOrder.orderNumber}</p>
                <p className="text-muted text-xs">{kpi.primaryOrder.customerName} • {kpi.primaryOrder.quantity} units</p>
              </div>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${riskColor(kpi.orderRiskStatus)}`}>
              {kpi.orderRiskStatus}
            </span>
          </div>
        </div>

        {/* ── Production Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Target</span>
              <Target className="w-4 h-4 text-muted" />
            </div>
            <p className="text-2xl font-bold font-numbers text-foreground">{kpi.productionTarget}</p>
            <p className="text-xs text-muted">assemblies</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-numbers text-foreground">{kpi.completedProduction}</p>
            <p className="text-xs text-muted">{kpi.productionAchievement}% of target</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Remaining</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-numbers text-foreground">{kpi.remaining}</p>
            <p className="text-xs text-muted">to produce</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted font-medium uppercase tracking-wide">Max Buildable</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-numbers text-foreground">{kpi.maxBuildable}</p>
            <p className="text-xs text-muted">with current stock</p>
          </Card>
        </div>

        {/* ── SECTION 2: BOM Readiness ── */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Brake Assembly Readiness</h2>
              <p className="text-xs text-muted mt-0.5">BOM component availability for {kpi.primaryOrder?.quantity || 250} units order</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${kpi.materialReady ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.componentsReady}/{kpi.componentsTotal} Ready
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {kpi.bomReadiness.map((comp) => (
              <div
                key={comp.componentCode}
                className={`p-3 rounded-xl border transition-all ${
                  comp.isReady
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : comp.status === 'CRITICAL'
                    ? 'bg-red-50/60 border-red-200'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  {comp.isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="text-[10px] font-medium text-muted">×{comp.requiredPerProduct}</span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight mb-1">{comp.componentName}</p>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted">Available</span>
                    <span className="font-numbers font-medium">{comp.available}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted">Required</span>
                    <span className="font-numbers font-medium">{comp.totalRequired}</span>
                  </div>
                  {comp.shortage > 0 && (
                    <div className="flex justify-between text-[10px] text-red-600 font-bold">
                      <span>Shortage</span>
                      <span className="font-numbers">{comp.shortage}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!kpi.materialReady && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <span className="font-semibold text-red-800">Primary Constraint: </span>
                <span className="text-red-700">{kpi.primaryConstraint} — {kpi.primaryConstraintShortage} units short. Max buildable: {kpi.maxBuildable} assemblies.</span>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── SECTION 3: Critical Issues ── */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Critical Issues</h2>
              <Badge className={kpi.criticalIssues.length > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
                {kpi.criticalIssues.length} active
              </Badge>
            </div>
            {kpi.criticalIssues.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700 font-medium">No critical issues. Factory operating normally.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {kpi.criticalIssues.map((issue, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${issueSeverityColor(issue.severity)}`}>
                    <div className="mt-0.5">{issueIcon(issue.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{issue.title}</p>
                      <p className="text-xs opacity-80">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── SECTION 4: Production & Machine Status ── */}
          <Card className="p-5">
            <h2 className="text-base font-bold text-foreground mb-4">Factory Operations</h2>
            <div className="space-y-4">
              {/* Production Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">Production Progress</span>
                  <span className="text-sm font-bold font-numbers">{kpi.productionAchievement}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${kpi.productionAchievement >= 90 ? 'bg-emerald-500' : kpi.productionAchievement >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, kpi.productionAchievement)}%` }}
                  />
                </div>
              </div>

              {/* Machine Status */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold font-numbers text-emerald-700">{kpi.runningMachines}</p>
                  <p className="text-[10px] font-medium text-emerald-600 uppercase">Running</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold font-numbers text-red-700">{kpi.breakdownMachines}</p>
                  <p className="text-[10px] font-medium text-red-600 uppercase">Breakdown</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold font-numbers text-amber-700">{kpi.maintenanceMachines}</p>
                  <p className="text-[10px] font-medium text-amber-600 uppercase">Maintenance</p>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted">Workforce</p>
                    <p className="text-sm font-bold font-numbers">{kpi.presentWorkers}/{kpi.totalWorkers} <span className="text-xs font-normal text-muted">({kpi.workerAttendance}%)</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted">Downtime</p>
                    <p className="text-sm font-bold font-numbers">{kpi.totalDowntime} <span className="text-xs font-normal text-muted">min</span></p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── SECTION 5: AI Factory Copilot Quick Ask ── */}
        <Card className="p-5 bg-gradient-to-r from-slate-50 to-purple-50/30 border-purple-100/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-foreground">AI Factory Copilot</h2>
            <Link href="/owner/ai-copilot" className="ml-auto text-xs text-primary hover:underline flex items-center gap-1">
              Open Full Chat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => { setAiInput(prompt); setAiResponse(''); }}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              placeholder="Ask FactoryMind about today's factory operations..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={handleAiAsk}
              disabled={aiLoading || !aiInput.trim()}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {aiLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {aiResponse && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100 text-sm text-foreground leading-relaxed">
              {aiResponse}
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
