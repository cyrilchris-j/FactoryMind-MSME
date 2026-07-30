import { Router, Response } from 'express'
import { adminDb, adminAuth } from '../lib/firebase-admin'
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
  if (status) query = query.where('status', '==', status)
  const snap = await query.get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => (a.machineCode || '').localeCompare(b.machineCode || ''))
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

router.post('/managers', async (req: AuthRequest, res: Response) => {
  if (req.role !== 'OWNER') {
    res.status(403).json({ error: 'Only owners can add managers' })
    return
  }

  const { email, password, name, department, machineNumber } = req.body
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    if (machineNumber) {
      const num = Number(machineNumber);
      const existingMachine = await adminDb.collection('users')
        .where('factoryId', '==', req.factoryId)
        .where('role', '==', 'MANAGER')
        .where('machineNumber', '==', num)
        .get();

      if (!existingMachine.empty) {
        res.status(400).json({ error: 'Manager for this machine already exists' });
        return;
      }
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: 'MANAGER',
      department: department || 'Unassigned',
      machineNumber: machineNumber ? Number(machineNumber) : null,
      factoryId: req.factoryId,
      createdAt: new Date().toISOString()
    })

    res.status(201).json({ id: userRecord.uid, message: 'Manager created successfully' })
  } catch (err: any) {
    console.error('Add manager error:', err)
    if (err.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create manager' })
    }
  }
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

router.post('/maintenance', async (req: AuthRequest, res: Response) => {
  const { machineCode, machineName, issueType, description, priority, status, downtimeMinutes, reportedDate, expectedResolution, notes } = req.body
  try {
    const docRef = await adminDb.collection('maintenance').add({
      factoryId: req.factoryId,
      machineCode: machineCode || '',
      machineName: machineName || '',
      issueType: issueType || '',
      description: description || '',
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      downtimeMinutes: Number(downtimeMinutes || 0),
      reportedDate: reportedDate || new Date().toISOString().split('T')[0],
      expectedResolution: expectedResolution || '',
      maintenanceCost: 0,
      nextMaintenance: '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Maintenance record created' })
  } catch (err) {
    console.error('Failed to create maintenance record:', err)
    res.status(500).json({ error: 'Failed to create maintenance record' })
  }
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

router.post('/energy', async (req: AuthRequest, res: Response) => {
  const { recordDate, machineCode, machineName, shift, modelOrPart, hoursRun, totalKwh, totalOutput, peakDemandKw, powerFactor, remarks } = req.body
  try {
    const docRef = await adminDb.collection('energy').add({
      factoryId: req.factoryId,
      recordDate: recordDate || new Date().toISOString().split('T')[0],
      machineCode: machineCode || '',
      machineName: machineName || '',
      shift: shift || '',
      modelOrPart: modelOrPart || '',
      hoursRun: Number(hoursRun || 0),
      totalKwh: Number(totalKwh || 0),
      totalOutput: Number(totalOutput || 0),
      peakDemandKw: Number(peakDemandKw || 0),
      powerFactor: Number(powerFactor || 1),
      remarks: remarks || '',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Energy record created' })
  } catch (err) {
    console.error('Failed to create energy record:', err)
    res.status(500).json({ error: 'Failed to create energy record' })
  }
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
    .get()
  prodSnap.docs.forEach(d => {
    const data = d.data()
    if (data.productName?.toLowerCase().includes(q)) {
      results.push({ id: d.id, ...data, type: 'order' })
    }
  })

  res.json(results.slice(0, 10))
})

// ── PRODUCTS ──────────────────────────────────────────────────────────────
router.get('/products', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('products')
    .where('factoryId', '==', req.factoryId!)
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: all, total: all.length })
})

router.get('/products/:id', async (req: AuthRequest, res: Response) => {
  const doc = await adminDb.collection('products').doc(req.params.id as string).get()
  if (!doc.exists) { res.status(404).json({ error: 'Product not found' }); return }

  const product = { id: doc.id, ...doc.data() }

  const bomSnap = await adminDb.collection('bill_of_materials')
    .where('productId', '==', doc.id)
    .get()
  const bomItems = bomSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  const componentIds = [...new Set(bomItems.map((b: any) => b.componentId))]
  const compSnap = componentIds.length > 0
    ? await adminDb.collection('components')
        .where('factoryId', '==', req.factoryId!)
        .get()
    : { docs: [] }
  const components: any = {}
  compSnap.docs.forEach((d: any) => { components[d.id] = { id: d.id, ...d.data() } })

  const customerSnap = await adminDb.collection('customer_orders')
    .where('productId', '==', doc.id)
    .get()
  const orders = customerSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  res.json({ product, bom: bomItems, components, orders })
})

// ── COMPONENTS ─────────────────────────────────────────────────────────────
router.get('/components', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('components')
    .where('factoryId', '==', req.factoryId!)
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: all, total: all.length })
})

// ── BILL OF MATERIALS ───────────────────────────────────────────────────────
router.get('/bom', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('bill_of_materials')
    .where('factoryId', '==', req.factoryId!)
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: all, total: all.length })
})

