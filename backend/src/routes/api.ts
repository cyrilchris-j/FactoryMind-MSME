import { Router, Response } from 'express'
import { adminDb } from '../lib/firebase-admin'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { chatWithAI, getWeeklySummary, getDailyBriefing } from '../services/ai'
import { z } from 'zod'

const productionSchema = z.object({
  date: z.string(),
  shift: z.string(),
  machineCode: z.string(),
  productName: z.string(),
  targetQuantity: z.number().min(0),
  actualQuantity: z.number().min(0),
  rejectedQuantity: z.number().optional().default(0),
  downtimeMinutes: z.number().optional().default(0),
  notes: z.string().optional()
})

const router = Router()

router.use(requireAuth)

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  const { factoryId, departmentId, role } = req

  try {
    const factoryDoc = await adminDb.collection('factories').doc(factoryId!).get()
    const factory = factoryDoc.exists ? factoryDoc.data() : null

    const machinesSnap = await adminDb.collection('machines')
      .where('factoryId', '==', factoryId).get()
    const machines = machinesSnap.docs.map((d: any) => d.data())
    const totalMachines = machines.length
    const runningMachines = machines.filter(m => m.status === 'RUNNING').length

    const today = new Date().toISOString().split('T')[0]
    let prodQuery: any = adminDb.collection('production')
      .where('factoryId', '==', factoryId)
      .where('date', '==', today)
    if (role === 'MANAGER' && departmentId) {
      prodQuery = prodQuery.where('departmentId', '==', departmentId)
    }
    const prodSnap = await prodQuery.get()
    const todayProd = prodSnap.docs.map((d: any) => d.data())
    const todayProduction = todayProd.reduce((s: number, p: any) => s + (p.actualQuantity || 0), 0)

    const notificationsSnap = await adminDb.collection('notifications')
      .where('factoryId', '==', factoryId)
      .where('isRead', '==', false)
      .get()
    let notifications = notificationsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    notifications = notifications.slice(0, 5)

    const utilization = totalMachines > 0 ? Math.round((runningMachines / totalMachines) * 100) : 0
    const avgHealth = machines.length > 0
      ? Math.round(machines.reduce((s: number, m: any) => s + (m.healthScore || 100), 0) / machines.length)
      : 0

    res.json({
      factory,
      hero: {
        overallEfficiency: utilization,
        machineHealthScore: avgHealth,
        profitToday: 250000,
        energyUsage: 48000,
        productionTarget: { actual: todayProduction, target: 8500 },
        runningMachines,
        totalMachines,
      },
      kpis: [
        { label: "Today's Production", value: todayProduction, unit: 'units', trend: 8.2, trendDirection: 'up', sparkline: [] },
        { label: 'Machine Utilization', value: utilization, unit: '%', trend: 3.1, trendDirection: 'up', sparkline: [] },
        { label: 'Worker Attendance', value: 93, unit: '%', trend: 2, trendDirection: 'up', sparkline: [] },
      ],
      notifications,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

router.get('/factory', async (req: AuthRequest, res: Response) => {
  const doc = await adminDb.collection('factories').doc(req.factoryId!).get()
  res.json(doc.exists ? { id: doc.id, ...doc.data() } : null)
})

router.get('/machines', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query
  let query: any = adminDb.collection('machines')
    .where('factoryId', '==', req.factoryId!)
    .orderBy('machineCode', 'asc')
  if (status) query = query.where('status', '==', status)
  const snap = await query.get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const p = parseInt(page as string)
  const l = parseInt(limit as string)
  res.json({ data: all.slice((p - 1) * l, p * l), total: all.length, page: p, limit: l })
})

router.get('/machines/:id', async (req: AuthRequest, res: Response) => {
  const machineId = req.params.id as string
  const doc = await adminDb.collection('machines').doc(machineId).get()
  if (!doc.exists) { res.status(404).json({ error: 'Machine not found' }); return }
  const maintSnap = await adminDb.collection('maintenance')
    .where('machineId', '==', machineId).get()
  const maintenance = maintSnap.docs.map((d: any) => d.data())
  res.json({ id: doc.id, ...doc.data(), maintenance })
})

router.get('/workers', async (req: AuthRequest, res: Response) => {
  const query: any = adminDb.collection('workers')
    .where('factoryId', '==', req.factoryId!)
  if (req.query.department) query.where('department', '==', req.query.department)
  const snap = await query.get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: all, total: all.length, page: 1, limit: all.length })
})

