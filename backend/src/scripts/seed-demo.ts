import { adminDb } from '../lib/firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

const FACTORY_ID = 'prime-auto-components-001'
const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d }
const daysLater = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d }

async function seed() {
  console.log('🌱 Seeding demo data for Prime Auto Components...\n')

  // ── 1. FACTORY ──────────────────────────────────────────────────────────
  await adminDb.collection('factories').doc(FACTORY_ID).set({
    factoryId: FACTORY_ID,
    name: 'Prime Auto Components',
    location: 'Chennai, Tamil Nadu',
    industry: 'Automotive Component Manufacturing',
    employees: 120,
    status: 'ACTIVE',
    primaryProduct: 'Automotive Brake Assembly',
    createdAt: new Date().toISOString(),
  })
  console.log('✅ Factory: Prime Auto Components')

  // ── 2. PRODUCTS ─────────────────────────────────────────────────────────
  const brakeProduct = {
    factoryId: FACTORY_ID,
    productCode: 'BRAKE-ASSY-001',
    productName: 'Automotive Brake Assembly',
    description: 'Complete automotive disc brake assembly for passenger vehicles',
    category: 'Brake Assembly',
    unit: 'Units',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const prodRef = await adminDb.collection('products').add(brakeProduct)
  const productId = prodRef.id
  console.log('✅ Product: Automotive Brake Assembly')

  // ── 3. COMPONENTS ───────────────────────────────────────────────────────
  const componentData = [
    { componentCode: 'BRK-DISC-001', componentName: 'Brake Disc',          unit: 'pcs', currentStock: 300, minimumStock: 100, reorderLevel: 50,  supplier: 'AutoForgings India',    leadTimeDays: 7,  unitCost: 450 },
    { componentCode: 'BRK-CAL-001',  componentName: 'Brake Caliper',       unit: 'pcs', currentStock: 270, minimumStock: 100, reorderLevel: 50,  supplier: 'Precision Castings Ltd', leadTimeDays: 10, unitCost: 1200 },
    { componentCode: 'BRK-PAD-001',  componentName: 'Brake Pad',           unit: 'pcs', currentStock: 650, minimumStock: 200, reorderLevel: 100, supplier: 'FrictionTech Pvt Ltd',    leadTimeDays: 5,  unitCost: 180 },
    { componentCode: 'BRK-PST-001',  componentName: 'Piston',              unit: 'pcs', currentStock: 280, minimumStock: 100, reorderLevel: 50,  supplier: 'Micro Components Co',    leadTimeDays: 8,  unitCost: 220 },
    { componentCode: 'BRK-CBR-001',  componentName: 'Caliper Bracket',     unit: 'pcs', currentStock: 300, minimumStock: 80,  reorderLevel: 40,  supplier: 'Forged Metals Ltd',      leadTimeDays: 6,  unitCost: 190 },
    { componentCode: 'BRK-GPN-001',  componentName: 'Guide Pin',           unit: 'pcs', currentStock: 600, minimumStock: 200, reorderLevel: 100, supplier: 'Precision Fasteners',    leadTimeDays: 4,  unitCost: 45 },
    { componentCode: 'BRK-SRG-001',  componentName: 'Seal Ring',           unit: 'pcs', currentStock: 400, minimumStock: 150, reorderLevel: 75,  supplier: 'RubberTech Industries',  leadTimeDays: 9,  unitCost: 25 },
    { componentCode: 'BRK-DBT-001',  componentName: 'Dust Boot',           unit: 'pcs', currentStock: 350, minimumStock: 150, reorderLevel: 75,  supplier: 'RubberTech Industries',  leadTimeDays: 9,  unitCost: 30 },
    { componentCode: 'BRK-BLT-001',  componentName: 'Bolt Kit',            unit: 'set', currentStock: 290, minimumStock: 100, reorderLevel: 50,  supplier: 'Standard Hardware Co',   leadTimeDays: 3,  unitCost: 85 },
    { componentCode: 'BRK-WSR-001',  componentName: 'Wear Sensor',         unit: 'pcs', currentStock: 180, minimumStock: 100, reorderLevel: 50,  supplier: 'SensoParts GmbH',        leadTimeDays: 14, unitCost: 320 },
  ]

  const componentRefs: any = {}
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
  console.log('✅ Components: 10 items')

  // ── 4. BILL OF MATERIALS ────────────────────────────────────────────────
  const bomItems = [
    { componentCode: 'BRK-DISC-001', qty: 1 },
    { componentCode: 'BRK-CAL-001',  qty: 1 },
    { componentCode: 'BRK-PAD-001',  qty: 2 },
    { componentCode: 'BRK-PST-001',  qty: 1 },
    { componentCode: 'BRK-CBR-001',  qty: 1 },
    { componentCode: 'BRK-GPN-001',  qty: 2 },
    { componentCode: 'BRK-SRG-001',  qty: 1 },
    { componentCode: 'BRK-DBT-001',  qty: 1 },
    { componentCode: 'BRK-BLT-001',  qty: 1 },
    { componentCode: 'BRK-WSR-001',  qty: 1 },
  ]

  for (const item of bomItems) {
    await adminDb.collection('bill_of_materials').add({
      factoryId: FACTORY_ID,
      productId,
      componentId: componentRefs[item.componentCode],
      quantityRequired: item.qty,
      wastagePercentage: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  console.log('✅ BOM: 10 components')

  // ── 5. CUSTOMER ORDERS ──────────────────────────────────────────────────
  const orderRef = await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID,
    orderNumber: 'ORD-2026-001',
    customerName: 'Apex Mobility Systems',
    productId,
    productName: 'Automotive Brake Assembly',
    quantity: 250,
    completedQuantity: 165,
    orderDate: fmt(daysAgo(14)),
    dueDate: fmt(today),
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    orderValue: 3750000,
    notes: 'Priority order for new SUV platform',
    createdAt: daysAgo(14).toISOString(),
    updatedAt: new Date().toISOString(),
  })

  await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID,
    orderNumber: 'ORD-2026-002',
    customerName: 'Transaxle Dynamics Inc',
    productId,
    productName: 'Automotive Brake Assembly',
    quantity: 100,
    completedQuantity: 100,
    orderDate: fmt(daysAgo(30)),
    dueDate: fmt(daysAgo(2)),
    priority: 'MEDIUM',
    status: 'COMPLETED',
    orderValue: 1500000,
    notes: '',
    createdAt: daysAgo(30).toISOString(),
    updatedAt: daysAgo(2).toISOString(),
  })

  await adminDb.collection('customer_orders').add({
    factoryId: FACTORY_ID,
    orderNumber: 'ORD-2026-003',
    customerName: 'Greenfield Auto Parts',
    productId,
    productName: 'Automotive Brake Assembly',
    quantity: 75,
    completedQuantity: 0,
    orderDate: fmt(daysAgo(5)),
    dueDate: fmt(daysLater(10)),
    priority: 'LOW',
    status: 'PENDING',
    orderValue: 1125000,
    notes: 'New customer - trial order',
    createdAt: daysAgo(5).toISOString(),
    updatedAt: new Date().toISOString(),
  })
  console.log('✅ Customer Orders: 3 orders')

  // ── 6. MACHINES ─────────────────────────────────────────────────────────
  const machines = [
    { machineCode: 'CNC-01', machineName: 'CNC Machining Center #1', department: 'Machining', status: 'RUNNING',     healthScore: 92, utilization: 88 },
    { machineCode: 'CNC-02', machineName: 'CNC Machining Center #2', department: 'Machining', status: 'RUNNING',     healthScore: 87, utilization: 82 },
    { machineCode: 'CNC-03', machineName: 'CNC Machining Center #3', department: 'Machining', status: 'RUNNING',     healthScore: 78, utilization: 74 },
    { machineCode: 'CNC-04', machineName: 'CNC Machining Center #4', department: 'Machining', status: 'BREAKDOWN',   healthScore: 35, utilization: 0  },
    { machineCode: 'DRILL-01',machineName: 'Drilling Machine',       department: 'Drilling',  status: 'RUNNING',     healthScore: 88, utilization: 79 },
    { machineCode: 'GRIND-01',machineName: 'Surface Grinder',        department: 'Finishing',  status: 'RUNNING',     healthScore: 95, utilization: 91 },
    { machineCode: 'ASSY-01', machineName: 'Assembly Workstation',   department: 'Assembly',   status: 'RUNNING',     healthScore: 90, utilization: 85 },
    { machineCode: 'TEST-01', machineName: 'Quality Test Station',   department: 'Quality',    status: 'RUNNING',     healthScore: 98, utilization: 65 },
  ]
  for (const m of machines) {
    await adminDb.collection('machines').add({
      factoryId: FACTORY_ID,
      ...m,
      lastMaintained: fmt(daysAgo(15)),
      nextMaintenance: fmt(daysLater(20)),
      location: `Section-${m.department.substring(0, 3).toUpperCase()}`,
      energyConsumption: 150 + Math.floor(Math.random() * 100),
      productionRate: 45 + Math.floor(Math.random() * 30),
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Machines: 8 units')

  // ── 7. MAINTENANCE ──────────────────────────────────────────────────────
  const maintenance = [
    {
      machineCode: 'CNC-04',
      machineName: 'CNC Machining Center #4',
      issueType: 'Cutting Tool Failure',
      description: 'CNC-04 experienced cutting tool failure during morning shift. Spindle vibration detected. Requires tool holder replacement and alignment.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      downtimeMinutes: 45,
      reportedDate: fmt(today),
      expectedResolution: fmt(daysLater(1)),
      maintenanceCost: 8500,
      nextMaintenance: fmt(daysLater(30)),
      notes: 'Cutting tool insert shattered during operation. Stock replacement tool ordered.',
    },
    {
      machineCode: 'CNC-01',
      machineName: 'CNC Machining Center #1',
      issueType: 'Preventive Maintenance',
      description: 'Scheduled quarterly oil change and spindle inspection',
      status: 'SCHEDULED',
      priority: 'MEDIUM',
      downtimeMinutes: 120,
      reportedDate: fmt(daysAgo(1)),
      expectedResolution: fmt(daysLater(5)),
      maintenanceCost: 12000,
      nextMaintenance: fmt(daysLater(90)),
      notes: 'Standard quarterly maintenance',
    },
    {
      machineCode: 'GRIND-01',
      machineName: 'Surface Grinder',
      issueType: 'Wheel Dressing',
      description: 'Grinding wheel requires dressing and alignment check',
      status: 'SCHEDULED',
      priority: 'MEDIUM',
      downtimeMinutes: 60,
      reportedDate: fmt(daysAgo(2)),
      expectedResolution: fmt(daysLater(3)),
      maintenanceCost: 3500,
      nextMaintenance: fmt(daysLater(45)),
      notes: '',
    },
  ]
  for (const m of maintenance) {
    await adminDb.collection('maintenance').add({
      factoryId: FACTORY_ID,
      ...m,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Maintenance: 3 records')

  // ── 8. PRODUCTION ───────────────────────────────────────────────────────
  const shifts = ['Morning', 'Evening', 'Night']
  const machinesList = ['CNC-01', 'CNC-02', 'CNC-03', 'ASSY-01', 'GRIND-01', 'DRILL-01']
  for (let i = 0; i < 30; i++) {
    const target = 80 + Math.floor(Math.random() * 60)
    const actual = Math.floor(target * (0.6 + Math.random() * 0.4))
    const downtime = Math.floor(Math.random() * 50)
    const rejected = Math.floor(actual * (0.01 + Math.random() * 0.03))

    await adminDb.collection('production').add({
      factoryId: FACTORY_ID,
      departmentId: '',
      date: fmt(daysAgo(i)),
      shift: shifts[i % 3],
      machineCode: machinesList[i % machinesList.length],
      productName: 'Automotive Brake Assembly',
      targetQuantity: target,
      actualQuantity: actual,
      rejectedQuantity: rejected,
      downtimeMinutes: i < 3 ? downtime * 2 : downtime,
      notes: i === 0 ? 'CNC-04 downtime affected output' : '',
      status: actual >= target ? 'completed' : 'in_progress',
      createdAt: daysAgo(i).toISOString(),
    })
  }
  console.log('✅ Production: 30 records')

  // Today's production - mirror the demo story
  const todayRecords = [
    { shift: 'Morning', machineCode: 'CNC-01', targetQuantity: 125, actualQuantity: 98, rejectedQuantity: 3, downtimeMinutes: 45, notes: 'CNC-04 breakdown impacted line flow' },
    { shift: 'Morning', machineCode: 'CNC-02', targetQuantity: 125, actualQuantity: 67, rejectedQuantity: 2, downtimeMinutes: 30, notes: 'Wear sensor shortage - partial assembly' },
    { shift: 'Evening', machineCode: 'ASSY-01', targetQuantity: 0, actualQuantity: 0, rejectedQuantity: 0, downtimeMinutes: 0, notes: 'Shift reduced due to material shortage' },
  ]
  for (const r of todayRecords) {
    if (r.targetQuantity > 0) {
      await adminDb.collection('production').add({
        factoryId: FACTORY_ID,
        departmentId: '',
        date: fmt(today),
        shift: r.shift,
        machineCode: r.machineCode,
        productName: 'Automotive Brake Assembly',
        targetQuantity: r.targetQuantity,
        actualQuantity: r.actualQuantity,
        rejectedQuantity: r.rejectedQuantity,
        downtimeMinutes: r.downtimeMinutes,
        notes: r.notes,
        status: r.actualQuantity >= r.targetQuantity ? 'completed' : 'in_progress',
        createdAt: new Date().toISOString(),
      })
    }
  }
  console.log('✅ Today\'s Production: records added')

  // ── 9. WORKERS ──────────────────────────────────────────────────────────
  const workerData = [
    { name: 'Arjun Kumar',    department: 'Assembly',  role: 'Senior Assembler',  status: 'present', shift: 'Morning',   productivity: 91, attendance: 97 },
    { name: 'Priya Nair',     department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 88, attendance: 95 },
    { name: 'Suresh Babu',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 85, attendance: 93 },
    { name: 'Divya Raj',      department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 94, attendance: 99 },
    { name: 'Ravi Shankar',   department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 76, attendance: 82 },
    { name: 'Meena Sundaram', department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 83, attendance: 90 },
    { name: 'Karthik Raj',    department: 'Assembly',  role: 'Junior Assembler',  status: 'present', shift: 'Morning',   productivity: 87, attendance: 94 },
    { name: 'Lakshmi Devi',   department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 90, attendance: 96 },
    { name: 'Venkat Raman',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 88, attendance: 92 },
    { name: 'Anbu Selvan',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 79, attendance: 88 },
    { name: 'Deepa Nair',     department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 86, attendance: 94 },
    { name: 'Mohan Raj',      department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 82, attendance: 87 },
    { name: 'Neha Shah',      department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 91, attendance: 96 },
    { name: 'Prakash Jha',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 84, attendance: 91 },
    { name: 'Geetha Rani',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 89, attendance: 95 },
    { name: 'Vikram Singh',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 87, attendance: 93 },
    { name: 'Anita Sharma',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 90, attendance: 97 },
    { name: 'Rajesh Khanna',  department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 78, attendance: 84 },
    { name: 'Sneha Patel',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 92, attendance: 96 },
    { name: 'Amit Verma',     department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 85, attendance: 90 },
    { name: 'Kavita Joshi',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 88, attendance: 94 },
    { name: 'Sunil Rao',      department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 83, attendance: 89 },
    { name: 'Pooja Singh',    department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 91, attendance: 95 },
    { name: 'Dinesh Kumar',   department: 'Assembly',  role: 'Assembler',         status: 'absent',  shift: 'Morning',   productivity: 80, attendance: 86 },
    { name: 'Ritu Agarwal',   department: 'Assembly',  role: 'Assembler',         status: 'present', shift: 'Morning',   productivity: 87, attendance: 93 },
  ]
  for (const w of workerData) {
    await adminDb.collection('workers').add({
      factoryId: FACTORY_ID,
      ...w,
      createdAt: new Date().toISOString(),
    })
  }

  // Machining department workers
  const machiningWorkers = [
    { name: 'Manoj Tiwari',   department: 'Machining', role: 'CNC Operator', status: 'present', shift: 'Morning', productivity: 92, attendance: 97 },
    { name: 'Shilpa Reddy',   department: 'Machining', role: 'CNC Operator', status: 'present', shift: 'Morning', productivity: 89, attendance: 95 },
    { name: 'Vijay M',        department: 'Machining', role: 'CNC Operator', status: 'present', shift: 'Morning', productivity: 86, attendance: 93 },
    { name: 'Anjali K',       department: 'Machining', role: 'CNC Operator', status: 'absent',  shift: 'Morning', productivity: 91, attendance: 94 },
    { name: 'Sandeep G',      department: 'Machining', role: 'CNC Operator', status: 'present', shift: 'Morning', productivity: 84, attendance: 91 },
  ]
  for (const w of machiningWorkers) {
    await adminDb.collection('workers').add({
      factoryId: FACTORY_ID,
      ...w,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Workers: 30 records')

  // ── 10. ENERGY ───────────────────────────────────────────────────────────
  for (let i = 0; i < 30; i++) {
    const hours = 8
    const kwh = 1200 + Math.floor(Math.random() * 400)
    const output = 150 + Math.floor(Math.random() * 80)
    await adminDb.collection('energy').add({
      factoryId: FACTORY_ID,
      date: fmt(daysAgo(i)),
      shift: i % 2 === 0 ? 'Morning' : 'Evening',
      machineCode: 'FACTORY',
      machineName: 'Factory Total',
      workingHours: hours,
      energyConsumptionKwh: kwh,
      energyCost: Math.round(kwh * 7.5),
      productionOutput: output,
      energyPerUnit: output > 0 ? (kwh / output).toFixed(2) : '0',
      peakDemandKw: 180 + Math.floor(Math.random() * 60),
      powerFactor: 0.88 + (Math.random() * 0.1),
      createdAt: daysAgo(i).toISOString(),
    })
  }
  console.log('✅ Energy: 30 records')

  // ── 11. NOTIFICATIONS ────────────────────────────────────────────────────
  const notifications = [
    {
      type: 'material',
      title: 'MATERIAL SHORTAGE',
      message: 'Wear Sensor stock is insufficient for Order ORD-2026-001. Required: 250, Available: 180, Shortage: 70',
      severity: 'critical',
      isRead: false,
    },
    {
      type: 'machine',
      title: 'MACHINE ALERT',
      message: 'CNC-04 has been unavailable for 45 minutes. Cutting Tool Failure - High Priority.',
      severity: 'critical',
      isRead: false,
    },
    {
      type: 'production',
      title: 'PRODUCTION ALERT',
      message: 'Morning shift production (98 units) is below target (125 units). Achievement: 78%',
      severity: 'warning',
      isRead: false,
    },
    {
      type: 'workforce',
      title: 'WORKFORCE ALERT',
      message: 'Assembly Department is operating below required staffing. Required: 25, Present: 19, Absent: 6',
      severity: 'warning',
      isRead: false,
    },
    {
      type: 'order',
      title: 'ORDER RISK',
      message: 'Order ORD-2026-001 (Apex Mobility Systems) may miss its planned completion time. Material constraint: Wear Sensor',
      severity: 'warning',
      isRead: false,
    },
    {
      type: 'info',
      title: 'Wear Sensor Reorder Needed',
      message: 'Current stock (180 units) is below reorder level. Lead time: 14 days. Please place order with SensoParts GmbH.',
      severity: 'warning',
      isRead: false,
    },
  ]
  for (const n of notifications) {
    await adminDb.collection('notifications').add({
      factoryId: FACTORY_ID,
      ...n,
      createdAt: new Date().toISOString(),
    })
  }
  console.log('✅ Notifications: 6 alerts')

  console.log('\n🎉 Demo data seeded successfully!')
  console.log(`   Factory: Prime Auto Components`)
  console.log(`   Product: Automotive Brake Assembly (${productId})`)
  console.log(`   Order:   ORD-2026-001 - 250 units`)
  console.log('')
  console.log('   Demo scenario:')
  console.log('   - Wear Sensor shortage (180 available, 250 required)')
  console.log('   - CNC-04 breakdown (45 min downtime)')
  console.log('   - Assembly workforce shortage (19/25 present)')
  console.log('   - Order ORD-2026-001: AT RISK')
  console.log('   - Max buildable: limited by Wear Sensor')
}

seed().catch(err => { console.error('\n❌ Seed failed:', err); process.exit(1) })