// ── CUSTOMER ORDERS ─────────────────────────────────────────────────────────
router.get('/customer-orders', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('customer_orders')
    .where('factoryId', '==', req.factoryId!)
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  res.json({ data: all, total: all.length })
})

// ── BOM INTELLIGENCE ────────────────────────────────────────────────────────
router.get('/bom-intelligence/:productId', async (req: AuthRequest, res: Response) => {
  const productId = req.params.productId as string
  const orderQty = parseInt(req.query.orderQty as string) || 0

  const bomSnap = await adminDb.collection('bill_of_materials')
    .where('productId', '==', productId)
    .get()
  if (bomSnap.empty) { res.json({ error: 'No BOM found for product' }); return }

  const bomItems = bomSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const componentIds = [...new Set(bomItems.map((b: any) => b.componentId))]

  const compSnap = componentIds.length > 0
    ? await adminDb.collection('components')
        .where('factoryId', '==', req.factoryId!)
        .get()
    : { docs: [] }
  const componentMap: any = {}
  compSnap.docs.forEach((d: any) => { componentMap[d.id] = { id: d.id, ...d.data() } })

  const calculations = bomItems.map((bom: any) => {
    const comp = componentMap[bom.componentId]
    const currentStock = comp?.currentStock || 0
    const requiredPerProduct = bom.quantityRequired || 0
    const totalRequired = orderQty * requiredPerProduct
    const availableForProduction = Math.max(0, currentStock - (comp?.reservedStock || 0))
    const shortage = Math.max(0, totalRequired - availableForProduction)
    const possibleWithCurrent = requiredPerProduct > 0 ? Math.floor(availableForProduction / requiredPerProduct) : 0

    let status: string
    if (shortage === 0 && currentStock >= totalRequired) status = 'READY'
    else if (shortage > 0 && availableForProduction > 0) status = 'LOW'
    else if (availableForProduction <= 0 && totalRequired > 0) status = 'OUT OF STOCK'
    else status = 'CRITICAL'

    return {
      componentId: bom.componentId,
      componentName: comp?.componentName || 'Unknown',
      componentCode: comp?.componentCode || '',
      requiredPerProduct,
      totalRequired,
      currentStock,
      reservedStock: comp?.reservedStock || 0,
      availableForProduction,
      shortage,
      possibleWithCurrent,
      status,
      unit: comp?.unit || 'pcs',
      supplier: comp?.supplier || '-',
      leadTimeDays: comp?.leadTimeDays || 0,
      unitCost: comp?.unitCost || 0,
    }
  })

  const maxBuildable = calculations.length > 0
    ? Math.min(...calculations.map((c: any) => c.possibleWithCurrent))
    : 0
  const constraints = calculations.filter((c: any) => c.possibleWithCurrent === maxBuildable)
  const primaryConstraint = constraints[0]?.componentName || 'None'
  const shortfall = Math.max(0, orderQty - maxBuildable)

  const overallStatus = maxBuildable >= orderQty ? 'READY' : maxBuildable > 0 ? 'PARTIAL' : 'CRITICAL'

  res.json({
    orderQuantity: orderQty,
    maxBuildable,
    shortfall,
    primaryConstraint,
    constraintComponentCode: constraints[0]?.componentCode || '',
    overallStatus,
    calculations,
  })
})

// ── ORDER FEASIBILITY ──────────────────────────────────────────────────────
router.get('/order-feasibility/:orderId', async (req: AuthRequest, res: Response) => {
  const orderSnap = await adminDb.collection('customer_orders').doc(req.params.orderId as string).get()
  if (!orderSnap.exists) { res.status(404).json({ error: 'Order not found' }); return }
  const order: any = { id: orderSnap.id, ...orderSnap.data() }

  const remainingQty = order.quantity - (order.completedQuantity || 0)

  const bomSnap = await adminDb.collection('bill_of_materials')
    .where('productId', '==', order.productId)
    .get()
  const bomItems = bomSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  const componentIds = [...new Set(bomItems.map((b: any) => b.componentId))]
  const compSnap = componentIds.length > 0
    ? await adminDb.collection('components')
        .where('factoryId', '==', req.factoryId!)
        .get()
    : { docs: [] }
  const componentMap: any = {}
  compSnap.docs.forEach((d: any) => { componentMap[d.id] = { id: d.id, ...d.data() } })

  const materialLimits = bomItems.map((bom: any) => {
    const comp = componentMap[bom.componentId]
    const avail = (comp?.currentStock || 0) - (comp?.reservedStock || 0)
    const reqPerProduct = bom.quantityRequired || 0
    return reqPerProduct > 0 ? Math.floor(avail / reqPerProduct) : Infinity
  })
  const maxBuildable = Math.min(...materialLimits, remainingQty)
  const materialConstraint = materialLimits.indexOf(maxBuildable)
  const constraintComp = bomItems[materialConstraint]
    ? componentMap[bomItems[materialConstraint].componentId]?.componentName || 'Unknown'
    : 'None'

  let riskLevel: string
  if (remainingQty <= 0) riskLevel = 'COMPLETED'
  else if (maxBuildable >= remainingQty) riskLevel = 'ON TRACK'
  else if (maxBuildable > 0) riskLevel = 'AT RISK'
  else riskLevel = 'DELAYED'

  res.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    productId: order.productId,
    orderedQuantity: order.quantity,
    completedQuantity: order.completedQuantity || 0,
    remainingQuantity: remainingQty,
    materialAvailability: maxBuildable,
    maxBuildable,
    primaryConstraint: constraintComp,
    riskLevel,
  })
})

