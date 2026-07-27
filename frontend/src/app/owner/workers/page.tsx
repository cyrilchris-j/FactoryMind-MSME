'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, UserCheck, UserX, Clock,
  Search, Filter, Loader2, RefreshCw, TrendingDown, TrendingUp
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

interface Worker {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  shift: string;
  productivity: number;
  attendance: number;
}

interface DeptStats {
  department: string;
  required: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

export default function WorkforcePage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkforce = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/workers');
      const data = res.data ?? [];
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkforce();
  }, [fetchWorkforce]);

  const deptStats: DeptStats[] = (() => {
    const deptMap = new Map<string, { present: number; absent: number; total: number }>();
    workers.forEach(w => {
      if (!deptMap.has(w.department)) {
        deptMap.set(w.department, { present: 0, absent: 0, total: 0 });
      }
      const dept = deptMap.get(w.department)!;
      dept.total++;
      if (w.status === 'present') dept.present++;
      else dept.absent++;
    });
    return Array.from(deptMap.entries()).map(([department, stats]) => ({
      department,
      required: stats.total,
      present: stats.present,
      absent: stats.absent,
      attendanceRate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));
  })();

  const totalWorkers = workers.length;
  const totalPresent = workers.filter(w => w.status === 'present').length;
  const totalAbsent = workers.filter(w => w.status !== 'present').length;
  const overallAttendance = totalWorkers > 0 ? Math.round((totalPresent / totalWorkers) * 100) : 0;

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workforce</h1>
            <p className="text-muted">Department-level attendance and coverage</p>
          </div>
          <Button variant="outline" onClick={fetchWorkforce} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : totalWorkers}</p>
            <p className="text-sm text-muted">Total Workforce</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{loading ? '—' : totalPresent}</p>
            <p className="text-sm text-muted">Present Today</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <UserX className="w-5 h-5 text-danger" />
            </div>
            <p className="text-2xl font-bold text-danger">{loading ? '—' : totalAbsent}</p>
            <p className="text-sm text-muted">Absent Today</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : overallAttendance}%</p>
            <p className="text-sm text-muted">Overall Attendance Rate</p>
          </Card>
        </div>

        {/* Department Coverage */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Department Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptStats.map((dept) => {
              const shortfall = dept.required - dept.present;
              return (
                <Card key={dept.department} className={`p-5 ${shortfall > 2 ? 'border-2 border-warning/30 bg-warning/[0.02]' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{dept.department}</h3>
                    <Badge className={dept.attendanceRate >= 90 ? 'bg-accent/10 text-accent' : dept.attendanceRate >= 75 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}>
                      {dept.attendanceRate}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-lg font-bold text-foreground">{dept.required}</p>
                      <p className="text-xs text-muted">Required</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${dept.present >= dept.required ? 'text-accent' : 'text-warning'}`}>{dept.present}</p>
                      <p className="text-xs text-muted">Present</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-danger">{dept.absent}</p>
                      <p className="text-xs text-muted">Absent</p>
                    </div>
                  </div>
                  {shortfall > 0 && (
                    <p className="text-xs text-danger mt-2">
                      Shortfall: {shortfall} worker{shortfall > 1 ? 's' : ''} — {shortfall >= 5 ? 'Critical' : 'Low'} coverage risk
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Worker Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Worker Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left py-3 px-4 font-medium text-muted">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Shift</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Productivity</th>
                  <th className="text-right py-3 px-4 font-medium text-muted">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading workforce...
                    </td>
                  </tr>
                ) : workers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted">No workforce records found.</td>
                  </tr>
                ) : workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-foreground font-medium">{worker.name}</td>
                    <td className="py-3 px-4 text-foreground">{worker.department}</td>
                    <td className="py-3 px-4 text-muted text-xs">{worker.role}</td>
                    <td className="py-3 px-4 text-muted">{worker.shift}</td>
                    <td className="py-3 px-4">
                      <Badge className={worker.status === 'present' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}>
                        {worker.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-numbers">{worker.productivity}%</td>
                    <td className="py-3 px-4 text-right font-numbers">{worker.attendance}%</td>
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
