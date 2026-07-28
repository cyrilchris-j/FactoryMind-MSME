'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet, Plus, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { apiGet } from '@/lib/api';

interface SubmissionStats {
  todayCount: number;
  lastSubmission: string | null;
  todayTarget: number;
  todayActual: number;
}

interface RecentRecord {
  id: string;
  date: string;
  shift: string;
  product_name: string;
  target_quantity: number;
  actual_quantity: number;
  downtime_minutes: number;
  created_at: string;
}

function formatTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [recent, setRecent] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const department = user?.department || 'Production';
  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/production?limit=50');
      const records = res.data ?? [];
      const todayRecords: RecentRecord[] = records.filter(
        (r: any) => r.date === today
      );
      const todayCount = todayRecords.length;
      const lastSubmission = todayRecords[0]?.created_at ?? null;
      const todayTarget = todayRecords.reduce((s: number, r: any) => s + (r.targetQuantity || 0), 0);
      const todayActual = todayRecords.reduce((s: number, r: any) => s + (r.actualQuantity || 0), 0);

      setStats({ todayCount, lastSubmission, todayTarget, todayActual });
      setRecent(todayRecords.slice(0, 5).map((r: any) => ({
        id: r.id,
        date: r.date,
        shift: r.shift || '',
        product_name: r.productName || '',
        target_quantity: r.targetQuantity || 0,
        actual_quantity: r.actualQuantity || 0,
        downtime_minutes: r.downtimeMinutes || 0,
        created_at: r.createdAt || r.date,
      })));
    } catch (err) {
      console.error('Failed to fetch production data', err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const achievementPct = stats && stats.todayTarget > 0
    ? Math.round((stats.todayActual / stats.todayTarget) * 100)
    : 0;

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-primary to-secondary rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'}
              </h1>
              <p className="text-white/70 text-sm">Department: {department}</p>
              <p className="text-white/50 text-xs mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={fetchData} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {!loading && stats && stats.todayTarget > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Today's Production Progress</span>
                <span>{achievementPct}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${achievementPct >= 80 ? 'bg-green-400' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(achievementPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>Actual: {stats.todayActual.toLocaleString()} units</span>
                <span>Target: {stats.todayTarget.toLocaleString()} units</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">Manual Data Entry</h3>
                <p className="text-sm text-muted">Add individual brake parts production records for each shift.</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Plus className="w-5 h-5" />
              </div>
            </div>
            <Link href="/manager/data-entry">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Log {department} Data
              </Button>
            </Link>
          </Card>

          <Card className="p-6 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">Bulk Upload (Excel/CSV)</h3>
                <p className="text-sm text-muted">Upload bulk brake parts data using the provided templates.</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <Link href="/manager/data-entry?tab=upload">
              <Button variant="outline" className="w-full border-border">
                Upload File
              </Button>
            </Link>
          </Card>
        </div>

        {/* Stats */}
        <h2 className="text-base font-semibold text-foreground">Today's Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Today's Submissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '—' : stats?.todayCount ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${achievementPct >= 80 ? 'bg-green-50' : 'bg-amber-50'}`}>
                {achievementPct >= 80
                  ? <TrendingUp className="w-5 h-5 text-green-600" />
                  : <TrendingDown className="w-5 h-5 text-amber-600" />
                }
              </div>
              <div>
                <p className="text-xs text-muted">Achievement vs Target</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '—' : `${achievementPct}%`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted">Last Submission</p>
                <p className="text-sm font-bold text-foreground">
                  {loading ? '—' : stats?.lastSubmission ? formatTime(stats.lastSubmission) : 'None today'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Submissions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Today's Submissions</h2>
            <Link href="/manager/history" className="text-sm text-primary hover:underline font-medium">
              View all history →
            </Link>
          </div>
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="p-10 text-center">
                <AlertCircle className="w-10 h-10 text-border mx-auto mb-2" />
                <p className="text-sm text-muted font-medium">No submissions yet today</p>
                <p className="text-xs text-muted mt-1">Use the "Input Brake Parts" button to enter production data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted">Product</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted">Shift</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted">Target</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted">Actual</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted">Downtime</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-background">
                        <td className="py-3 px-4 font-medium text-foreground">{r.product_name}</td>
                        <td className="py-3 px-4 text-muted">{r.shift}</td>
                        <td className="py-3 px-4 text-right text-muted">{r.target_quantity.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right font-medium ${r.actual_quantity >= r.target_quantity ? 'text-green-600' : 'text-amber-600'}`}>
                          {r.actual_quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-muted">{r.downtime_minutes}m</td>
                        <td className="py-3 px-4 text-right text-muted text-xs">{formatTime(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
