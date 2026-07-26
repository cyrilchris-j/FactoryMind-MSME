'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface MaintenanceRecord {
  id: string;
  machine_code: string;
  machine_name: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
  reported_date: string;
  downtime_minutes: number;
}

interface Stats {
  activeIssues: number;
  criticalAlerts: number;
  avgResolutionTime: string;
  totalDowntime: string;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/maintenance');
      const data = res.data ?? [];
      const formatted = data.map((d: any) => ({
        id: d.id,
        machine_code: d.machineCode || 'Unknown',
        machine_name: d.machineName || '',
        issue_type: d.issueType || '',
        description: d.description || '',
        priority: d.priority || 'MEDIUM',
        status: d.status || 'PENDING',
        reported_date: d.reportedDate || new Date().toISOString(),
        downtime_minutes: d.downtimeMinutes || 0,
      }));
      const filtered = search
        ? formatted.filter((r: any) =>
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            r.machine_code.toLowerCase().includes(search.toLowerCase())
          )
        : formatted;
      setRecords(filtered);

      const activeIssues = filtered.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'RESOLVED').length;
      const criticalAlerts = filtered.filter((r: any) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED').length;
      const totalDowntimeMin = filtered.reduce((sum: number, r: any) => sum + r.downtime_minutes, 0);

      setStats({
        activeIssues,
        criticalAlerts,
        avgResolutionTime: '4.5 hrs',
        totalDowntime: `${Math.round(totalDowntimeMin / 60)} hrs`,
      });
    } catch (err) {
      console.error('Failed to fetch maintenance', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-[#D93025]/10 text-danger',
      HIGH: 'bg-warning/10 text-warning',
      MEDIUM: 'bg-primary/10 text-primary',
      LOW: 'bg-accent/10 text-accent',
    };
    return colors[priority] || 'bg-[#4F6D7A]/10 text-secondary';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-[#D93025]/10 text-danger',
      IN_PROGRESS: 'bg-warning/10 text-warning',
      RESOLVED: 'bg-accent/10 text-accent',
      COMPLETED: 'bg-accent/10 text-accent',
    };
    return colors[status] || 'bg-[#4F6D7A]/10 text-secondary';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted">Track machine health and repair tickets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMaintenance} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Wrench className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="text-sm text-danger flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.activeIssues}
            </p>
            <p className="text-sm text-muted">Active Issues</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span className="text-sm text-accent flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -1
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.criticalAlerts}
            </p>
            <p className="text-sm text-muted">Critical Alerts</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -30m
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.avgResolutionTime}
            </p>
            <p className="text-sm text-muted">Avg Resolution Time</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-secondary" />
              <span className="text-sm text-danger flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2h
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-numbers">
              {loading ? '—' : stats?.totalDowntime}
            </p>
            <p className="text-sm text-muted">Total Downtime</p>
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
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Reported</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Issue Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
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
                  <tr key={record.id} className="border-b border-border hover:bg-background">
                    <td className="py-4 px-4 text-foreground">
                      {new Date(record.reported_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium">
                      {record.machine_code}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {record.issue_type}
                    </td>
                    <td className="py-4 px-4 text-muted max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getPriorityColor(record.priority)}>
                        {record.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
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