// ── DASHBOARD - Manufacturing KPIs ─────────────────────────────────────────
router.get('/manufacturing-kpis', async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const factoryId = req.factoryId!

  // Production
  const prodSnap = await adminDb.collection('production')
    .where('factoryId', '==', factoryId)
    .where('date', '==', today)
    .get()
  const todayProd = prodSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const totalTarget = todayProd.reduce((s: number, p: any) => s + (p.targetQuantity || 0), 0)
  const totalActual = todayProd.reduce((s: number, p: any) => s + (p.actualQuantity || 0), 0)
  const totalRejected = todayProd.reduce((s: number, p: any) => s + (p.rejectedQuantity || 0), 0)
  const totalDowntime = todayProd.reduce((s: number, p: any) => s + (p.downtimeMinutes || 0), 0)
  const achievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0
  const rejectionRate = totalActual > 0 ? ((totalRejected / totalActual) * 100).toFixed(1) : '0.0'

  // WIP — sum from today's in_progress records
  const wip = todayProd
    .filter((p: any) => p.status === 'in_progress')
    .reduce((s: number, p: any) => s + Math.max(0, (p.targetQuantity || 0) - (p.actualQuantity || 0)), 0)

  // Machines
  const machinesSnap = await adminDb.collection('machines')
    .where('factoryId', '==', factoryId).get()
  const machines = machinesSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const totalMachines = machines.length
  const runningMachines = machines.filter((m: any) => m.status === 'RUNNING').length
  const breakdownMachines = machines.filter((m: any) => m.status === 'BREAKDOWN').length
  const maintenanceMachines = machines.filter((m: any) => m.status === 'MAINTENANCE').length
  const machineUtilization = totalMachines > 0 ? Math.round((runningMachines / totalMachines) * 100) : 0
  const breakdownMachinesList = machines.filter((m: any) => m.status === 'BREAKDOWN').map((m: any) => ({
    machineCode: m.machineCode, machineName: m.machineName,
  }))

  // Workers
  const workersSnap = await adminDb.collection('workers')
    .where('factoryId', '==', factoryId).get()
  const workers = workersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const totalWorkers = workers.length
  const presentWorkers = workers.filter((w: any) => w.status === 'present').length
  const absentWorkers = totalWorkers - presentWorkers
  const workerAttendance = totalWorkers > 0 ? Math.round((presentWorkers / totalWorkers) * 100) : 0

  // Components
  const compSnap = await adminDb.collection('components')
    .where('factoryId', '==', factoryId).get()
  const components = compSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  // Customer orders
  const ordersSnap = await adminDb.collection('customer_orders')
    .where('factoryId', '==', factoryId).get()
  const orders = ordersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const activeOrders = orders.filter((o: any) => o.status !== 'COMPLETED')
  const ordersAtRisk = activeOrders.filter((o: any) => {
    const remaining = (o.quantity || 0) - (o.completedQuantity || 0)
    return remaining > 0
  })

  // Total remaining order quantity for all active orders
  const totalOrderRemaining = activeOrders.reduce((s: number, o: any) => {
    return s + Math.max(0, (o.quantity || 0) - (o.completedQuantity || 0))
  }, 0)

  // Primary active order for dashboard display
  const primaryOrder = activeOrders.find((o: any) => o.priority === 'HIGH') || activeOrders[0] || null
  const primaryOrderRemaining = primaryOrder ? Math.max(0, (primaryOrder.quantity || 0) - (primaryOrder.completedQuantity || 0)) : 0

  // Energy
  const energySnap = await adminDb.collection('energy')
    .where('factoryId', '==', factoryId)
    .where('date', '==', today)
    .get()
  const energyRecords = energySnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const totalEnergyKwh = energyRecords.reduce((s: number, e: any) => s + (e.energyConsumptionKwh || 0), 0)
  const energyPerUnit = totalActual > 0 ? (totalEnergyKwh / totalActual).toFixed(2) : '0'

  // BOM Intelligence — full readiness array
  const prodListSnap = await adminDb.collection('products')
    .where('factoryId', '==', factoryId).limit(1).get()
  let maxBuildable = 0
  let primaryConstraint = 'None'
  let primaryConstraintShortage = 0
  let materialReadiness = 0
  let bomReadiness: any[] = []
  let componentsReady = 0
  let componentsTotal = 0

  if (!prodListSnap.empty) {
    const product = prodListSnap.docs[0]
    const bomSnap = await adminDb.collection('bill_of_materials')
      .where('productId', '==', product.id).get()
    if (!bomSnap.empty) {
      const bomItems = bomSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      const compMap: any = {}
      components.forEach((c: any) => { compMap[c.id] = c })

      // Use the primary order remaining quantity as the basis for required calculation
      const orderQty = primaryOrderRemaining || totalTarget || 250

      bomReadiness = bomItems.map((b: any) => {
        const comp = compMap[b.componentId]
        const currentStock = comp?.currentStock || 0
        const reservedStock = comp?.reservedStock || 0
        const incomingStock = comp?.incomingStock || 0
        const available = currentStock - reservedStock
        const requiredPerProduct = b.quantityRequired || 0
        const totalRequired = orderQty * requiredPerProduct
        const shortage = Math.max(0, totalRequired - available)
        const possibleQty = requiredPerProduct > 0 ? Math.floor(available / requiredPerProduct) : 0
        const isReady = available >= totalRequired

        return {
          componentId: b.componentId,
          componentName: comp?.componentName || 'Unknown',
          componentCode: comp?.componentCode || '',
          requiredPerProduct,
          totalRequired,
          currentStock,
          reservedStock,
          incomingStock,
          available,
          shortage,
          possibleQty,
          isReady,
          status: isReady ? 'READY' : shortage > 0 && available > 0 ? 'LOW' : 'CRITICAL',
          supplier: comp?.supplier || '-',
          leadTimeDays: comp?.leadTimeDays || 0,
        }
      })

      componentsTotal = bomReadiness.length
      componentsReady = bomReadiness.filter((c: any) => c.isReady).length

      const buildableQtys = bomReadiness.map((c: any) => c.possibleQty)
      maxBuildable = buildableQtys.length > 0 ? Math.min(...buildableQtys) : 0

      const constraintItem = bomReadiness.reduce((min: any, c: any) =>
        c.possibleQty < min.possibleQty ? c : min, bomReadiness[0])
      if (constraintItem && constraintItem.possibleQty < orderQty) {
        primaryConstraint = constraintItem.componentName
        primaryConstraintShortage = constraintItem.shortage
      }

      materialReadiness = orderQty > 0 ? Math.round((maxBuildable / orderQty) * 100) : 0
    }
  }

  // Overall order risk
  const materialReady = componentsReady === componentsTotal && componentsTotal > 0
  let orderRiskStatus = 'ON TRACK'
  if (!materialReady && primaryConstraintShortage > 0) orderRiskStatus = 'AT RISK'
  if (breakdownMachines > 0 && !materialReady) orderRiskStatus = 'AT RISK'
  if (maxBuildable <= 0 && primaryOrderRemaining > 0) orderRiskStatus = 'CRITICAL'
  if (primaryOrderRemaining <= 0) orderRiskStatus = 'COMPLETED'

  // Critical issues
  const criticalIssues: any[] = []
  if (primaryConstraintShortage > 0) {
    criticalIssues.push({ type: 'material', title: 'Material Shortage', description: `${primaryConstraint}: ${primaryConstraintShortage} units short`, severity: 'critical' })
  }
  breakdownMachinesList.forEach((m: any) => {
    criticalIssues.push({ type: 'machine', title: 'Machine Breakdown', description: `${m.machineCode} — ${m.machineName}`, severity: 'critical' })
  })
  if (totalRejected > 0 && parseFloat(rejectionRate) > 2) {
    criticalIssues.push({ type: 'quality', title: 'High Rejection Rate', description: `${rejectionRate}% rejection rate (${totalRejected} units)`, severity: 'warning' })
  }
  if (workerAttendance < 80) {
    criticalIssues.push({ type: 'workforce', title: 'Workforce Shortage', description: `${absentWorkers} absent (${workerAttendance}% attendance)`, severity: 'warning' })
  }
  ordersAtRisk.forEach((o: any) => {
    if (o.dueDate && o.dueDate <= today) {
      criticalIssues.push({ type: 'order', title: 'Order Overdue', description: `${o.orderNumber} — due ${o.dueDate}`, severity: 'warning' })
    }
  })

  // Maintenance issues
  const maintSnap = await adminDb.collection('maintenance')
    .where('factoryId', '==', factoryId).get()
  const activeMaintenance = maintSnap.docs.map((d: any) => d.data()).filter((m: any) => m.status !== 'COMPLETED')

  // Quality
  const qualitySnap = await adminDb.collection('quality_inspections')
    .where('factoryId', '==', factoryId)
    .where('date', '==', today)
    .get()
  const qualityRecords = qualitySnap.docs.map((d: any) => d.data())
  const totalInspected = qualityRecords.reduce((s: number, q: any) => s + (q.inspectedQuantity || 0), 0)
  const totalPassed = qualityRecords.reduce((s: number, q: any) => s + (q.passedQuantity || 0), 0)
  const qualityPassRate = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : '0'

  res.json({
    factoryName: 'Prime Auto Components',
    industry: 'Automotive Component Manufacturing',
    productName: 'Automotive Brake Assembly',
    date: today,
    // Production
    productionTarget: totalTarget,
    completedProduction: totalActual,
    wip,
    remaining: Math.max(0, (primaryOrderRemaining || totalTarget) - totalActual),
    productionAchievement: achievement,
    rejectedQuantity: totalRejected,
    rejectionRate,
    totalDowntime,
    // BOM Readiness
    bomReadiness,
    componentsReady,
    componentsTotal,
    maxBuildable,
    materialReadiness,
    materialReady,
    primaryConstraint,
    primaryConstraintShortage,
    // Orders
    orderRiskStatus,
    ordersAtRisk: ordersAtRisk.length,
    primaryOrder: primaryOrder ? {
      orderNumber: primaryOrder.orderNumber,
      customerName: primaryOrder.customerName,
      quantity: primaryOrder.quantity,
      completedQuantity: primaryOrder.completedQuantity || 0,
      remaining: primaryOrderRemaining,
      dueDate: primaryOrder.dueDate,
      priority: primaryOrder.priority,
      status: primaryOrder.status,
    } : null,
    // Machines
    totalMachines,
    runningMachines,
    breakdownMachines,
    maintenanceMachines,
    machineUtilization,
    breakdownMachinesList,
    activeMaintenance: activeMaintenance.length,
    // Workforce
    totalWorkers,
    presentWorkers,
    absentWorkers,
    workerAttendance,
    // Energy
    totalEnergyKwh,
    energyPerUnit,
    // Quality
    qualityPassRate,
    totalInspected,
    // Critical Issues
    criticalIssues,
  })
})

