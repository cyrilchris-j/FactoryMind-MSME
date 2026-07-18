"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_1 = require("../data/seed");
const ai_1 = require("../services/ai");
const router = (0, express_1.Router)();
router.get('/dashboard', (_req, res) => {
    res.json({
        factory: seed_1.factory,
        hero: (0, seed_1.getHeroMetrics)(),
        kpis: (0, seed_1.getDashboardKPIs)(),
        notifications: seed_1.notifications.filter((n) => !n.read).slice(0, 5),
    });
});
router.get('/factory', (_req, res) => {
    res.json(seed_1.factory);
});
router.get('/machines', (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;
    let filtered = [...seed_1.machines];
    if (status)
        filtered = filtered.filter((m) => m.status === status);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    res.json({ data: filtered.slice(start, start + limitNum), total: filtered.length, page: pageNum, limit: limitNum });
});
router.get('/machines/:id', (req, res) => {
    const machine = seed_1.machines.find((m) => m.id === req.params.id);
    if (!machine) {
        res.status(404).json({ error: 'Machine not found' });
        return;
    }
    const maintenance = seed_1.maintenanceRecords.filter((m) => m.machineId === machine.id);
    res.json({ ...machine, maintenance });
});
router.get('/workers', (req, res) => {
    const { department, page = '1', limit = '20' } = req.query;
    let filtered = [...seed_1.workers];
    if (department)
        filtered = filtered.filter((w) => w.department === department);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    res.json({ data: filtered.slice(start, start + limitNum), total: filtered.length, page: pageNum, limit: limitNum });
});
router.get('/production', (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;
    let filtered = [...seed_1.productionOrders];
    if (status)
        filtered = filtered.filter((o) => o.status === status);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    res.json({
        data: filtered.slice(start, start + limitNum),
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        summary: {
            pending: seed_1.productionOrders.filter((o) => o.status === 'pending').length,
            inProgress: seed_1.productionOrders.filter((o) => o.status === 'in_progress').length,
            completed: seed_1.productionOrders.filter((o) => o.status === 'completed').length,
            delayed: seed_1.productionOrders.filter((o) => o.status === 'delayed').length,
        },
    });
});
router.get('/inventory', (req, res) => {
    const { category, lowStock } = req.query;
    let filtered = [...seed_1.inventory];
    if (category)
        filtered = filtered.filter((i) => i.category === category);
    if (lowStock === 'true')
        filtered = filtered.filter((i) => i.quantity <= i.reorderLevel);
    res.json({
        data: filtered,
        total: filtered.length,
        lowStockCount: seed_1.inventory.filter((i) => i.quantity <= i.reorderLevel).length,
        abcAnalysis: {
            A: seed_1.inventory.filter((i) => i.abcClass === 'A').length,
            B: seed_1.inventory.filter((i) => i.abcClass === 'B').length,
            C: seed_1.inventory.filter((i) => i.abcClass === 'C').length,
        },
    });
});
router.get('/maintenance', (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;
    let filtered = [...seed_1.maintenanceRecords];
    if (status)
        filtered = filtered.filter((m) => m.status === status);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    res.json({
        data: filtered.slice(start, start + limitNum),
        total: filtered.length,
        upcoming: seed_1.maintenanceRecords.filter((m) => m.status === 'scheduled').length,
        avgHealthScore: Math.round(seed_1.machines.reduce((s, m) => s + m.healthScore, 0) / seed_1.machines.length),
    });
});
router.get('/energy', (_req, res) => {
    const latest = seed_1.energyRecords[seed_1.energyRecords.length - 1];
    res.json({
        records: seed_1.energyRecords,
        latest,
        machineConsumption: seed_1.machines.slice(0, 15).map((m) => ({
            machineId: m.id,
            name: m.name,
            consumption: m.energyConsumption,
        })),
        totalCarbonFootprint: seed_1.energyRecords.reduce((s, e) => s + e.carbonFootprint, 0),
        suggestions: [
            { action: 'Stagger injection molding schedules', savings: 18000, priority: 'high' },
            { action: 'Install auto-shutdown for idle machines', savings: 12000, priority: 'high' },
            { action: 'Shift production to off-peak hours', savings: 8000, priority: 'medium' },
            { action: 'Upgrade to LED lighting in Bay C', savings: 5000, priority: 'low' },
        ],
    });
});
router.get('/sales', (req, res) => {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    const totalRevenue = seed_1.salesOrders.reduce((s, o) => s + o.totalAmount, 0);
    res.json({
        orders: seed_1.salesOrders.slice(start, start + limitNum),
        customers: seed_1.customers,
        total: seed_1.salesOrders.length,
        summary: {
            totalRevenue,
            totalOrders: seed_1.salesOrders.length,
            avgOrderValue: Math.round(totalRevenue / seed_1.salesOrders.length),
            topProducts: [...new Set(seed_1.salesOrders.map((o) => o.product))].slice(0, 5),
        },
    });
});
router.get('/notifications', (_req, res) => {
    res.json(seed_1.notifications);
});
router.patch('/notifications/:id/read', (req, res) => {
    const notif = seed_1.notifications.find((n) => n.id === req.params.id);
    if (notif)
        notif.read = true;
    res.json(notif || { error: 'Not found' });
});
router.get('/analytics', (_req, res) => {
    res.json((0, seed_1.getAnalyticsData)());
});
router.get('/roadmap', (_req, res) => {
    res.json(seed_1.futureModules);
});
router.post('/ai/chat', async (req, res) => {
    const { message, history = [] } = req.body;
    if (!message) {
        res.status(400).json({ error: 'Message required' });
        return;
    }
    const result = await (0, ai_1.chatWithAI)(message, history);
    res.json(result);
});
router.get('/ai/briefing', (_req, res) => {
    res.json((0, ai_1.getDailyBriefing)());
});
router.get('/ai/weekly-summary', (_req, res) => {
    res.json((0, ai_1.getWeeklySummary)());
});
router.get('/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    if (!q) {
        res.json([]);
        return;
    }
    const results = [
        ...seed_1.machines.filter((m) => m.name.toLowerCase().includes(q)).map((m) => ({ ...m, type: 'machine' })),
        ...seed_1.workers.filter((w) => w.name.toLowerCase().includes(q)).map((w) => ({ ...w, type: 'worker' })),
        ...seed_1.productionOrders.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.product.toLowerCase().includes(q)).slice(0, 5).map((o) => ({ ...o, type: 'order' })),
        ...seed_1.inventory.filter((i) => i.name.toLowerCase().includes(q)).map((i) => ({ ...i, type: 'inventory' })),
        ...seed_1.customers.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({ ...c, type: 'customer' })),
    ].slice(0, 10);
    res.json(results);
});
exports.default = router;