router.get('/managers', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('users')
    .where('factoryId', '==', req.factoryId!)
    .where('role', '==', 'MANAGER')
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: all })
})

router.get('/production', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query
  let query: any = adminDb.collection('production')
    .where('factoryId', '==', req.factoryId!)
  if (status) query = query.where('status', '==', status)
  if (req.role === 'MANAGER' && req.departmentId) {
    query = query.where('departmentId', '==', req.departmentId)
  }
  const snap = await query.get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const p = parseInt(page as string)
  const l = parseInt(limit as string)
  const total = all.length
  const pending = all.filter((o: any) => o.status === 'pending').length
  const inProgress = all.filter((o: any) => o.status === 'in_progress').length
  const completed = all.filter((o: any) => o.status === 'completed').length
  const delayed = all.filter((o: any) => o.status === 'delayed').length
  res.json({
    data: all.slice((p - 1) * l, p * l),
    total,
    page: p,
    limit: l,
    summary: { pending, inProgress, completed, delayed },
  })
})

router.post('/production/batch', async (req: AuthRequest, res: Response) => {
  const { records } = req.body
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: 'Records array is required' })
    return
  }
  let inserted = 0
  let failed = 0
  for (const r of records) {
    try {
      await adminDb.collection('production').add({
        factoryId: req.factoryId,
        departmentId: req.departmentId || '',
        date: r.date,
        shift: r.shift,
        machineCode: r.machine || r.machineCode,
        productName: r.product || r.productName || r.product_name,
        targetQuantity: Number(r.targetQty || r.targetQuantity || 0),
        actualQuantity: Number(r.actualQty || r.actualQuantity || 0),
        rejectedQuantity: Number(r.rejectedQty || r.rejectedQuantity || 0),
        downtimeMinutes: Number(r.downtime || r.downtimeMinutes || 0),
        notes: r.notes || '',
        status: Number(r.actualQty || r.actualQuantity || 0) >= Number(r.targetQty || r.targetQuantity || 0) ? 'completed' : 'in_progress',
        createdAt: new Date().toISOString(),
      })
      inserted++
    } catch {
      failed++
    }
  }
  res.json({ inserted, failed })
})

router.post('/production', async (req: AuthRequest, res: Response) => {
  const parsed = productionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors })
    return
  }
  const { date, shift, machineCode, productName, targetQuantity, actualQuantity, rejectedQuantity, downtimeMinutes, notes } = parsed.data

  try {
    const docRef = await adminDb.collection('production').add({
      factoryId: req.factoryId,
      departmentId: req.departmentId || '',
      date,
      shift,
      machineCode,
      productName,
      targetQuantity: Number(targetQuantity),
      actualQuantity: Number(actualQuantity),
      rejectedQuantity: Number(rejectedQuantity || 0),
      downtimeMinutes: Number(downtimeMinutes || 0),
      notes: notes || '',
      status: actualQuantity >= targetQuantity ? 'completed' : 'in_progress',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Production record created' })
  } catch (err) {
    console.error('Failed to create production record:', err)
    res.status(500).json({ error: 'Failed to save production record' })
  }
})

router.get('/inventory', async (req: AuthRequest, res: Response) => {
  const { category, lowStock } = req.query
  let query: any = adminDb.collection('inventory')
    .where('factoryId', '==', req.factoryId!)
  if (category) query = query.where('category', '==', category)
  const snap = await query.get()
  let all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  if (lowStock === 'true') all = all.filter((i: any) => i.currentStock <= i.minimumStock)
  const aCount = all.filter((i: any) => i.abcClass === 'A').length
  const bCount = all.filter((i: any) => i.abcClass === 'B').length
  const cCount = all.filter((i: any) => i.abcClass === 'C').length
  res.json({
    data: all,
    total: all.length,
    lowStockCount: all.filter((i: any) => i.currentStock <= i.minimumStock).length,
    abcAnalysis: { A: aCount, B: bCount, C: cCount },
  })
})

router.get('/maintenance', async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query
  let query: any = adminDb.collection('maintenance')
    .where('factoryId', '==', req.factoryId!)
  if (status) query = query.where('status', '==', status)
  const snap = await query.get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime())
  const p = parseInt(page as string)
  const l = parseInt(limit as string)
  res.json({
    data: all.slice((p - 1) * l, p * l),
    total: all.length,
    page: p,
    limit: l,
    upcoming: all.filter((m: any) => m.status === 'scheduled').length,
    avgHealthScore: 78,
  })
})

