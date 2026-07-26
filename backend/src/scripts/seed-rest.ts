/**
 * Seed script using Firebase REST API (no service account needed)
 * Run: npx tsx src/scripts/seed-rest.ts
 */
import dotenv from 'dotenv';
dotenv.config();

const PROJECT_ID = 'factorymind-msme';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyDZhKmQiv5IuwNpIQZFpls_pVuxZCBo0J4';
const FACTORY_ID = 'factory-cyril-001';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const iso = (d: Date) => d.toISOString();

// ── Firebase REST helpers ──────────────────────────────────────────────────
function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields: any = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj: Record<string, any>) {
  const fields: any = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

async function addDoc(collection: string, data: Record<string, any>) {
  const url = `${BASE}/${collection}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toFirestoreDoc(data)),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to add to ${collection}: ${err}`);
  }
  return res.json();
}

async function setDoc(collection: string, docId: string, data: Record<string, any>) {
  const url = `${BASE}/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toFirestoreDoc(data)),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to set ${collection}/${docId}: ${err}`);
  }
  return res.json();
}

// ── SEED DATA ──────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding Firestore via REST API for factory:', FACTORY_ID, '\n');

  // 1. FACTORY
  await setDoc('factories', FACTORY_ID, {
    factoryId: FACTORY_ID,
    name: "Cyril's Precision Forgings",
    location: 'Chennai, Tamil Nadu',
    industry: 'Manufacturing',
    employees: 120,
    status: 'ACTIVE',
    createdAt: iso(today),
  });
  console.log('✅ Factory created');

  // 2. MACHINES
  const machines = [
    { machineCode: 'CNC-001',  machineName: 'CNC Lathe #1',         department: 'Machining',   status: 'RUNNING',     healthScore: 92, utilization: 88 },
    { machineCode: 'CNC-002',  machineName: 'CNC Lathe #2',         department: 'Machining',   status: 'RUNNING',     healthScore: 87, utilization: 82 },
    { machineCode: 'MILL-01',  machineName: 'Milling Machine #1',   department: 'Machining',   status: 'RUNNING',     healthScore: 78, utilization: 74 },
    { machineCode: 'MILL-02',  machineName: 'Milling Machine #2',   department: 'Machining',   status: 'MAINTENANCE', healthScore: 45, utilization: 0  },
    { machineCode: 'GRND-01',  machineName: 'Surface Grinder',      department: 'Finishing',   status: 'RUNNING',     healthScore: 95, utilization: 91 },
    { machineCode: 'DRLL-01',  machineName: 'Drill Press #1',       department: 'Assembly',    status: 'RUNNING',     healthScore: 88, utilization: 79 },
    { machineCode: 'WELD-01',  machineName: 'Welding Station #1',   department: 'Fabrication', status: 'IDLE',        healthScore: 72, utilization: 35 },
    { machineCode: 'PRES-01',  machineName: 'Hydraulic Press',      department: 'Forging',     status: 'RUNNING',     healthScore: 81, utilization: 68 },
    { machineCode: 'LATHE-01', machineName: 'Manual Lathe #1',      department: 'Machining',   status: 'RUNNING',     healthScore: 69, utilization: 61 },
    { machineCode: 'INSP-01',  machineName: 'CMM Inspection',       department: 'Quality',     status: 'RUNNING',     healthScore: 98, utilization: 55 },
  ];
  for (const m of machines) {
    await addDoc('machines', { factoryId: FACTORY_ID, ...m, lastMaintained: iso(daysAgo(15)), createdAt: iso(today) });
  }
  console.log('✅ Machines: 10');

  // 3. WORKERS
  const workers = [
    { name: 'Arjun Kumar',    department: 'Machining',   role: 'Senior Operator', status: 'present', shift: 'A', productivity: 91, attendance: 97 },
    { name: 'Priya Nair',     department: 'Machining',   role: 'CNC Operator',    status: 'present', shift: 'A', productivity: 88, attendance: 95 },
    { name: 'Suresh Babu',    department: 'Finishing',   role: 'Grinder',         status: 'present', shift: 'A', productivity: 85, attendance: 93 },
    { name: 'Divya Raj',      department: 'Quality',     role: 'QC Inspector',    status: 'present', shift: 'A', productivity: 94, attendance: 99 },
    { name: 'Ravi Shankar',   department: 'Fabrication', role: 'Welder',          status: 'absent',  shift: 'A', productivity: 76, attendance: 82 },
    { name: 'Meena Sundaram', department: 'Assembly',    role: 'Assembler',       status: 'present', shift: 'B', productivity: 83, attendance: 90 },
    { name: 'Karthik Raj',    department: 'Forging',     role: 'Press Operator',  status: 'present', shift: 'B', productivity: 87, attendance: 94 },
    { name: 'Lakshmi Devi',   department: 'Machining',   role: 'Tool Setter',     status: 'present', shift: 'B', productivity: 90, attendance: 96 },
    { name: 'Venkat Raman',   department: 'Maintenance', role: 'Technician',      status: 'present', shift: 'A', productivity: 88, attendance: 92 },
    { name: 'Anbu Selvan',    department: 'Finishing',   role: 'Painter',         status: 'present', shift: 'C', productivity: 79, attendance: 88 },
  ];
  for (const w of workers) {
    await addDoc('workers', { factoryId: FACTORY_ID, ...w, createdAt: iso(today) });
  }
  console.log('✅ Workers: 10');

  // 4. PRODUCTION
  const products = ['Forged Flange', 'Precision Shaft', 'Gear Housing', 'Valve Body', 'Bracket Assembly'];
  const mcodes   = ['CNC-001', 'CNC-002', 'MILL-01', 'PRES-01', 'LATHE-01'];
  const shifts   = ['A', 'B', 'C'];
  for (let i = 0; i < 60; i++) {
    const target = 400 + Math.floor(Math.random() * 200);
    const actual = Math.floor(target * (0.75 + Math.random() * 0.3));
    await addDoc('production', {
      factoryId: FACTORY_ID, departmentId: '',
      date: fmt(daysAgo(i % 30)), shift: shifts[i % 3],
      machineCode: mcodes[i % 5], productName: products[i % 5],
      targetQuantity: target, actualQuantity: actual,
      rejectedQuantity: Math.floor(actual * 0.02),
      downtimeMinutes: Math.floor(Math.random() * 40),
      notes: '',
      status: actual >= target ? 'completed' : i % 7 === 0 ? 'delayed' : 'in_progress',
      createdAt: iso(daysAgo(i % 30)),
    });
  }
  console.log('✅ Production: 60 records');

  // 5. INVENTORY
  const inventory = [
    { itemCode: 'RM-001', itemName: 'Steel Billets (EN8)',      category: 'raw_material',  unit: 'kg',  currentStock: 2400, minimumStock: 500,  unitCost: 85,   abcClass: 'A' },
    { itemCode: 'RM-002', itemName: 'Aluminium Alloy 6061',     category: 'raw_material',  unit: 'kg',  currentStock: 320,  minimumStock: 400,  unitCost: 220,  abcClass: 'A' },
    { itemCode: 'RM-003', itemName: 'Stainless Steel 304',      category: 'raw_material',  unit: 'kg',  currentStock: 780,  minimumStock: 300,  unitCost: 310,  abcClass: 'A' },
    { itemCode: 'SP-001', itemName: 'Carbide Insert Set',       category: 'spare_part',    unit: 'pcs', currentStock: 45,   minimumStock: 20,   unitCost: 850,  abcClass: 'B' },
    { itemCode: 'SP-002', itemName: 'Hydraulic Seals Kit',      category: 'spare_part',    unit: 'set', currentStock: 8,    minimumStock: 5,    unitCost: 1200, abcClass: 'B' },
    { itemCode: 'FG-001', itemName: 'Forged Flange DN50',       category: 'finished_good', unit: 'pcs', currentStock: 340,  minimumStock: 100,  unitCost: 680,  abcClass: 'A' },
    { itemCode: 'FG-002', itemName: 'Precision Shaft 40mm',     category: 'finished_good', unit: 'pcs', currentStock: 120,  minimumStock: 50,   unitCost: 950,  abcClass: 'B' },
    { itemCode: 'FG-003', itemName: 'Gear Housing Assembly',    category: 'finished_good', unit: 'pcs', currentStock: 65,   minimumStock: 30,   unitCost: 2100, abcClass: 'A' },
    { itemCode: 'CN-001', itemName: 'Cutting Oil (20L)',         category: 'consumable',    unit: 'can', currentStock: 22,   minimumStock: 10,   unitCost: 480,  abcClass: 'C' },
    { itemCode: 'CN-002', itemName: 'Welding Electrodes (5kg)', category: 'consumable',    unit: 'box', currentStock: 15,   minimumStock: 8,    unitCost: 350,  abcClass: 'C' },
  ];
  for (const inv of inventory) {
    await addDoc('inventory', { factoryId: FACTORY_ID, ...inv, lastRestocked: iso(daysAgo(Math.floor(Math.random() * 20))), createdAt: iso(today) });
  }
  console.log('✅ Inventory: 10 items');

  // 6. MAINTENANCE
  const maint = [
    { machineCode: 'MILL-02', type: 'corrective', status: 'in_progress', priority: 'high',   description: 'Spindle bearing failure', downtimeMinutes: 480 },
    { machineCode: 'CNC-001', type: 'preventive', status: 'scheduled',   priority: 'medium', description: 'Quarterly oil change & inspection', downtimeMinutes: 120 },
    { machineCode: 'PRES-01', type: 'preventive', status: 'completed',   priority: 'low',    description: 'Hydraulic fluid replacement', downtimeMinutes: 90  },
    { machineCode: 'WELD-01', type: 'corrective', status: 'completed',   priority: 'high',   description: 'Electrode tip replacement', downtimeMinutes: 60  },
    { machineCode: 'GRND-01', type: 'preventive', status: 'scheduled',   priority: 'medium', description: 'Wheel dressing & alignment', downtimeMinutes: 150 },
    { machineCode: 'CNC-002', type: 'predictive', status: 'scheduled',   priority: 'medium', description: 'Vibration analysis - bearing wear detected', downtimeMinutes: 0 },
  ];
  for (const m of maint) {
    await addDoc('maintenance', { factoryId: FACTORY_ID, ...m, reportedDate: iso(daysAgo(Math.floor(Math.random() * 10))), scheduledDate: iso(daysAgo(-Math.floor(Math.random() * 5))), createdAt: iso(today) });
  }
  console.log('✅ Maintenance: 6 records');

  // 7. ENERGY
  for (let i = 0; i < 30; i++) {
    const kwh = 1800 + Math.floor(Math.random() * 600);
    await addDoc('energy', {
      factoryId: FACTORY_ID,
      date: fmt(daysAgo(i)),
      energyConsumptionKwh: kwh,
      energyCost: Math.round(kwh * 8.5),
      peakDemandKw: 180 + Math.floor(Math.random() * 60),
      solarGenerationKwh: 120 + Math.floor(Math.random() * 80),
      createdAt: iso(daysAgo(i)),
    });
  }
  console.log('✅ Energy: 30 records');

  // 8. SALES
  const customers = ['Ashok Leyland', 'TVS Motors', 'Sundram Fasteners', 'BHEL Chennai', 'L&T Heavy Eng.'];
  const salesProds = ['Forged Flange DN50', 'Precision Shaft 40mm', 'Gear Housing', 'Valve Body 2"', 'Custom Bracket'];
  for (let i = 0; i < 25; i++) {
    const qty = 10 + Math.floor(Math.random() * 90);
    const unitPrice = 500 + Math.floor(Math.random() * 2000);
    await addDoc('sales', {
      factoryId: FACTORY_ID,
      orderNumber: `ORD-2026-${String(1000 + i).padStart(4, '0')}`,
      customer: customers[i % 5],
      productName: salesProds[i % 5],
      quantity: qty, unitPrice, orderValue: qty * unitPrice,
      orderDate: fmt(daysAgo(i * 3)),
      deliveryDate: fmt(daysAgo(i * 3 - 7)),
      status: i < 5 ? 'pending' : i < 15 ? 'delivered' : 'processing',
      createdAt: iso(daysAgo(i * 3)),
    });
  }
  console.log('✅ Sales: 25 orders');

  // 9. NOTIFICATIONS
  const notifs = [
    { type: 'alert',   title: 'Machine Down: MILL-02',           message: 'Spindle bearing failure — maintenance team notified.', isRead: false, priority: 'high'   },
    { type: 'warning', title: 'Low Stock: Aluminium Alloy 6061', message: 'Stock (320 kg) is below minimum (400 kg). Reorder now.', isRead: false, priority: 'high'  },
    { type: 'info',    title: 'Production Target Met',           message: 'Shift A exceeded daily target by 8%. Great work!',      isRead: false, priority: 'low'   },
    { type: 'warning', title: 'High Energy Usage Detected',      message: 'Energy consumption is 18% above average today.',        isRead: true,  priority: 'medium' },
    { type: 'info',    title: 'Maintenance Scheduled: CNC-001',  message: 'Quarterly maintenance scheduled for tomorrow 6 AM.',    isRead: true,  priority: 'low'   },
  ];
  for (const n of notifs) {
    await addDoc('notifications', { factoryId: FACTORY_ID, ...n, createdAt: iso(daysAgo(Math.floor(Math.random() * 3))) });
  }
  console.log('✅ Notifications: 5');

  console.log('\n🎉 All data seeded! Refresh your dashboard now.');
}

seed().catch(err => { console.error('\n❌ Seed failed:', err.message); process.exit(1); });