// ── COMPONENT INVENTORY STATUS ─────────────────────────────────────────────
router.get('/components/inventory-status', async (req: AuthRequest, res: Response) => {
  const factoryId = req.factoryId!

  const compSnap = await adminDb.collection('components')
    .where('factoryId', '==', factoryId).get()
  const components = compSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  // Get active orders and BOM
  const ordersSnap = await adminDb.collection('customer_orders')
    .where('factoryId', '==', factoryId).get()
  const activeOrders = ordersSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    .filter((o: any) => o.status !== 'COMPLETED')
  const totalOrderQty = activeOrders.reduce((s: number, o: any) =>
    s + Math.max(0, (o.quantity || 0) - (o.completedQuantity || 0)), 0)

  const prodListSnap = await adminDb.collection('products')
    .where('factoryId', '==', factoryId).limit(1).get()
  let bomMap: Record<string, number> = {}
  if (!prodListSnap.empty) {
    const bomSnap = await adminDb.collection('bill_of_materials')
      .where('productId', '==', prodListSnap.docs[0].id).get()
    bomSnap.docs.forEach((d: any) => {
      const data = d.data()
      bomMap[data.componentId] = data.quantityRequired || 0
    })
  }

  const inventoryStatus = components.map((c: any) => {
    const requiredPerProduct = bomMap[c.id] || 0
    const totalRequired = totalOrderQty * requiredPerProduct
    const available = (c.currentStock || 0) - (c.reservedStock || 0)
    const shortage = Math.max(0, totalRequired - available)

    let status = 'READY'
    if (shortage > 0 && available > 0) status = 'LOW'
    if (shortage > 0 && available <= 0) status = 'OUT_OF_STOCK'
    if (shortage > totalRequired * 0.3) status = 'CRITICAL'

    return {
      id: c.id,
      componentCode: c.componentCode,
      componentName: c.componentName,
      unit: c.unit,
      currentStock: c.currentStock || 0,
      incomingStock: c.incomingStock || 0,
      reservedStock: c.reservedStock || 0,
      available,
      requiredPerProduct,
      totalRequired,
      shortage,
      status,
      supplier: c.supplier || '-',
      leadTimeDays: c.leadTimeDays || 0,
      unitCost: c.unitCost || 0,
    }
  })

  inventoryStatus.sort((a: any, b: any) => b.shortage - a.shortage)

  res.json({ data: inventoryStatus, totalOrderQty, total: inventoryStatus.length })
})

