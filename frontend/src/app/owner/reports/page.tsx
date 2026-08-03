'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Download, Loader2, RefreshCw, Cpu, Filter,
  Calendar, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Clock, Check
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to get formatted dates in local time
const getLocalDateString = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const getNDaysAgoStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getLocalDateString(d);
};

export default function ReportsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = getLocalDateString(new Date());
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  
  // Filter panel states
  const [filterMode, setFilterMode] = useState<'date' | 'month' | 'year'>('date');
  const [activePreset, setActivePreset] = useState<string | null>('today');
  const [monthPickerYear, setMonthPickerYear] = useState<number>(new Date().getFullYear());

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet(`/api/machine-production/range?startDate=${fromDate}&endDate=${toDate}`);
      setRecords((res.data ?? []).filter((r: any) => r.partsProduced > 0 || r.defects > 0 || r.energyKwh > 0));
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const downloadCSV = () => {
    if (records.length === 0) { alert('No records to download.'); return; }
    const headers = ['Date', 'Machine', 'Parts Produced', 'Defects', 'Energy (kWh)', 'Current (Amps)', 'Workers Present', 'Workers Absent'];
    const rows = records.map((r: any) => [r.date, `Machine ${r.machineNumber}`, r.partsProduced, r.defects, r.energyKwh || 0, r.currentAmps || 0, r.workersPresent || 0, r.workersAbsent || 0]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper date calculations
  const applyPreset = (preset: string) => {
    const today = new Date();
    let start = '';
    let end = getLocalDateString(today);

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'yesterday': {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yest = getLocalDateString(d);
        start = yest;
        end = yest;
        break;
      }
      case '7days':
        start = getNDaysAgoStr(6);
        break;
      case '30days':
        start = getNDaysAgoStr(29);
        break;
      case 'thisMonth': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        start = getLocalDateString(first);
        break;
      }
      case 'lastMonth': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        start = getLocalDateString(first);
        end = getLocalDateString(last);
        break;
      }
      default:
        return;
    }
    setFromDate(start);
    setToDate(end);
    setActivePreset(preset);
  };

  const selectMonth = (monthIndex: number) => {
    const firstDay = new Date(monthPickerYear, monthIndex, 1);
    const lastDay = new Date(monthPickerYear, monthIndex + 1, 0);
    setFromDate(getLocalDateString(firstDay));
    setToDate(getLocalDateString(lastDay));
    setActivePreset(null);
  };

  const selectYear = (year: number) => {
    setFromDate(`${year}-01-01`);
    setToDate(`${year}-12-31`);
    setActivePreset(null);
  };

  // Detect which month is active to highlight in Month Picker
  const getActiveMonth = () => {
    const [fY, fM, fD] = fromDate.split('-').map(Number);
    const [tY, tM, tD] = toDate.split('-').map(Number);
    if (fY === tY && fM === tM && fD === 1) {
      const lastDay = new Date(fY, fM, 0).getDate();
      if (tD === lastDay) {
        return { year: fY, monthIndex: fM - 1 };
      }
    }
    return null;
  };

  // Detect which year is active to highlight in Year Picker
  const getActiveYear = () => {
    const [fY, fM, fD] = fromDate.split('-').map(Number);
    const [tY, tM, tD] = toDate.split('-').map(Number);
    if (fY === tY && fM === 1 && fD === 1 && tM === 12 && tD === 31) {
      return fY;
    }
    return null;
  };

  const activeMonth = getActiveMonth();
  const activeYear = getActiveYear();

  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i); // 2023 - 2027

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
            <Button variant="outline" onClick={fetchHistory} disabled={loading} className="border-border hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={downloadCSV} disabled={records.length === 0} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </div>
        </div>

        <Card className="p-6 border border-border shadow-sm bg-card rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Advanced Filters</h2>
                <p className="text-xs text-muted">Select custom date range, specific month, or full year</p>
              </div>
            </div>

            {/* Premium Sliding Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto border border-slate-200/50">
              <button
                onClick={() => setFilterMode('date')}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterMode === 'date' ? 'text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                {filterMode === 'date' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-primary rounded-md z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="flex items-center gap-1.5 relative z-10">
                  <CalendarRange className="w-3.5 h-3.5" />
                  Date / Range
                </span>
              </button>

              <button
                onClick={() => setFilterMode('month')}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterMode === 'month' ? 'text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                {filterMode === 'month' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-primary rounded-md z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="flex items-center gap-1.5 relative z-10">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Month Grid
                </span>
              </button>

              <button
                onClick={() => setFilterMode('year')}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filterMode === 'year' ? 'text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                {filterMode === 'year' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-primary rounded-md z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="flex items-center gap-1.5 relative z-10">
                  <Calendar className="w-3.5 h-3.5" />
                  Year Picker
                </span>
              </button>
            </div>
          </div>

          {/* Animated Tab Content Panes */}
          <div className="min-h-27.5">
            <AnimatePresence mode="wait">
              {filterMode === 'date' && (
                <motion.div
                  key="date-pane"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-muted mr-1">Presets:</span>
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: '7days', label: 'Last 7 Days' },
                      { id: '30days', label: 'Last 30 Days' },
                      { id: 'thisMonth', label: 'This Month' },
                      { id: 'lastMonth', label: 'Last Month' }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                          activePreset === preset.id
                            ? 'bg-primary/10 text-primary border-primary/30 font-semibold shadow-sm'
                            : 'bg-background hover:bg-slate-50 text-foreground border-border'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Input Custom Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl pt-2">
                    <div className="relative w-full">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted absolute top-1.5 left-3 z-10">Start Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full pl-3 pr-8 pt-5 pb-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-numbers text-foreground"
                      />
                      <Calendar className="w-4 h-4 text-muted absolute right-3 bottom-2.5 pointer-events-none" />
                    </div>
                    <div className="text-muted font-medium text-xs select-none hidden sm:block px-1">to</div>
                    <div className="relative w-full">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-muted absolute top-1.5 left-3 z-10">End Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          setActivePreset(null);
                        }}
                        className="w-full pl-3 pr-8 pt-5 pb-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-numbers text-foreground"
                      />
                      <Calendar className="w-4 h-4 text-muted absolute right-3 bottom-2.5 pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {filterMode === 'month' && (
                <motion.div
                  key="month-pane"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Year selector header */}
                  <div className="flex items-center justify-between max-w-50 mx-auto bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                    <button
                      onClick={() => setMonthPickerYear(prev => prev - 1)}
                      className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-muted hover:text-foreground cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-foreground font-numbers px-2">{monthPickerYear}</span>
                    <button
                      onClick={() => setMonthPickerYear(prev => prev + 1)}
                      className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-muted hover:text-foreground cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Months 3x4 Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 max-w-5xl mx-auto pt-2">
                    {months.map((m, idx) => {
                      const isSelected = activeMonth && activeMonth.year === monthPickerYear && activeMonth.monthIndex === idx;
                      return (
                        <button
                          key={m}
                          onClick={() => selectMonth(idx)}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-md font-bold'
                              : 'bg-background hover:bg-slate-50 text-foreground border-border hover:border-slate-300'
                          }`}
                        >
                          <span>{m}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {filterMode === 'year' && (
                <motion.div
                  key="year-pane"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Years select chips */}
                  <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto pt-2">
                    <span className="text-xs text-muted mr-1">Select Year:</span>
                    {years.map(yr => {
                      const isSelected = activeYear === yr;
                      return (
                        <button
                          key={yr}
                          onClick={() => selectYear(yr)}
                          className={`py-2 px-5 text-sm font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-md font-bold'
                              : 'bg-background hover:bg-slate-50 text-foreground border-border hover:border-slate-300'
                          }`}
                        >
                          <span className="font-numbers">{yr}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filter Description Status Bar */}
          <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary/70" />
              <span>Active Filter: <strong>{formatDateFriendly(fromDate)}</strong> to <strong>{formatDateFriendly(toDate)}</strong></span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = getLocalDateString(new Date());
                  setFromDate(today);
                  setToDate(today);
                  setActivePreset('today');
                }}
                className="text-primary hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                Reset to Today
              </button>
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
                    <th className="text-left py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Machine</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-muted whitespace-nowrap">Parts Produced</th>
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
                      <td className="py-3 px-3 text-foreground whitespace-nowrap font-numbers">{r.date}</td>
                      <td className="py-3 px-3"><Cpu className="w-3.5 h-3.5 text-blue-500 inline mr-1" />Machine {r.machineNumber}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.partsProduced}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.defects}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.energyKwh || 0}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.currentAmps || 0}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.workersPresent || 0}</td>
                      <td className="py-3 px-3 text-right font-numbers">{r.workersAbsent || 0}</td>
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