router.get('/energy', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('energy')
    .where('factoryId', '==', req.factoryId!)
    .get()
  let records = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  records = records.slice(0, 30)
  const latest = records[0] || null
  res.json({
    records,
    latest,
    machineConsumption: [],
    totalCarbonFootprint: records.reduce((s: number, r: any) => s + (r.energyConsumptionKwh || 0) * 0.82, 0),
    suggestions: [
      { action: 'Stagger injection molding schedules', savings: 18000, priority: 'high' },
      { action: 'Install auto-shutdown for idle machines', savings: 12000, priority: 'high' },
    ],
  })
})

router.get('/sales', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query
  const snap = await adminDb.collection('sales')
    .where('factoryId', '==', req.factoryId!)
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  const p = parseInt(page as string)
  const l = parseInt(limit as string)
  const totalRevenue = all.reduce((s: number, o: any) => s + (o.orderValue || 0), 0)
  res.json({
    orders: all.slice((p - 1) * l, p * l),
    customers: [],
    total: all.length,
    summary: {
      totalRevenue,
      totalOrders: all.length,
      avgOrderValue: all.length > 0 ? Math.round(totalRevenue / all.length) : 0,
      topProducts: [],
    },
  })
})

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('notifications')
    .where('factoryId', '==', req.factoryId!)
    .get()
  let list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  list = list.slice(0, 50)
  res.json(list)
})

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  await adminDb.collection('notifications').doc(req.params.id as string).update({ isRead: true })
  res.json({ success: true })
})

router.get('/analytics', async (req: AuthRequest, res: Response) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const factoryId = req.factoryId!

  const prodSnap = await adminDb.collection('production')
    .where('factoryId', '==', factoryId)
    .get()
  const prodByMonth: Record<number, { actual: number; target: number }> = {}
  prodSnap.docs.forEach((d: any) => {
    const data = d.data()
    const month = new Date(data.date).getMonth()
    if (!prodByMonth[month]) prodByMonth[month] = { actual: 0, target: 0 }
    prodByMonth[month].actual += data.actualQuantity || 0
    prodByMonth[month].target += data.targetQuantity || 0
  })
  const productionTrend = months.map((month, i) => ({
    month,
    actual: prodByMonth[i]?.actual || 0,
    target: prodByMonth[i]?.target || 8500,
    forecast: Math.round((prodByMonth[i]?.actual || 0) * 1.1),
  }))

  const salesSnap = await adminDb.collection('sales')
    .where('factoryId', '==', factoryId)
    .get()
  const salesByMonth: Record<number, { revenue: number; cost: number }> = {}
  salesSnap.docs.forEach((d: any) => {
    const data = d.data()
    const month = new Date(data.orderDate).getMonth()
    if (!salesByMonth[month]) salesByMonth[month] = { revenue: 0, cost: 0 }
    salesByMonth[month].revenue += data.orderValue || 0
    salesByMonth[month].cost += (data.orderValue || 0) * 0.7
  })
  const profitTrend = months.map((month, i) => ({
    month,
    revenue: salesByMonth[i]?.revenue || 0,
    profit: (salesByMonth[i]?.revenue || 0) - (salesByMonth[i]?.cost || 0),
    cost: salesByMonth[i]?.cost || 0,
  }))

  const energySnap = await adminDb.collection('energy')
    .where('factoryId', '==', factoryId)
    .get()
  const energyByMonth: Record<number, { consumption: number; cost: number }> = {}
  energySnap.docs.forEach((d: any) => {
    const data = d.data()
    const month = new Date(data.date).getMonth()
    if (!energyByMonth[month]) energyByMonth[month] = { consumption: 0, cost: 0 }
    energyByMonth[month].consumption += data.energyConsumptionKwh || 0
    energyByMonth[month].cost += data.energyCost || 0
  })
  const energyTrend = months.map((month, i) => ({
    month,
    consumption: energyByMonth[i]?.consumption || 0,
    cost: energyByMonth[i]?.cost || 0,
  }))

  const maintSnap = await adminDb.collection('maintenance')
    .where('factoryId', '==', factoryId)
    .get()
  const downtimeByMonth: Record<number, { planned: number; unplanned: number }> = {}
  maintSnap.docs.forEach((d: any) => {
    const data = d.data()
    const month = new Date(data.reportedDate).getMonth()
    if (!downtimeByMonth[month]) downtimeByMonth[month] = { planned: 0, unplanned: 0 }
    if (data.type === 'preventive' || data.status === 'scheduled') {
      downtimeByMonth[month].planned += data.downtimeMinutes || 0
    } else {
      downtimeByMonth[month].unplanned += data.downtimeMinutes || 0
    }
  })
  const downtimeTrend = months.map((month, i) => ({
    month,
    planned: Math.round((downtimeByMonth[i]?.planned || 0) / 60),
    unplanned: Math.round((downtimeByMonth[i]?.unplanned || 0) / 60),
  }))

  const machineSnap = await adminDb.collection('machines')
    .where('factoryId', '==', factoryId)
    .get()
  const machineData = machineSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const machineUtilization = machineData.map((m: any) => ({
    name: m.machineCode || m.machineName || 'Unknown',
    utilization: m.utilization || (m.status === 'RUNNING' ? 85 : 20),
  }))

  const workerSnap = await adminDb.collection('workers')
    .where('factoryId', '==', factoryId)
    .get()
  const workerData = workerSnap.docs.map((d: any) => d.data())
  const workerProductivity = workerData.map((w: any) => ({
    name: w.name || 'Unknown',
    productivity: w.productivity || (w.status === 'present' ? 80 : 0),
  }))

  const invSnap = await adminDb.collection('inventory')
    .where('factoryId', '==', factoryId)
    .get()
  const invData = invSnap.docs.map((d: any) => d.data())
  const invByMonth: Record<number, { rawMaterials: number; finishedGoods: number }> = {}
  invData.forEach((i: any) => {
    const month = new Date(i.lastRestocked || Date.now()).getMonth()
    if (!invByMonth[month]) invByMonth[month] = { rawMaterials: 0, finishedGoods: 0 }
    if (i.category === 'raw_material') {
      invByMonth[month].rawMaterials += i.currentStock || 0
    } else {
      invByMonth[month].finishedGoods += i.currentStock || 0
    }
  })
  const inventoryTrend = months.map((month, i) => ({
    month,
    rawMaterials: invByMonth[i]?.rawMaterials || 0,
    finishedGoods: invByMonth[i]?.finishedGoods || 0,
  }))

  res.json({
    productionTrend,
    profitTrend,
    energyTrend,
    downtimeTrend,
    machineUtilization,
    workerProductivity,
    inventoryTrend,
    paretoData: [],
  })
})