// ── UPDATE SINGLE COMPONENT ─────────────────────────────────────────────────
router.put('/components/:id', async (req: AuthRequest, res: Response) => {
  const componentId = req.params.id as string
  const { currentStock, incomingStock, reservedStock, supplier, expectedArrival, notes } = req.body

  try {
    const updateData: any = { updatedAt: new Date().toISOString() }
    if (currentStock !== undefined) updateData.currentStock = Number(currentStock)
    if (incomingStock !== undefined) updateData.incomingStock = Number(incomingStock)
    if (reservedStock !== undefined) updateData.reservedStock = Number(reservedStock)
    if (supplier !== undefined) updateData.supplier = supplier
    if (expectedArrival !== undefined) updateData.expectedArrival = expectedArrival
    if (notes !== undefined) updateData.notes = notes

    await adminDb.collection('components').doc(componentId).update(updateData)
    res.json({ success: true, message: 'Component updated' })
  } catch (err) {
    console.error('Failed to update component:', err)
    res.status(500).json({ error: 'Failed to update component' })
  }
})

// ── BATCH UPDATE COMPONENTS ──────────────────────────────────────────────────
router.post('/components/batch-update', async (req: AuthRequest, res: Response) => {
  const { records } = req.body
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: 'Records array is required' })
    return
  }

  const factoryId = req.factoryId!
  const compSnap = await adminDb.collection('components')
    .where('factoryId', '==', factoryId).get()
  const compByCode: Record<string, string> = {}
  compSnap.docs.forEach((d: any) => {
    const data = d.data()
    compByCode[data.componentCode] = d.id
  })

  let updated = 0
  let failed = 0
  for (const r of records) {
    try {
      const code = r.component_code || r.componentCode
      const docId = compByCode[code]
      if (!docId) { failed++; continue }

      const updateData: any = { updatedAt: new Date().toISOString() }
      if (r.current_stock !== undefined || r.currentStock !== undefined) {
        updateData.currentStock = Number(r.current_stock ?? r.currentStock)
      }
      if (r.incoming_quantity !== undefined || r.incomingStock !== undefined) {
        updateData.incomingStock = Number(r.incoming_quantity ?? r.incomingStock)
      }
      if (r.reserved_quantity !== undefined || r.reservedStock !== undefined) {
        updateData.reservedStock = Number(r.reserved_quantity ?? r.reservedStock)
      }

      await adminDb.collection('components').doc(docId).update(updateData)
      updated++
    } catch {
      failed++
    }
  }

  res.json({ updated, failed })
})

