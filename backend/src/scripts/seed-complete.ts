import { adminAuth, adminDb } from '../lib/firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

// ─────────────────────────────────────────────
//  CONFIG — change these to your real values
// ─────────────────────────────────────────────
const FACTORY_ID = 'prime-auto-components-001'
const OWNER_EMAIL = 'cyrilchrisj@gmail.com'
const OWNER_PASSWORD = 'MaxVerstappen33'
const OWNER_NAME = 'Cyril Chris J'

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d }
const daysLater = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d }

async function seedAll() {
  console.log('\n🌱 FactoryMind Full Demo Seed\n')
  console.log(`   Factory   : ${FACTORY_ID}`)
  console.log(`   Owner     : ${OWNER_EMAIL}`)
  console.log('─────────────────────────────────────────────\n')

  // ── STEP 1 : OWNER USER (Firebase Auth + Firestore) ─────────────────────
  console.log('👤 Step 1: Setting up Owner user...')
  let ownerUid: string
  try {
    let userRecord
    try {
      userRecord = await adminAuth.getUserByEmail(OWNER_EMAIL)
      console.log('   User already exists — updating password & profile')
      await adminAuth.updateUser(userRecord.uid, {
        password: OWNER_PASSWORD,
        displayName: OWNER_NAME,
      })
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        console.log('   Creating new Firebase Auth user...')
        userRecord = await adminAuth.createUser({
          email: OWNER_EMAIL,
          password: OWNER_PASSWORD,
          displayName: OWNER_NAME,
        })
      } else throw e
    }
    ownerUid = userRecord.uid

    // Save owner profile to Firestore users collection
    await adminDb.collection('users').doc(ownerUid).set({
      email: OWNER_EMAIL,
      name: OWNER_NAME,
      role: 'OWNER',
      factoryId: FACTORY_ID,         // ← critical: links owner to factory
      department: null,
      machineNumber: null,
      createdAt: new Date().toISOString(),
    })
    console.log(`   ✅ Owner saved  (uid: ${ownerUid})\n`)
  } catch (err) {
    console.error('   ❌ Owner setup failed:', err)
    process.exit(1)
  }

  // ── STEP 2 : FACTORY ─────────────────────────────────────────────────────
  console.log('🏭 Step 2: Factory document...')
  await adminDb.collection('factories').doc(FACTORY_ID).set({
    factoryId: FACTORY_ID,
    name: 'Prime Auto Components',
    location: 'Chennai, Tamil Nadu',
    industry: 'Automotive Component Manufacturing',
    employees: 120,
    status: 'ACTIVE',
    primaryProduct: 'Automotive Brake Assembly',
    ownerUid,
    createdAt: new Date().toISOString(),
  })
  console.log('   ✅ Factory created\n')

  // ── STEP 3 : MANAGERS (Firebase Auth + Firestore) ─────────────────────
  console.log('👔 Step 3: Demo Managers...')
  const managerDefs = [
    { email: 'manager.assembly@factory.com', name: 'Karthik Rajan',   department: 'Assembly',  machineNumber: 1 },
    { email: 'manager.machining@factory.com', name: 'Priya Meenakshi', department: 'Machining', machineNumber: 2 },
    { email: 'manager.quality@factory.com',   name: 'Suresh Kumar',    department: 'Quality',   machineNumber: 3 },
  ]
  const defaultManagerPassword = 'Manager@123'

  for (const m of managerDefs) {
    let uid: string
    try {
      let rec
      try {
        rec = await adminAuth.getUserByEmail(m.email)
        await adminAuth.updateUser(rec.uid, { password: defaultManagerPassword, displayName: m.name })
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          rec = await adminAuth.createUser({ email: m.email, password: defaultManagerPassword, displayName: m.name })
        } else throw e
      }
      uid = rec.uid
      await adminDb.collection('users').doc(uid).set({
        email: m.email,
        name: m.name,
        role: 'MANAGER',
        factoryId: FACTORY_ID,
        department: m.department,
        machineNumber: m.machineNumber,
        createdAt: new Date().toISOString(),
      })
      console.log(`   ✅ Manager: ${m.name} (${m.department}) — ${m.email}`)
    } catch (err) {
      console.error(`   ⚠️  Manager ${m.email} skipped:`, err)
    }
  }
  console.log('')

  // ── STEP 4 : PRODUCTS ────────────────────────────────────────────────────
  console.log('📦 Step 4: Products...')
  const prodRef = await adminDb.collection('products').add({
    factoryId: FACTORY_ID,
    productCode: 'BRAKE-ASSY-001',
    productName: 'Automotive Brake Assembly',
    description: 'Complete automotive disc brake assembly for passenger vehicles',
    category: 'Brake Assembly',
    unit: 'Units',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const productId = prodRef.id
  console.log(`   ✅ Product: Automotive Brake Assembly (id: ${productId})\n`)

  // ── STEP 5 : COMPONENTS ──────────────────────────────────────────────────
  console.log('🔩 Step 5: Components (inventory)...')
  const componentData = [
    { componentCode: 'BRK-DISC-001', componentName: 'Brake Disc',      unit: 'pcs', currentStock: 300, minimumStock: 100, reorderLevel: 50,  supplier: 'AutoForgings India',     leadTimeDays: 7,  unitCost: 450 },
    { componentCode: 'BRK-CAL-001',  componentName: 'Brake Caliper',   unit: 'pcs', currentStock: 270, minimumStock: 100, reorderLevel: 50,  supplier: 'Precision Castings Ltd',  leadTimeDays: 10, unitCost: 1200 },
    { componentCode: 'BRK-PAD-001',  componentName: 'Brake Pad',       unit: 'pcs', currentStock: 650, minimumStock: 200, reorderLevel: 100, supplier: 'FrictionTech Pvt Ltd',    leadTimeDays: 5,  unitCost: 180 },
    { componentCode: 'BRK-PST-001',  componentName: 'Piston',          unit: 'pcs', currentStock: 280, minimumStock: 100, reorderLevel: 50,  supplier: 'Micro Components Co',    leadTimeDays: 8,  unitCost: 220 },
    { componentCode: 'BRK-CBR-001',  componentName: 'Caliper Bracket', unit: 'pcs', currentStock: 300, minimumStock: 80,  reorderLevel: 40,  supplier: 'Forged Metals Ltd',      leadTimeDays: 6,  unitCost: 190 },
    { componentCode: 'BRK-GPN-001',  componentName: 'Guide Pin',       unit: 'pcs', currentStock: 600, minimumStock: 200, reorderLevel: 100, supplier: 'Precision Fasteners',    leadTimeDays: 4,  unitCost: 45 },
    { componentCode: 'BRK-SRG-001',  componentName: 'Seal Ring',       unit: 'pcs', currentStock: 400, minimumStock: 150, reorderLevel: 75,  supplier: 'RubberTech Industries',  leadTimeDays: 9,  unitCost: 25 },
    { componentCode: 'BRK-DBT-001',  componentName: 'Dust Boot',       unit: 'pcs', currentStock: 350, minimumStock: 150, reorderLevel: 75,  supplier: 'RubberTech Industries',  leadTimeDays: 9,  unitCost: 30 },
    { componentCode: 'BRK-BLT-001',  componentName: 'Bolt Kit',        unit: 'set', currentStock: 290, minimumStock: 100, reorderLevel: 50,  supplier: 'Standard Hardware Co',   leadTimeDays: 3,  unitCost: 85 },
    { componentCode: 'BRK-WSR-001',  componentName: 'Wear Sensor',     unit: 'pcs', currentStock: 180, minimumStock: 100, reorderLevel: 50,  supplier: 'SensoParts GmbH',        leadTimeDays: 14, unitCost: 320 },
  ]
  const componentRefs: Record<string, string> = {}
  for (const comp of componentData) {
    const ref = await adminDb.collection('components').add({
      factoryId: FACTORY_ID,
      ...comp,
      reservedStock: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    componentRefs[comp.componentCode] = ref.id
  }
  console.log('   ✅ 10 components\n')

  // ── STEP 6 : BILL OF MATERIALS ───────────────────────────────────────────
  console.log('📋 Step 6: Bill of Materials...')
  const bomItems = [
    { code: 'BRK-DISC-001', qty: 1 }, { code: 'BRK-CAL-001', qty: 1 },
    { code: 'BRK-PAD-001',  qty: 2 }, { code: 'BRK-PST-001', qty: 1 },
    { code: 'BRK-CBR-001',  qty: 1 }, { code: 'BRK-GPN-001', qty: 2 },
    { code: 'BRK-SRG-001',  qty: 1 }, { code: 'BRK-DBT-001', qty: 1 },
    { code: 'BRK-BLT-001',  qty: 1 }, { code: 'BRK-WSR-001', qty: 1 },
  ]
  for (const item of bomItems) {
    await adminDb.collection('bill_of_materials').add({
      factoryId: FACTORY_ID,
      productId,
      componentId: componentRefs[item.code],
      quantityRequired: item.qty,
      wastagePercentage: 2,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('   ✅ 10 BOM entries\n')

  // ── STEP 7 : CUSTOMER ORDERS ─────────────────────────────────────────────
  console.log('🛒 Step 7: Customer Orders...')
  await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID, orderNumber: 'ORD-2026-001',
    customerName: 'Apex Mobility Systems', productId, productName: 'Automotive Brake Assembly',
    quantity: 250, completedQuantity: 165, orderDate: fmt(daysAgo(14)), dueDate: fmt(today),
    priority: 'HIGH', status: 'IN_PROGRESS', orderValue: 3750000,
    notes: 'Priority order for new SUV platform',
    createdAt: daysAgo(14).toISOString(), updatedAt: new Date().toISOString(),
  })
  await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID, orderNumber: 'ORD-2026-002',
    customerName: 'Transaxle Dynamics Inc', productId, productName: 'Automotive Brake Assembly',
    quantity: 100, completedQuantity: 100, orderDate: fmt(daysAgo(30)), dueDate: fmt(daysAgo(2)),
    priority: 'MEDIUM', status: 'COMPLETED', orderValue: 1500000, notes: '',
    createdAt: daysAgo(30).toISOString(), updatedAt: daysAgo(2).toISOString(),
  })
  await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID, orderNumber: 'ORD-2026-003',
    customerName: 'Greenfield Auto Parts', productId, productName: 'Automotive Brake Assembly',
    quantity: 75, completedQuantity: 0, orderDate: fmt(daysAgo(5)), dueDate: fmt(daysLater(10)),
    priority: 'LOW', status: 'PENDING', orderValue: 1125000, notes: 'New customer — trial order',
    createdAt: daysAgo(5).toISOString(), updatedAt: new Date().toISOString(),
  })
  console.log('   ✅ 3 orders\n')

  // ── STEP 8 : MACHINES ────────────────────────────────────────────────────
  console.log('⚙️  Step 8: Machines...')
  const machines = [
    { machineCode: 'CNC-01',   machineName: 'CNC Machining Center #1', department: 'Machining', machineNumber: 1, status: 'RUNNING',   healthScore: 92, utilization: 88 },
    { machineCode: 'CNC-02',   machineName: 'CNC Machining Center #2', department: 'Machining', machineNumber: 2, status: 'RUNNING',   healthScore: 87, utilization: 82 },
    { machineCode: 'CNC-03',   machineName: 'CNC Machining Center #3', department: 'Machining', machineNumber: 3, status: 'RUNNING',   healthScore: 78, utilization: 74 },
    { machineCode: 'CNC-04',   machineName: 'CNC Machining Center #4', department: 'Machining', machineNumber: 4, status: 'BREAKDOWN', healthScore: 35, utilization: 0  },
    { machineCode: 'DRILL-01', machineName: 'Drilling Machine',        department: 'Drilling',  machineNumber: 5, status: 'RUNNING',   healthScore: 88, utilization: 79 },
    { machineCode: 'GRIND-01', machineName: 'Surface Grinder',         department: 'Finishing', machineNumber: 6, status: 'RUNNING',   healthScore: 95, utilization: 91 },
    { machineCode: 'ASSY-01',  machineName: 'Assembly Workstation',    department: 'Assembly',  machineNumber: 7, status: 'RUNNING',   healthScore: 90, utilization: 85 },
    { machineCode: 'TEST-01',  machineName: 'Quality Test Station',    department: 'Quality',   machineNumber: 8, status: 'RUNNING',   healthScore: 98, utilization: 65 },
  ]
  for (const m of machines) {
    await adminDb.collection('machines').add({
      factoryId: FACTORY_ID, ...m,
      lastMaintained: fmt(daysAgo(15)),
      nextMaintenance: fmt(daysLater(20)),
      location: `Section-${m.department.substring(0, 3).toUpperCase()}`,
      energyConsumption: 150 + Math.floor(Math.random() * 100),
      productionRate: 45 + Math.floor(Math.random() * 30),
      createdAt: new Date().toISOString(),
    })
  }
  console.log('   ✅ 8 machines\n')

  // ── STEP 9 : MAINTENANCE ─────────────────────────────────────────────────
  console.log('🔧 Step 9: Maintenance records...')
  const maintenance = [
    {
      machineCode: 'CNC-04', machineName: 'CNC Machining Center #4',
      issueType: 'Cutting Tool Failure', priority: 'HIGH', status: 'IN_PROGRESS',
      description: 'Spindle vibration detected. Tool holder replacement needed.',
      downtimeMinutes: 45, reportedDate: fmt(today), expectedResolution: fmt(daysLater(1)),
      maintenanceCost: 8500, nextMaintenance: fmt(daysLater(30)),
      notes: 'Stock replacement tool ordered.',
    },
    {
      machineCode: 'CNC-01', machineName: 'CNC Machining Center #1',
      issueType: 'Preventive Maintenance', priority: 'MEDIUM', status: 'SCHEDULED',
      description: 'Scheduled quarterly oil change and spindle inspection',
      downtimeMinutes: 120, reportedDate: fmt(daysAgo(1)), expectedResolution: fmt(daysLater(5)),
      maintenanceCost: 12000, nextMaintenance: fmt(daysLater(90)),
      notes: 'Standard quarterly maintenance',
    },
    {
      machineCode: 'GRIND-01', machineName: 'Surface Grinder',
      issueType: 'Wheel Dressing', priority: 'MEDIUM', status: 'SCHEDULED',
      description: 'Grinding wheel dressing and alignment check',
      downtimeMinutes: 60, reportedDate: fmt(daysAgo(2)), expectedResolution: fmt(daysLater(3)),
      maintenanceCost: 3500, nextMaintenance: fmt(daysLater(45)), notes: '',
    },
  ]
  for (const m of maintenance) {
    await adminDb.collection('maintenance').add({ factoryId: FACTORY_ID, ...m, createdAt: new Date().toISOString() })
  }
  console.log('   ✅ 3 records\n')

  // ── STEP 10 : PRODUCTION (30 days) ──────────────────────────────────────
  console.log('🏭 Step 10: Production records (30 days)...')
  const shifts = ['Morning', 'Evening', 'Night']
  const machineCodes = ['CNC-01', 'CNC-02', 'CNC-03', 'ASSY-01', 'GRIND-01', 'DRILL-01']
  for (let i = 0; i < 30; i++) {
    const target = 80 + Math.floor(Math.random() * 60)
    const actual = Math.floor(target * (0.6 + Math.random() * 0.4))
    await adminDb.collection('production').add({
      factoryId: FACTORY_ID, departmentId: '',
      date: fmt(daysAgo(i)),
      shift: shifts[i % 3],
      machineCode: machineCodes[i % machineCodes.length],
      productName: 'Automotive Brake Assembly',
      targetQuantity: target,
      actualQuantity: actual,
      rejectedQuantity: Math.floor(actual * (0.01 + Math.random() * 0.03)),
      downtimeMinutes: Math.floor(Math.random() * 50),
      notes: '',
      status: actual >= target ? 'completed' : 'in_progress',
      createdAt: daysAgo(i).toISOString(),
    })
  }
  // Today's records
  for (const r of [
    { shift: 'Morning', machineCode: 'CNC-01', targetQuantity: 125, actualQuantity: 98,  rejectedQuantity: 3, downtimeMinutes: 45, notes: 'CNC-04 breakdown impacted line flow' },
    { shift: 'Morning', machineCode: 'CNC-02', targetQuantity: 125, actualQuantity: 67,  rejectedQuantity: 2, downtimeMinutes: 30, notes: 'Wear sensor shortage - partial assembly' },
  ]) {
    await adminDb.collection('production').add({
      factoryId: FACTORY_ID, departmentId: '', date: fmt(today),
      ...r, productName: 'Automotive Brake Assembly',
      status: 'in_progress', createdAt: new Date().toISOString(),
    })
  }
  console.log('   ✅ 32 production records\n')

  // ── STEP 11 : WORKERS ────────────────────────────────────────────────────
  console.log('👷 Step 11: Workers...')
  const workers = [
    { name: 'Arjun Kumar',    department: 'Assembly',  role: 'Senior Assembler',  status: 'present', shift: 'Morning', productivity: 91, attendance: 97 },
    { name: 'Priya Nair',     department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 88, attendance: 95 },
    { name: 'Suresh Babu',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 85, attendance: 93 },
    { name: 'Divya Raj',      department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning', productivity: 94, attendance: 99 },
    { name: 'Ravi Shankar',   department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning', productivity: 76, attendance: 82 },
    { name: 'Karthik Raj',    department: 'Assembly',  role: 'Junior Assembler',  status: 'present', shift: 'Morning', productivity: 87, attendance: 94 },
    { name: 'Venkat Raman',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 88, attendance: 92 },
    { name: 'Neha Shah',      department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 91, attendance: 96 },
    { name: 'Sneha Patel',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 92, attendance: 96 },
    { name: 'Amit Verma',     department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning', productivity: 85, attendance: 90 },
    { name: 'Manoj Tiwari',   department: 'Machining', role: 'CNC Operator',      status: 'present', shift: 'Morning', productivity: 92, attendance: 97 },
    { name: 'Shilpa Reddy',   department: 'Machining', role: 'CNC Operator',      status: 'present', shift: 'Morning', productivity: 89, attendance: 95 },
    { name: 'Vijay M',        department: 'Machining', role: 'CNC Operator',      status: 'present', shift: 'Morning', productivity: 86, attendance: 93 },
    { name: 'Anjali K',       department: 'Machining', role: 'CNC Operator',      status: 'absent',  shift: 'Morning', productivity: 91, attendance: 94 },
    { name: 'Sandeep G',      department: 'Machining', role: 'CNC Operator',      status: 'present', shift: 'Morning', productivity: 84, attendance: 91 },
    { name: 'Deepa Nair',     department: 'Quality',   role: 'QC Inspector',      status: 'present', shift: 'Morning', productivity: 90, attendance: 98 },
    { name: 'Mohan Raj',      department: 'Quality',   role: 'QC Inspector',      status: 'absent',  shift: 'Morning', productivity: 82, attendance: 87 },
    { name: 'Ritu Agarwal',   department: 'Drilling',  role: 'Machine Operator',  status: 'present', shift: 'Morning', productivity: 87, attendance: 93 },
    { name: 'Geetha Rani',    department: 'Finishing', role: 'Grinder Operator',  status: 'present', shift: 'Morning', productivity: 89, attendance: 95 },
    { name: 'Vikram Singh',   department: 'Finishing', role: 'Grinder Operator',  status: 'present', shift: 'Morning', productivity: 87, attendance: 93 },
  ]
  for (const w of workers) {
    await adminDb.collection('workers').add({ factoryId: FACTORY_ID, ...w, createdAt: new Date().toISOString() })
  }
  console.log('   ✅ 20 workers\n')

  // ── STEP 12 : ENERGY (30 days) ───────────────────────────────────────────
  console.log('⚡ Step 12: Energy records (30 days)...')
  for (let i = 0; i < 30; i++) {
    const kwh = 1200 + Math.floor(Math.random() * 400)
    const output = 150 + Math.floor(Math.random() * 80)
    await adminDb.collection('energy').add({
      factoryId: FACTORY_ID,
      date: fmt(daysAgo(i)),
      shift: i % 2 === 0 ? 'Morning' : 'Evening',
      machineCode: 'FACTORY', machineName: 'Factory Total',
      workingHours: 8,
      energyConsumptionKwh: kwh,
      energyCost: Math.round(kwh * 7.5),
      productionOutput: output,
      energyPerUnit: output > 0 ? (kwh / output).toFixed(2) : '0',
      peakDemandKw: 180 + Math.floor(Math.random() * 60),
      powerFactor: +(0.88 + (Math.random() * 0.1)).toFixed(3),
      createdAt: daysAgo(i).toISOString(),
    })
  }
  console.log('   ✅ 30 energy records\n')

  // ── STEP 13 : SALES (last 6 months) ─────────────────────────────────────
  console.log('💰 Step 13: Sales records...')
  for (let i = 0; i < 6; i++) {
    const units = 200 + Math.floor(Math.random() * 150)
    const revenue = units * 15000
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    await adminDb.collection('sales').add({
      factoryId: FACTORY_ID,
      month: d.toISOString().substring(0, 7),
      productName: 'Automotive Brake Assembly',
      unitsSold: units,
      revenue,
      cogs: Math.floor(revenue * 0.65),
      profit: Math.floor(revenue * 0.35),
      customer: ['Apex Mobility Systems', 'Transaxle Dynamics Inc', 'Greenfield Auto Parts'][i % 3],
      createdAt: d.toISOString(),
    })
  }
  console.log('   ✅ 6 sales records\n')

  // ── STEP 14 : NOTIFICATIONS ──────────────────────────────────────────────
  console.log('🔔 Step 14: Notifications...')
  const notifications = [
    { type: 'machine',    severity: 'critical', isRead: false, title: 'MACHINE ALERT',      message: 'CNC-04 has been unavailable for 45 minutes. Cutting Tool Failure — High Priority.' },
    { type: 'material',   severity: 'critical', isRead: false, title: 'MATERIAL SHORTAGE',   message: 'Wear Sensor stock (180) is insufficient for Order ORD-2026-001 (required: 250).' },
    { type: 'production', severity: 'warning',  isRead: false, title: 'PRODUCTION ALERT',    message: 'Morning shift production (98 units) is below target (125 units). Achievement: 78%' },
    { type: 'workforce',  severity: 'warning',  isRead: false, title: 'WORKFORCE ALERT',     message: 'Assembly Department is below required staffing. Present: 8/10 required.' },
    { type: 'order',      severity: 'warning',  isRead: false, title: 'ORDER AT RISK',       message: 'Order ORD-2026-001 may miss completion. Constraint: Wear Sensor shortage.' },
    { type: 'info',       severity: 'info',     isRead: true,  title: 'Reorder Reminder',    message: 'Wear Sensor reorder level reached. Contact SensoParts GmbH. Lead time: 14 days.' },
    { type: 'MESSAGE',    severity: 'INFO',     isRead: false, title: 'Message from Owner',  message: 'Please ensure CNC-04 is repaired by end of day shift.', recipientRole: 'MANAGER' },
  ]
  for (const n of notifications) {
    await adminDb.collection('notifications').add({ factoryId: FACTORY_ID, ...n, createdAt: new Date().toISOString() })
  }
  console.log('   ✅ 7 notifications\n')

  // ── STEP 15 : MACHINE SUGGESTIONS ────────────────────────────────────────
  console.log('💡 Step 15: Machine suggestions...')
  await adminDb.collection('machine_suggestions').add({
    factoryId: FACTORY_ID, machineNumber: 4, machineCode: 'CNC-04',
    message: 'Cutting tool failed during operation. Spindle vibration abnormal. Requesting urgent maintenance.',
    type: 'maintenance', status: 'open', isResolved: false,
    createdAt: new Date().toISOString(),
  })
  await adminDb.collection('machine_suggestions').add({
    factoryId: FACTORY_ID, machineNumber: 2, machineCode: 'CNC-02',
    message: 'Running low on Wear Sensor components. Can only complete partial assembly.',
    type: 'material', status: 'open', isResolved: false,
    createdAt: new Date().toISOString(),
  })
  console.log('   ✅ 2 suggestions\n')

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('─────────────────────────────────────────────')
  console.log('🎉 All demo data seeded successfully!\n')
  console.log('   Login credentials:')
  console.log(`   🔑 Owner   → ${OWNER_EMAIL} / ${OWNER_PASSWORD}`)
  console.log(`   🔑 Manager → manager.assembly@factory.com / ${defaultManagerPassword}`)
  console.log(`   🔑 Manager → manager.machining@factory.com / ${defaultManagerPassword}`)
  console.log(`   🔑 Manager → manager.quality@factory.com / ${defaultManagerPassword}`)
  console.log('')
  console.log(`   factoryId: ${FACTORY_ID}`)
  console.log('─────────────────────────────────────────────\n')
}

seedAll().catch(err => { console.error('\n❌ Seed failed:', err); process.exit(1) })
