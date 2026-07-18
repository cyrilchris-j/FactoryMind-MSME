import { Router, Request, Response } from 'express';
import {
  factory,
  machines,
  workers,
  productionOrders,
  inventory,
  maintenanceRecords,
  energyRecords,
  salesOrders,
  customers,
  notifications,
  getDashboardKPIs,
  getHeroMetrics,
  getAnalyticsData,
  futureModules,
} from '../data/seed';
import { chatWithAI, getWeeklySummary, getDailyBriefing } from '../services/ai';

const router = Router();

router.get('/dashboard', (_req: Request, res: Response) => {
  res.json({
    factory,
    hero: getHeroMetrics(),
    kpis: getDashboardKPIs(),
    notifications: notifications.filter((n) => !n.read).slice(0, 5),
  });
});

router.get('/factory', (_req: Request, res: Response) => {
  res.json(factory);
});

router.get('/machines', (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  let filtered = [...machines];
  if (status) filtered = filtered.filter((m) => m.status === status);
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  res.json({ data: filtered.slice(start, start + limitNum), total: filtered.length, page: pageNum, limit: limitNum });
});

router.get('/machines/:id', (req: Request, res: Response) => {
  const machine = machines.find((m) => m.id === req.params.id);
  if (!machine) { res.status(404).json({ error: 'Machine not found' }); return; }
  const maintenance = maintenanceRecords.filter((m) => m.machineId === machine.id);
  res.json({ ...machine, maintenance });
});

router.get('/workers', (req: Request, res: Response) => {
  const { department, page = '1', limit = '20' } = req.query;
  let filtered = [...workers];
  if (department) filtered = filtered.filter((w) => w.department === department);
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  res.json({ data: filtered.slice(start, start + limitNum), total: filtered.length, page: pageNum, limit: limitNum });
});

router.get('/production', (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  let filtered = [...productionOrders];
  if (status) filtered = filtered.filter((o) => o.status === status);
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  res.json({
    data: filtered.slice(start, start + limitNum),
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
    summary: {
      pending: productionOrders.filter((o) => o.status === 'pending').length,
      inProgress: productionOrders.filter((o) => o.status === 'in_progress').length,
      completed: productionOrders.filter((o) => o.status === 'completed').length,
      delayed: productionOrders.filter((o) => o.status === 'delayed').length,
    },
  });
});

router.get('/inventory', (req: Request, res: Response) => {
  const { category, lowStock } = req.query;
  let filtered = [...inventory];
  if (category) filtered = filtered.filter((i) => i.category === category);
  if (lowStock === 'true') filtered = filtered.filter((i) => i.quantity <= i.reorderLevel);
  res.json({
    data: filtered,
    total: filtered.length,
    lowStockCount: inventory.filter((i) => i.quantity <= i.reorderLevel).length,
    abcAnalysis: {
      A: inventory.filter((i) => i.abcClass === 'A').length,
      B: inventory.filter((i) => i.abcClass === 'B').length,
      C: inventory.filter((i) => i.abcClass === 'C').length,
    },
  });
});

router.get('/maintenance', (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  let filtered = [...maintenanceRecords];
  if (status) filtered = filtered.filter((m) => m.status === status);
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  res.json({
    data: filtered.slice(start, start + limitNum),
    total: filtered.length,
    upcoming: maintenanceRecords.filter((m) => m.status === 'scheduled').length,
    avgHealthScore: Math.round(machines.reduce((s, m) => s + m.healthScore, 0) / machines.length),
  });
});

router.get('/energy', (_req: Request, res: Response) => {
  const latest = energyRecords[energyRecords.length - 1];
  res.json({
    records: energyRecords,
    latest,
    machineConsumption: machines.slice(0, 15).map((m) => ({
      machineId: m.id,
      name: m.name,
      consumption: m.energyConsumption,
    })),
    totalCarbonFootprint: energyRecords.reduce((s, e) => s + e.carbonFootprint, 0),
    suggestions: [
      { action: 'Stagger injection molding schedules', savings: 18000, priority: 'high' },
      { action: 'Install auto-shutdown for idle machines', savings: 12000, priority: 'high' },
      { action: 'Shift production to off-peak hours', savings: 8000, priority: 'medium' },
      { action: 'Upgrade to LED lighting in Bay C', savings: 5000, priority: 'low' },
    ],
  });
});

router.get('/sales', (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const start = (pageNum - 1) * limitNum;
  const totalRevenue = salesOrders.reduce((s, o) => s + o.totalAmount, 0);
  res.json({
    orders: salesOrders.slice(start, start + limitNum),
    customers,
    total: salesOrders.length,
    summary: {
      totalRevenue,
      totalOrders: salesOrders.length,
      avgOrderValue: Math.round(totalRevenue / salesOrders.length),
      topProducts: [...new Set(salesOrders.map((o) => o.product))].slice(0, 5),
    },
  });
});

router.get('/notifications', (_req: Request, res: Response) => {
  res.json(notifications);
});

router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json(notif || { error: 'Not found' });
});

router.get('/analytics', (_req: Request, res: Response) => {
  res.json(getAnalyticsData());
});

router.get('/roadmap', (_req: Request, res: Response) => {
  res.json(futureModules);
});

router.post('/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;
  if (!message) { res.status(400).json({ error: 'Message required' }); return; }
  const result = await chatWithAI(message, history);
  res.json(result);
});

router.get('/ai/briefing', (_req: Request, res: Response) => {
  res.json(getDailyBriefing());
});

router.get('/ai/weekly-summary', (_req: Request, res: Response) => {
  res.json(getWeeklySummary());
});

router.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase();
  if (!q) { res.json([]); return; }
  const results = [
    ...machines.filter((m) => m.name.toLowerCase().includes(q)).map((m) => ({ ...m, type: 'machine' })),
    ...workers.filter((w) => w.name.toLowerCase().includes(q)).map((w) => ({ ...w, type: 'worker' })),
    ...productionOrders.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.product.toLowerCase().includes(q)).slice(0, 5).map((o) => ({ ...o, type: 'order' })),
    ...inventory.filter((i) => i.name.toLowerCase().includes(q)).map((i) => ({ ...i, type: 'inventory' })),
    ...customers.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({ ...c, type: 'customer' })),
  ].slice(0, 10);
  res.json(results);
});

export default router;
