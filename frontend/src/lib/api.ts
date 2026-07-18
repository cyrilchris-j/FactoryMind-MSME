const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }
}

export const api = new ApiClient(API_URL);

export const endpoints = {
  login: (email: string, password: string) => api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
  dashboard: () => api.get<DashboardData>('/api/dashboard'),
  machines: (params?: Record<string, string>) => api.get<PaginatedResponse<Machine>>(`/api/machines?${new URLSearchParams(params)}`),
  workers: (params?: Record<string, string>) => api.get<PaginatedResponse<Worker>>(`/api/workers?${new URLSearchParams(params)}`),
  production: (params?: Record<string, string>) => api.get<ProductionResponse>(`/api/production?${new URLSearchParams(params)}`),
  inventory: (params?: Record<string, string>) => api.get<InventoryResponse>(`/api/inventory?${new URLSearchParams(params)}`),
  maintenance: (params?: Record<string, string>) => api.get<MaintenanceResponse>(`/api/maintenance?${new URLSearchParams(params)}`),
  energy: () => api.get<EnergyData>('/api/energy'),
  sales: (params?: Record<string, string>) => api.get<SalesData>(`/api/sales?${new URLSearchParams(params)}`),
  notifications: () => api.get<Notification[]>('/api/notifications'),
  analytics: () => api.get<AnalyticsData>('/api/analytics'),
  roadmap: () => api.get<RoadmapModule[]>('/api/roadmap'),
  aiChat: (message: string, history?: { role: string; content: string }[]) =>
    api.post<AIResponse>('/api/ai/chat', { message, history }),
  aiBriefing: () => api.get<DailyBriefing>('/api/ai/briefing'),
  aiWeeklySummary: () => api.get<WeeklySummary>('/api/ai/weekly-summary'),
  search: (q: string) => api.get<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardData {
  factory: Factory;
  hero: HeroMetrics;
  kpis: KPI[];
  notifications: Notification[];
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  industry: string;
}

export interface HeroMetrics {
  overallEfficiency: number;
  machineHealthScore: number;
  profitToday: number;
  energyUsage: number;
  productionTarget: { actual: number; target: number };
  runningMachines: number;
  totalMachines: number;
}

export interface KPI {
  label: string;
  value: number | string;
  unit?: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: string;
  healthScore: number;
  utilization: number;
  location: string;
  energyConsumption: number;
  productionRate: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  attendance: string;
  performance: number;
  productivity: number;
  overtime: number;
  skills: string[];
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  completed: number;
  status: string;
  priority: string;
  machineId: string;
  startDate: string;
  dueDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  unitCost: number;
  abcClass: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductionResponse extends PaginatedResponse<ProductionOrder> {
  summary: { pending: number; inProgress: number; completed: number; delayed: number };
}

export interface InventoryResponse {
  data: InventoryItem[];
  total: number;
  lowStockCount: number;
  abcAnalysis: { A: number; B: number; C: number };
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  type: string;
  status: string;
  description: string;
  scheduledDate: string;
  cost: number;
  technician: string;
  downtime: number;
}

export interface MaintenanceResponse extends PaginatedResponse<MaintenanceRecord> {
  upcoming: number;
  avgHealthScore: number;
}

export interface EnergyData {
  records: { date: string; totalConsumption: number; cost: number; carbonFootprint: number }[];
  latest: { totalConsumption: number; cost: number; carbonFootprint: number };
  machineConsumption: { machineId: string; name: string; consumption: number }[];
  suggestions: { action: string; savings: number; priority: string }[];
}

export interface SalesData {
  orders: { id: string; orderNumber: string; product: string; quantity: number; totalAmount: number; status: string }[];
  customers: { id: string; name: string; revenue: number; profit: number; totalOrders: number }[];
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number };
}

export interface AnalyticsData {
  productionTrend: { month: string; actual: number; target: number; forecast: number }[];
  profitTrend: { month: string; revenue: number; profit: number; cost: number }[];
  energyTrend: { month: string; consumption: number; cost: number }[];
  downtimeTrend: { month: string; planned: number; unplanned: number }[];
  machineUtilization: { name: string; utilization: number; health: number }[];
  workerProductivity: { department: string; productivity: number; attendance: number }[];
  inventoryTrend: { month: string; rawMaterials: number; finishedGoods: number }[];
  paretoData: { product: string; revenue: number; cumulative: number }[];
}

export interface RoadmapModule {
  id: string;
  name: string;
  description: string;
  status: string;
}

export interface AIResponse {
  response: string;
  metadata: { source: string; contextUsed: boolean; recommendations: boolean };
}

export interface DailyBriefing {
  title: string;
  date: string;
  greeting: string;
  factoryHealth: string;
  metrics: HeroMetrics;
  topPriorities: { task: string; priority: string }[];
  aiInsight: string;
}

export interface WeeklySummary {
  title: string;
  period: string;
  highlights: string[];
  concerns: string[];
  aiRecommendations: { priority: string; action: string; impact: string }[];
}

export interface SearchResult {
  type: string;
  id: string;
  name?: string;
  orderNumber?: string;
}
