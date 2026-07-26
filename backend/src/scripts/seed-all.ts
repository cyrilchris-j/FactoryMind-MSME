/**
 * Seed script – adds realistic demo data for factoryId = 'factory-cyril-001'
 * Run: npx tsx src/scripts/seed-all.ts
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

initializeApp({ projectId: 'factorymind-msme' });
const db = getFirestore();

const FACTORY_ID = 'factory-cyril-001';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

async function seed() {
  console.log('🌱 Seeding Firestore for factory:', FACTORY_ID);

  // ── 1. FACTORY ────────────────────────────────────────────────────────────
  await db.collection('factories').doc(FACTORY_ID).set({
    factoryId: FACTORY_ID,
    name: "Cyril's Precision Forgings",
    location: 'Chennai, Tamil Nadu',
    industry: 'Manufacturing',
    employees: 120,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  });
  console.log('✅ Factory');

  // ── 2. MACHINES ───────────────────────────────────────────────────────────
  const machines = [
    { machineCode: 'CNC-001', machineName: 'CNC Lathe #1',       department: 'Machining',    status: 'RUNNING',     healthScore: 92, utilization: 88 },
    { machineCode: 'CNC-002', machineName: 'CNC Lathe #2',       department: 'Machining',    status: 'RUNNING',     healthScore: 87, utilization: 82 },
    { machineCode: 'MILL-01', machineName: 'Milling Machine #1', department: 'Machining',    status: 'RUNNING',     healthScore: 78, utilization: 74 },
    { machineCode: 'MILL-02', machineName: 'Milling Machine #2', department: 'Machining',    status: 'MAINTENANCE', healthScore: 45, utilization: 0  },
    { machineCode: 'GRND-01', machineName: 'Surface Grinder',    department: 'Finishing',    status: 'RUNNING',     healthScore: 95, utilization: 91 },
    { machineCode: 'DRLL-01', machineName: 'Drill Press #1',     department: 'Assembly',     status: 'RUNNING',     healthScore: 88, utilization: 79 },
    { machineCode: 'WELD-01', machineName: 'Welding Station #1', department: 'Fabrication',  status: 'IDLE',        healthScore: 72, utilization: 35 },
    { machineCode: 'PRES-01', machineName: 'Hydraulic Press',    department: 'Forging',      status: 'RUNNING',     healthScore: 81, utilization: 68 },
    { machineCode: 'LATHE-01',machineName: 'Manual Lathe #1',    department: 'Machining',    status: 'RUNNING',     healthScore: 69, utilization: 61 },
    { machineCode: 'INSP-01', machineName: 'CMM Inspection',     department: 'Quality',      status: 'RUNNING',     healthScore: 98, utilization: 55 },
  ];
  for (const m of machines) {
    await db.collection('machines').add({ factoryId: FACTORY_ID, ...m, lastMaintained: daysAgo(15).toISOString(), createdAt: new Date().toISOString() });
  }
  console.log('✅ Machines:', machines.length);

  // ── 3. WORKERS ────────────────────────────────────────────────────────────
  const workers = [
    { name: 'Arjun Kumar',      department: 'Machining',   role: 'Senior Operator',  status: 'present', shift: 'A', productivity: 91, attendance: 97 },
    { name: 'Priya Nair',       department: 'Machining',   role: 'CNC Operator',     status: 'present', shift: 'A', productivity: 88, attendance: 95 },
    { name: 'Suresh Babu',      department: 'Finishing',   role: 'Grinder',          status: 'present', shift: 'A', productivity: 85, attendance: 93 },
    { name: 'Divya Raj',        department: 'Quality',     role: 'QC Inspector',     status: 'present', shift: 'A', productivity: 94, attendance: 99 },
    { name: 'Ravi Shankar',     department: 'Fabrication', role: 'Welder',           status: 'absent',  shift: 'A', productivity: 76, attendance: 82 },
    { name: 'Meena Sundaram',   department: 'Assembly',    role: 'Assembler',        status: 'present', shift: 'B', productivity: 83, attendance: 90 },
    { name: 'Karthik Raj',      department: 'Forging',     role: 'Press Operator',   status: 'present', shift: 'B', productivity: 87, attendance: 94 },
    { name: 'Lakshmi Devi',     department: 'Machining',   role: 'Tool Setter',      status: 'present', shift: 'B', productivity: 90, attendance: 96 },
    { name: 'Venkat Raman',     department: 'Maintenance', role: 'Technician',       status: 'present', shift: 'A', productivity: 88, attendance: 92 },
    { name: 'Anbu Selvan',      department: 'Finishing',   role: 'Painter',          status: 'present', shift: 'C', productivity: 79, attendance: 88 },
  ];
  for (const w of workers) {
    await db.collection('workers').add({ factoryId: FACTORY_ID, ...w, createdAt: new Date().toISOString() });
  }
  console.log('✅ Workers:', workers.length);

  // ── 4. PRODUCTION ─────────────────────────────────────────────────────────
  const products = ['Forged Flange', 'Precision Shaft', 'Gear Housing', 'Valve Body', 'Bracket Assembly'];
  const mcodes   = ['CNC-001', 'CNC-002', 'MILL-01', 'PRES-01', 'LATHE-01'];
  const shifts   = ['A', 'B', 'C'];
  for (let i = 0; i < 60; i++) {
    const target = 400 + Math.floor(Math.random() * 200);
    const actual = Math.floor(target * (0.75 + Math.random() * 0.3));
    await db.collection('production').add({
      factoryId: FACTORY_ID,
      departmentId: '',
      date: fmt(daysAgo(i % 30)),
      shift: shifts[i % 3],
      machineCode: mcodes[i % 5],
      productName: products[i % 5],
      targetQuantity: target,
      actualQuantity: actual,
      rejectedQuantity: Math.floor(actual * 0.02),
      downtimeMinutes: Math.floor(Math.random() * 40),
      notes: '',
      status: actual >= target ? 'completed' : i % 7 === 0 ? 'delayed' : 'in_progress',
      createdAt: daysAgo(i % 30).toISOString(),
    });
  }
  console.log('✅ Production: 60 records');

  // ── 5. INVENTORY ──────────────────────────────────────────────────────────
  const inventory = [
    { itemCode: 'RM-001', itemName: 'Steel Billets (EN8)',     category: 'raw_material',  unit: 'kg',  currentStock: 2400, minimumStock: 500,  unitCost: 85,  abcClass: 'A' },
    { itemCode: 'RM-002', itemName: 'Aluminium Alloy 6061',    category: 'raw_material',  unit: 'kg',  currentStock: 320,  minimumStock: 400,  unitCost: 220, abcClass: 'A' },
    { itemCode: 'RM-003', itemName: 'Stainless Steel 304',     category: 'raw_material',  unit: 'kg',  currentStock: 780,  minimumStock: 300,  unitCost: 310, abcClass: 'A' },
    { itemCode: 'SP-001', itemName: 'Carbide Insert Set',      category: 'spare_part',    unit: 'pcs', currentStock: 45,   minimumStock: 20,   unitCost: 850, abcClass: 'B' },
    { itemCode: 'SP-002', itemName: 'Hydraulic Seals Kit',     category: 'spare_part',    unit: 'set', currentStock: 8,    minimumStock: 5,    unitCost: 1200,abcClass: 'B' },
    { itemCode: 'FG-001', itemName: 'Forged Flange DN50',      category: 'finished_good', unit: 'pcs', currentStock: 340,  minimumStock: 100,  unitCost: 680, abcClass: 'A' },
    { itemCode: 'FG-002', itemName: 'Precision Shaft 40mm',    category: 'finished_good', unit: 'pcs', currentStock: 120,  minimumStock: 50,   unitCost: 950, abcClass: 'B' },
    { itemCode: 'FG-003', itemName: 'Gear Housing Assembly',   category: 'finished_good', unit: 'pcs', currentStock: 65,   minimumStock: 30,   unitCost: 2100,abcClass: 'A' },
    { itemCode: 'CN-001', itemName: 'Cutting Oil (20L)',        category: 'consumable',    unit: 'can', currentStock: 22,   minimumStock: 10,   unitCost: 480, abcClass: 'C' },
    { itemCode: 'CN-002', itemName: 'Welding Electrodes (5kg)','category': 'consumable',  unit: 'box', currentStock: 15,   minimumStock: 8,    unitCost: 350, abcClass: 'C' },
  ];
  for (const inv of inventory) {
    await db.collection('inventory').add({
      factoryId: FACTORY_ID,
      ...inv,
      lastRestocked: daysAgo(Math.floor(Math.random() * 20)).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  console.log('✅ Inventory:', inventory.length);

  // ── 6. MAINTENANCE ────────────────────────────────────────────────────────
  const maintenanceItems = [
    { machineCode: 'MILL-02', type: 'corrective',  status: 'in_progress', priority: 'high',   description: 'Spindle bearing failure', downtimeMinutes: 480 },
    { machineCode: 'CNC-001', type: 'preventive',  status: 'scheduled',   priority: 'medium', description: 'Quarterly oil change & inspection', downtimeMinutes: 120 },
    { machineCode: 'PRES-01', type: 'preventive',  status: 'completed',   priority: 'low',    description: 'Hydraulic fluid replacement', downtimeMinutes: 90 },
    { machineCode: 'WELD-01', type: 'corrective',  status: 'completed',   priority: 'high',   description: 'Electrode tip replacement', downtimeMinutes: 60 },
    { machineCode: 'GRND-01', type: 'preventive',  status: 'scheduled',   priority: 'medium', description: 'Wheel dressing & alignment', downtimeMinutes: 150 },
    { machineCode: 'CNC-002', type: 'predictive',  status: 'scheduled',   priority: 'medium', description: 'Vibration analysis - bearing wear detected', downtimeMinutes: 0 },
  ];
  for (const m of maintenanceItems) {
    await db.collection('maintenance').add({
      factoryId: FACTORY_ID,
      ...m,
      reportedDate: daysAgo(Math.floor(Math.random() * 10)).toISOString(),
      scheduledDate: daysAgo(-Math.floor(Math.random() * 5)).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  console.log('✅ Maintenance:', maintenanceItems.length);

  // ── 7. ENERGY ─────────────────────────────────────────────────────────────
  for (let i = 0; i < 30; i++) {
    const kwh = 1800 + Math.floor(Math.random() * 600);
    await db.collection('energy').add({
      factoryId: FACTORY_ID,
      date: fmt(daysAgo(i)),
      energyConsumptionKwh: kwh,
      energyCost: Math.round(kwh * 8.5),
      peakDemandKw: 180 + Math.floor(Math.random() * 60),
      solarGenerationKwh: 120 + Math.floor(Math.random() * 80),
      createdAt: daysAgo(i).toISOString(),
    });
  }
  console.log('✅ Energy: 30 records');

  // ── 8. SALES ──────────────────────────────────────────────────────────────
  const customers = ['Ashok Leyland', 'TVS Motors', 'Sundram Fasteners', 'BHEL Chennai', 'L&T Heavy Eng.'];
  const prods     = ['Forged Flange DN50', 'Precision Shaft 40mm', 'Gear Housing', 'Valve Body 2"', 'Custom Bracket'];
  for (let i = 0; i < 25; i++) {
    const qty = 10 + Math.floor(Math.random() * 90);
    const unitPrice = 500 + Math.floor(Math.random() * 2000);
    await db.collection('sales').add({
      factoryId: FACTORY_ID,
      orderNumber: `ORD-2026-${String(1000 + i).padStart(4, '0')}`,
      customer: customers[i % 5],
      productName: prods[i % 5],
      quantity: qty,
      unitPrice,
      orderValue: qty * unitPrice,
      orderDate: fmt(daysAgo(i * 3)),
      deliveryDate: fmt(daysAgo(i * 3 - 7)),
      status: i < 5 ? 'pending' : i < 15 ? 'delivered' : 'processing',
      createdAt: daysAgo(i * 3).toISOString(),
    });
  }
  console.log('✅ Sales: 25 orders');

  // ── 9. NOTIFICATIONS ──────────────────────────────────────────────────────
  const notifications = [
    { type: 'alert',   title: 'Machine Down: MILL-02',           message: 'Spindle bearing failure — maintenance team notified.', isRead: false, priority: 'high'   },
    { type: 'warning', title: 'Low Stock: Aluminium Alloy 6061', message: 'Stock (320 kg) is below minimum (400 kg). Reorder now.', isRead: false, priority: 'high'  },
    { type: 'info',    title: 'Production Target Met',           message: 'Shift A exceeded daily target by 8%. Great work!',      isRead: false, priority: 'low'   },
    { type: 'warning', title: 'High Energy Usage Detected',      message: 'Energy consumption is 18% above average today.',        isRead: true,  priority: 'medium' },
    { type: 'info',    title: 'Maintenance Scheduled: CNC-001',  message: 'Quarterly maintenance scheduled for tomorrow 6 AM.',    isRead: true,  priority: 'low'   },
  ];
  for (const n of notifications) {
    await db.collection('notifications').add({
      factoryId: FACTORY_ID,
      ...n,
      createdAt: daysAgo(Math.floor(Math.random() * 3)).toISOString(),
    });
  }
  console.log('✅ Notifications:', notifications.length);

  console.log('\n🎉 All data seeded successfully for factory:', FACTORY_ID);
}

seed().catch(console.error);
