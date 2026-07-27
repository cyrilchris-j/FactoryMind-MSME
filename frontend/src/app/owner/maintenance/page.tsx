'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench, AlertTriangle, TrendingDown, TrendingUp,
  Search, Filter, Loader2, RefreshCw, Clock
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface MaintenanceRecord {
  id: string;
  machineCode: string;
  machineName: string;
  issueType: string;
  description: string;
  priority: string;
  status: string;
  reportedDate: string;
  downtimeMinutes: number;
  maintenanceCost: number;
  expectedResolution: string;
  nextMaintenance: string;
  notes: string;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/maintenance');
      const data = res.data ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        machineCode: d.machineCode || 'Unknown',
        machineName: d.machineName || '',
        issueType: d.issueType || '',
        description: d.description || '',
        priority: d.priority || 'MEDIUM',
        status: d.status || 'PENDING',
        reportedDate: d.reportedDate || new Date().toISOString(),
        downtimeMinutes: d.downtimeMinutes || 0,
        maintenanceCost: d.maintenanceCost || 0,
        expectedResolution: d.expectedResolution || '',
        nextMaintenance: d.nextMaintenance || '',
        notes: d.notes || '',
      }));
      const filtered = search
        ? formatted.filter((r: any) =>
            r.machineCode.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase())
          )
        : formatted;
      setRecords(filtered);
    } catch (err) {
      console.error('Failed to fetch maintenance', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const activeIssues = records.filter(r => r.status !== 'COMPLETED' && r.status !== 'RESOLVED').length;
  const criticalIssues = records.filter(r => r.priority === 'HIGH' && r.status !== 'COMPLETED').length;
  const totalDowntimeMin = records.reduce((s, r) => s + r.downtimeMinutes, 0);
  const breakdownMachines = records.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING');

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted">Machine health and repair tracking</p>
          </div>
          <Button variant="outline" onClick={fetchMaintenance} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* CNC-04 Breakdown Alert */}
        {records.filter(r => r.machineCode === 'CNC-04' && r.status === 'IN_PROGRESS').length > 0 && (
          <Card className="p-5 border-2 border-danger/30 bg-danger/[0.02]">
            <div className="flex items-start gap-3">
              <Wrench className="w-6 h-6 text-danger shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">CNC-04 — Cutting Tool Failure</h3>
                  <Badge className="bg-danger/10 text-danger animate-pulse">HIGH PRIORITY</Badge>
                </div>
                <p className="text-sm text-muted mt-1">
                  CNC Machining Center #4 experienced a cutting tool failure during the morning shift.
                  Downtime: 45 minutes. Spindle vibration detected. Requires tool holder replacement and alignment.
                  Expected resolution: tomorrow.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45 min downtime</span>
                  <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> Est. cost: ₹8,500</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : activeIssues}</p>
            <p className="text-sm text-muted">Active Issues</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <p className="text-2xl font-bold text-danger">{loading ? '—' : criticalIssues}</p>
            <p className="text-sm text-muted">High Priority</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{loading ? '—' : `${Math.round(totalDowntimeMin / 60)} hrs`}</p>
            <p className="text-sm text-muted">Total Downtime</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : breakdownMachines.length}</p>
            <p className="text-sm text-muted">Machines in Breakdown</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Maintenance Tickets</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Issue Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Downtime</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Expected Resolution</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading tickets...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">No maintenance tickets found.</td>
                  </tr>
                ) : records.map((record) => (
                  <tr key={record.id} className={`border-b border-border hover:bg-background ${record.priority === 'HIGH' && record.status !== 'COMPLETED' ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{record.machineCode}</span>
                      {record.machineName && <span className="text-xs text-muted ml-1">({record.machineName})</span>}
                    </td>
                    <td className="py-3 px-4 text-foreground">{record.issueType}</td>
                    <td className="py-3 px-4 text-muted max-w-xs truncate text-xs">{record.description}</td>
                    <td className="py-3 px-4">
                      <Badge className={record.priority === 'HIGH' ? 'bg-danger/10 text-danger' : record.priority === 'MEDIUM' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'}>
                        {record.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={record.status === 'COMPLETED' || record.status === 'RESOLVED' ? 'bg-accent/10 text-accent' : record.status === 'IN_PROGRESS' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}>
                        {record.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-numbers">{record.downtimeMinutes}m</td>
                    <td className="py-3 px-4 text-xs text-muted">
                      {record.expectedResolution ? new Date(record.expectedResolution).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OwnerLayout>
  );
}
