'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Factory, Target, CheckCircle2, Sparkles, Send,
  TrendingUp, ArrowRight,
  Cpu, MessageSquare, Lightbulb, UserCircle,
  UserPlus, Loader2, RefreshCw, AlertCircle, Activity
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Manager form
  const [showAddManager, setShowAddManager] = useState(false);
  const [newManager, setNewManager] = useState({ email: '', password: '', name: '', machineNumber: '' });
  const [creatingManager, setCreatingManager] = useState(false);

  const fetchKpis = useCallback(async () => {
    try {
      const data: any = await apiGet('/api/manufacturing-kpis');
      setKpi(data);
    } catch (err) {
      console.error('Failed to fetch KPIs', err);
    }
    setLoading(false);
  }, []);

  const fetchMachinesData = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/managers-with-machines');
      setMachinesData(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch machines data', err);
    }
    setMachinesLoading(false);
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/machine-suggestions');
      setSuggestions(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    }
    setSuggestionsLoading(false);
  }, []);

  const fetchTrendsData = useCallback(async () => {
    try {
      const res: any = await apiGet('/api/dashboard-trends');
      setTrendsData(res.trends ?? []);
    } catch (err) {
      console.error('Failed to fetch trends data', err);
    }
    setTrendsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetchKpis();
    fetchMachinesData();
    fetchSuggestions();
    fetchTrendsData();
    const interval = setInterval(() => {
      fetchKpis();
      fetchMachinesData();
      fetchTrendsData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchKpis, fetchMachinesData, fetchSuggestions, fetchTrendsData, user]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

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

  const handleCreateManager = async () => {
    if (!newManager.email || !newManager.password || !newManager.name || !newManager.machineNumber) {
      setToast({ type: 'error', message: 'All fields are required' });
      return;
    }
    setCreatingManager(true);
    try {
      const res: any = await apiPost('/api/managers', {
        email: newManager.email,
        password: newManager.password,
        name: newManager.name,
        machineNumber: parseInt(newManager.machineNumber),
      });
      setToast({ type: 'success', message: res.message || 'Manager created!' });
      setNewManager({ email: '', password: '', name: '', machineNumber: '' });
      setShowAddManager(false);
      fetchMachinesData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to create manager' });
    }
    setCreatingManager(false);
  };

  const suggestedPrompts = [
    'Why is production low today?',
    'Can we complete today\'s order?',
    'Which machine requires attention?',
    'What should I prioritize today?',
    'How is energy usage today?',
  ];

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

  return (
    <OwnerLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-350 mx-auto">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{kpi?.factoryName || 'Factory Dashboard'}</h1>
            </div>
            <p className="text-sm text-muted mt-1">
              {kpi?.productName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Production Output */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">7-Day Production Output</h2>
            </div>
            {trendsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="partsProduced" 
                      name="Parts Produced"
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* 7-Day Defect Rates */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-foreground">7-Day Defect Tracking</h2>
            </div>
            {trendsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                    />
                    <Bar 
                      dataKey="defects" 
                      name="Defects"
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suggestions */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">Suggestions from Managers</h2>
            </div>
            {suggestionsLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-border">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-muted">No suggestions yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {suggestions.map((s: any) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{s.managerName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Machine {s.machineNumber}</span>
                        <span className="text-[10px] text-muted ml-auto">
                          {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{s.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Factory Copilot */}
          <Card className="p-5 bg-linear-to-r from-slate-50 to-purple-50/30 border-purple-100/50">
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
                placeholder="Ask FactoryMind about factory operations..."
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
      </div>
    </OwnerLayout>
  );
}