// ── QUALITY INSPECTIONS ─────────────────────────────────────────────────────
router.post('/quality', async (req: AuthRequest, res: Response) => {
  const { product, batch, inspectedQuantity, passedQuantity, rejectedQuantity, defectType, rejectionReason, date, shift, notes } = req.body
  try {
    const docRef = await adminDb.collection('quality_inspections').add({
      factoryId: req.factoryId,
      departmentId: req.departmentId || '',
      product: product || 'Automotive Brake Assembly',
      batch: batch || '',
      inspectedQuantity: Number(inspectedQuantity || 0),
      passedQuantity: Number(passedQuantity || 0),
      rejectedQuantity: Number(rejectedQuantity || 0),
      defectType: defectType || '',
      rejectionReason: rejectionReason || '',
      date: date || new Date().toISOString().split('T')[0],
      shift: shift || '',
      notes: notes || '',
      passRate: Number(inspectedQuantity) > 0 ? ((Number(passedQuantity) / Number(inspectedQuantity)) * 100).toFixed(1) : '0',
      rejectionRate: Number(inspectedQuantity) > 0 ? ((Number(rejectedQuantity) / Number(inspectedQuantity)) * 100).toFixed(1) : '0',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Quality record created' })
  } catch (err) {
    console.error('Failed to create quality record:', err)
    res.status(500).json({ error: 'Failed to save quality record' })
  }
})

router.get('/quality', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('quality_inspections')
    .where('factoryId', '==', req.factoryId!).get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  res.json({ data: all, total: all.length })
})

// ── WORKFORCE ATTENDANCE ────────────────────────────────────────────────────
router.post('/workforce', async (req: AuthRequest, res: Response) => {
  const { department, requiredWorkers, present, absent, shift, overtime, date, notes } = req.body
  try {
    const docRef = await adminDb.collection('workforce_attendance').add({
      factoryId: req.factoryId,
      departmentId: req.departmentId || '',
      department: department || '',
      requiredWorkers: Number(requiredWorkers || 0),
      present: Number(present || 0),
      absent: Number(absent || 0),
      shift: shift || '',
      overtime: Number(overtime || 0),
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Workforce record created' })
  } catch (err) {
    console.error('Failed to create workforce record:', err)
    res.status(500).json({ error: 'Failed to save workforce record' })
  }
})

router.get('/workforce', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('workforce_attendance')
    .where('factoryId', '==', req.factoryId!).get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  res.json({ data: all, total: all.length })
})

// ── CUSTOMER ORDER CRUD ─────────────────────────────────────────────────────
router.post('/customer-orders', async (req: AuthRequest, res: Response) => {
  const { orderNumber, customerName, productId, productName, quantity, dueDate, priority, notes } = req.body
  try {
    const docRef = await adminDb.collection('customer_orders').add({
      factoryId: req.factoryId,
      orderNumber: orderNumber || `ORD-${Date.now()}`,
      customerName: customerName || '',
      productId: productId || '',
      productName: productName || 'Automotive Brake Assembly',
      quantity: Number(quantity || 0),
      completedQuantity: 0,
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || '',
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      orderValue: 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Order created' })
  } catch (err) {
    console.error('Failed to create order:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

router.put('/customer-orders/:id', async (req: AuthRequest, res: Response) => {
  const orderId = req.params.id as string
  const updates = req.body
  try {
    const updateData: any = { updatedAt: new Date().toISOString() }
    const allowed = ['orderNumber', 'customerName', 'quantity', 'completedQuantity', 'dueDate', 'priority', 'status', 'notes']
    allowed.forEach(k => { if (updates[k] !== undefined) updateData[k] = updates[k] })
    await adminDb.collection('customer_orders').doc(orderId).update(updateData)
    res.json({ success: true, message: 'Order updated' })
  } catch (err) {
    console.error('Failed to update order:', err)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// ── MACHINE-WISE DAILY PRODUCTION ────────────────────────────────────────────
router.get('/machine-production/range', async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, shift } = req.query
  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate query params required (YYYY-MM-DD)' })
    return
  }
  try {
    const snap = await adminDb.collection('machine_daily_production')
      .where('factoryId', '==', req.factoryId!)
      .get()
    let records = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    records = records.filter((r: any) => r.date >= startDate && r.date <= endDate)
    if (shift) records = records.filter((r: any) => r.shift === shift)
    records.sort((a: any, b: any) => a.date.localeCompare(b.date) || a.machineNumber - b.machineNumber)
    res.json({ data: records, startDate, endDate, shift: shift || 'all' })
  } catch (err) {
    console.error('Failed to fetch production range:', err)
    res.status(500).json({ error: 'Failed to fetch production data' })
  }
})

router.get('/machine-production/today', async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const snap = await adminDb.collection('machine_daily_production')
    .where('factoryId', '==', req.factoryId!)
    .where('date', '==', today)
    .get()
  const records = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  res.json({ data: records })
})

router.post('/machine-production', async (req: AuthRequest, res: Response) => {
  const { machineNumber, partsProduced, defects, energyKwh, currentAmps, workersPresent, workersAbsent, shift } = req.body
  if (!machineNumber || machineNumber < 1 || machineNumber > 10) {
    res.status(400).json({ error: 'machineNumber must be 1-10' })
    return
  }
  const today = new Date().toISOString().split('T')[0]
  const managerName = req.name || 'Unknown'

  const existingSnap = await adminDb.collection('machine_daily_production')
    .where('factoryId', '==', req.factoryId!)
    .where('machineNumber', '==', machineNumber)
    .where('date', '==', today)
    .get()

  try {
    if (existingSnap.empty) {
      await adminDb.collection('machine_daily_production').add({
        factoryId: req.factoryId,
        machineNumber,
        managerId: req.uid,
        managerName,
        date: today,
        shift: shift || 'General',
        partsProduced: Number(partsProduced || 0),
        defects: Number(defects || 0),
        energyKwh: Number(energyKwh || 0),
        currentAmps: Number(currentAmps || 0),
        workersPresent: Number(workersPresent || 0),
        workersAbsent: Number(workersAbsent || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      const docId = existingSnap.docs[0].id
      await adminDb.collection('machine_daily_production').doc(docId).update({
        shift: shift || 'General',
        partsProduced: Number(partsProduced || 0),
        defects: Number(defects || 0),
        energyKwh: Number(energyKwh || 0),
        currentAmps: Number(currentAmps || 0),
        workersPresent: Number(workersPresent || 0),
        workersAbsent: Number(workersAbsent || 0),
        managerName,
        updatedAt: new Date().toISOString(),
      })
    }
    res.json({ success: true, message: 'Production data saved' })
  } catch (err) {
    console.error('Failed to save machine production:', err)
    res.status(500).json({ error: 'Failed to save production data' })
  }
})

// ── MACHINE SUGGESTIONS ──────────────────────────────────────────────────────
router.post('/machine-suggestions', async (req: AuthRequest, res: Response) => {
  const { machineNumber, message, type } = req.body
  if (!machineNumber || !message) {
    res.status(400).json({ error: 'machineNumber and message are required' })
    return
  }
  const managerName = req.name || 'Unknown'
  try {
    await adminDb.collection('machine_suggestions').add({
      factoryId: req.factoryId,
      machineNumber,
      managerId: req.uid,
      managerName,
      message,
      type: type || 'suggestion',
      status: 'open',
      createdAt: new Date().toISOString(),
      isRead: false,
    })
    res.status(201).json({ success: true, message: 'Suggestion submitted' })
  } catch (err) {
    console.error('Failed to save suggestion:', err)
    res.status(500).json({ error: 'Failed to save suggestion' })
  }
})

router.get('/machine-suggestions', async (req: AuthRequest, res: Response) => {
  const { status } = req.query
  let query: any = adminDb.collection('machine_suggestions')
    .where('factoryId', '==', req.factoryId!)
  if (status) query = query.where('status', '==', status)
  const snap = await query.get()
  let list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  res.json({ data: list })
})

router.patch('/machine-suggestions/:id/resolve', async (req: AuthRequest, res: Response) => {
  const { resolution } = req.body
  try {
    await adminDb.collection('machine_suggestions').doc(req.params.id as string).update({
      status: 'resolved',
      resolution: resolution || 'Repaired',
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.name || 'Owner',
    })
    res.json({ success: true, message: 'Issue marked as resolved' })
  } catch (err) {
    console.error('Failed to resolve suggestion:', err)
    res.status(500).json({ error: 'Failed to resolve' })
  }
})

// ── MANAGERS WITH MACHINE INFO ──────────────────────────────────────────────
router.get('/managers-with-machines', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection('users')
    .where('factoryId', '==', req.factoryId!)
    .where('role', '==', 'MANAGER')
    .get()
  const all = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const today = new Date().toISOString().split('T')[0]
  const prodSnap = await adminDb.collection('machine_daily_production')
    .where('factoryId', '==', req.factoryId!)
    .where('date', '==', today)
    .get()
  const prodMap: Record<number, any> = {}
  prodSnap.docs.forEach((d: any) => {
    const data = d.data()
    prodMap[data.machineNumber] = data
  })

  const result = []
  for (let i = 1; i <= 10; i++) {
    const manager = all.find((m: any) => m.machineNumber === i)
    const prod = prodMap[i]
    result.push({
      machineNumber: i,
      managerName: manager?.name || 'Unassigned',
      managerEmail: manager?.email || '-',
      managerId: manager?.id || null,
      partsProduced: prod?.partsProduced || 0,
      defects: prod?.defects || 0,
      energyKwh: prod?.energyKwh || 0,
      currentAmps: prod?.currentAmps || 0,
      workersPresent: prod?.workersPresent || 0,
      workersAbsent: prod?.workersAbsent || 0,
      shift: prod?.shift || 'General',
      lastUpdated: prod?.updatedAt || null,
    })
  }
  res.json({ data: result, today })
})

// ── MACHINE ENERGY OVERVIEW ────────────────────────────────────────────────
router.get('/machine-energy/overview', async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0]
  const snap = await adminDb.collection('machine_daily_production')
    .where('factoryId', '==', req.factoryId!)
    .where('date', '==', today)
    .get()
  const records = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const totalKwh = records.reduce((s: number, r: any) => s + (r.energyKwh || 0), 0)
  const totalAmps = records.reduce((s: number, r: any) => s + (r.currentAmps || 0), 0)
  res.json({ data: records, totalKwh, totalAmps, today })
})

// ── MACHINE ENERGY / CURRENT ─────────────────────────────────────────────────
router.post('/machine-energy', async (req: AuthRequest, res: Response) => {
  const { machineNumber, energyKwh, currentAmps } = req.body
  if (!machineNumber || machineNumber < 1 || machineNumber > 10) {
    res.status(400).json({ error: 'machineNumber must be 1-10' })
    return
  }
  const today = new Date().toISOString().split('T')[0]
  try {
    const existingSnap = await adminDb.collection('machine_daily_production')
      .where('factoryId', '==', req.factoryId!)
      .where('machineNumber', '==', machineNumber)
      .where('date', '==', today)
      .get()
    if (existingSnap.empty) {
      await adminDb.collection('machine_daily_production').add({
        factoryId: req.factoryId,
        machineNumber,
        managerId: req.uid,
        managerName: req.name || '',
        date: today,
        energyKwh: Number(energyKwh || 0),
        currentAmps: Number(currentAmps || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      await adminDb.collection('machine_daily_production').doc(existingSnap.docs[0].id).update({
        energyKwh: Number(energyKwh || 0),
        currentAmps: Number(currentAmps || 0),
        updatedAt: new Date().toISOString(),
      })
    }
    res.json({ success: true, message: 'Energy data saved' })
  } catch (err) {
    console.error('Failed to save energy data:', err)
    res.status(500).json({ error: 'Failed to save energy data' })
  }
})

// ── PRODUCTION REPORTS (Excel Upload) ────────────────────────────────────────
router.post('/production-reports', async (req: AuthRequest, res: Response) => {
  const { machineNumber, records } = req.body
  if (!machineNumber || !Array.isArray(records)) {
    res.status(400).json({ error: 'machineNumber and records array required' })
    return
  }
  const managerName = req.name || 'Unknown'
  try {
    const docRef = await adminDb.collection('production_reports').add({
      factoryId: req.factoryId,
      machineNumber,
      managerId: req.uid,
      managerName,
      records,
      recordCount: records.length,
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ id: docRef.id, message: 'Report uploaded' })
  } catch (err) {
    console.error('Failed to upload report:', err)
    res.status(500).json({ error: 'Failed to upload report' })
  }
})

router.get('/production-reports', async (req: AuthRequest, res: Response) => {
  const { machineNumber } = req.query
  let query: any = adminDb.collection('production_reports')
    .where('factoryId', '==', req.factoryId!)
  if (machineNumber) query = query.where('machineNumber', '==', Number(machineNumber))
  const snap = await query.get()
  let list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  res.json({ data: list })
})

// ── OWNER CREATES MANAGER ACCOUNT ────────────────────────────────────────────
router.post('/auth/create-manager', async (req: AuthRequest, res: Response) => {
  if (req.role !== 'OWNER') {
    res.status(403).json({ error: 'Only owners can create managers' })
    return
  }
  const { email, password, name, machineNumber } = req.body
  if (!email || !password || !name || !machineNumber) {
    res.status(400).json({ error: 'email, password, name, machineNumber required' })
    return
  }
  if (machineNumber < 1 || machineNumber > 10) {
    res.status(400).json({ error: 'machineNumber must be 1-10' })
    return
  }
  try {
    const { getAuth } = require('firebase-admin/auth')
    const userRecord = await getAuth().createUser({ email, password, displayName: name })
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: 'MANAGER',
      machineNumber,
      factoryId: req.factoryId,
      department: 'Production',
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ uid: userRecord.uid, message: `Manager ${name} created for Machine ${machineNumber}` })
  } catch (err: any) {
    console.error('Failed to create manager:', err)
    res.status(400).json({ error: err.message || 'Failed to create manager' })
  }
})

export default router