router.get('/roadmap', async (_req: AuthRequest, res: Response) => {
  res.json([
    { id: 'digital-twin', name: 'Digital Twin', description: 'Real-time virtual replica of factory floor', status: 'roadmap', icon: 'Box' },
    { id: 'iot', name: 'IoT Integration', description: 'Connect sensors and smart devices', status: 'roadmap', icon: 'Wifi' },
  ])
})

router.post('/ai/chat', async (req: AuthRequest, res: Response) => {
  const { message, history = [] } = req.body
  if (!message) { res.status(400).json({ error: 'Message required' }); return }
  const result = await chatWithAI(message, history, req.factoryId!)
  res.json(result)
})

router.get('/ai/briefing', async (req: AuthRequest, res: Response) => {
  const briefing = await getDailyBriefing(req.factoryId!)
  res.json(briefing)
})

router.get('/ai/weekly-summary', async (req: AuthRequest, res: Response) => {
  const summary = await getWeeklySummary(req.factoryId!)
  res.json(summary)
})

router.get('/search', async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase()
  if (!q) { res.json([]); return }
  const results: any[] = []

  const machineSnap = await adminDb.collection('machines')
    .where('factoryId', '==', req.factoryId!).get()
  machineSnap.docs.forEach(d => {
    const data = d.data()
    if (data.machineName?.toLowerCase().includes(q) || data.machineCode?.toLowerCase().includes(q)) {
      results.push({ id: d.id, ...data, type: 'machine' })
    }
  })

  const prodSnap = await adminDb.collection('production')
    .where('factoryId', '==', req.factoryId!)
    .orderBy('date', 'desc')
    .limit(50)
    .get()
  prodSnap.docs.forEach(d => {
    const data = d.data()
    if (data.productName?.toLowerCase().includes(q)) {
      results.push({ id: d.id, ...data, type: 'order' })
    }
  })

  res.json(results.slice(0, 10))
})

export default router
