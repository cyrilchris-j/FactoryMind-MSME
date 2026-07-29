'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, Loader2, RefreshCw, Cpu, UserCircle, Filter
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';

export default function ReportsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [monthYear, setMonthYear] = useState(todayStr.slice(0, 7));
  const [shiftFilter, setShiftFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet(`/api/machine-production/range?startDate=${fromDate}&endDate=${toDate}${shiftFilter ? `&shift=${shiftFilter}` : ''}`);
      setRecords((res.data ?? []).filter((r: any) => r.partsProduced > 0 || r.defects > 0 || r.energyKwh > 0));
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
    setLoading(false);
  }, [fromDate, toDate, shiftFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const downloadCSV = () => {
    if (records.length === 0) { alert('No records to download.'); return; }
    const headers = ['Date', 'Shift', 'Machine', 'Manager', 'Parts Produced', 'Defects', 'Energy (kWh)', 'Current (Amps)', 'Workers Present', 'Workers Absent'];
    const rows = records.map((r: any) => [r.date, r.shift || 'General', r.machineNumber, r.managerName, r.partsProduced, r.defects, r.energyKwh || 0, r.currentAmps || 0, r.workersPresent || 0, r.workersAbsent || 0]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${fromDate}_to_${toDate}${shiftFilter ? '_' + shiftFilter : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Reports
            </h1>
            <p className="text-muted text-sm">Record Today's Data submission history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchHistory} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={downloadCSV} disabled={records.length === 0} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </div>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted block mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Quick Month</label>
              <input type="month" value={monthYear} onChange={e => {
                setMonthYear(e.target.value);
                const [y, m] = e.target.value.split('-');
                setFromDate(`${y}-${m}-01`);
                const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
                setToDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
              }} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Shift</label>
              <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background">
                <option value="">All Shifts</option>
                <option value="General">General</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Submission History</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>
          ) : records.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-muted">No submissions found for selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Date</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Shift</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Machine</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Manager</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Parts</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Defects</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Energy (kWh)</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Current (Amps)</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Workers Present</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Workers Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any, i: number) => (
                    <tr key={r.id || i} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="py-3 px-3 text-foreground whitespace-nowrap">{r.date}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.shift === 'Morning' ? 'bg-amber-100 text-amber-800' :
                          r.shift === 'Afternoon' ? 'bg-orange-100 text-orange-800' :
                          r.shift === 'Night' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>{r.shift || 'General'}</span>
                      </td>
                      <td className="py-3 px-3"><Cpu className="w-3.5 h-3.5 text-blue-500 inline mr-1" />M{r.machineNumber}</td>
                      <td className="py-3 px-3"><UserCircle className="w-3.5 h-3.5 text-gray-400 inline mr-1" />{r.managerName}</td>
                      <td className="py-3 px-3 text-right">{r.partsProduced}</td>
                      <td className="py-3 px-3 text-right">{r.defects}</td>
                      <td className="py-3 px-3 text-right">{r.energyKwh || 0}</td>
                      <td className="py-3 px-3 text-right">{r.currentAmps || 0}</td>
                      <td className="py-3 px-3 text-right">{r.workersPresent || 0}</td>
                      <td className="py-3 px-3 text-right">{r.workersAbsent || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
