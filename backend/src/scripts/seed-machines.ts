import { adminDb } from '../lib/firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

const FACTORY_ID = 'prime-auto-components-001'

const BRAKE_MACHINES = [
  { machineCode: 'BRK-CNC-01', machineName: 'Brake Disc CNC Lathe', department: 'Machining', status: 'RUNNING', healthScore: 92, utilization: 85 },
  { machineCode: 'BRK-CNC-02', machineName: 'Brake Pad Milling Center', department: 'Machining', status: 'RUNNING', healthScore: 88, utilization: 80 },
  { machineCode: 'BRK-PRS-01', machineName: 'Hydraulic Brake Press', department: 'Forging', status: 'RUNNING', healthScore: 85, utilization: 78 },
  { machineCode: 'BRK-GRN-01', machineName: 'Brake Disc Surface Grinder', department: 'Finishing', status: 'RUNNING', healthScore: 90, utilization: 82 },
  { machineCode: 'BRK-DRL-01', machineName: 'Caliper Drilling Machine', department: 'Drilling', status: 'RUNNING', healthScore: 87, utilization: 75 },
  { machineCode: 'BRK-ASSY-01', machineName: 'Brake Assembly Line #1', department: 'Assembly', status: 'RUNNING', healthScore: 91, utilization: 88 },
  { machineCode: 'BRK-ASSY-02', machineName: 'Brake Assembly Line #2', department: 'Assembly', status: 'RUNNING', healthScore: 86, utilization: 79 },
  { machineCode: 'BRK-TST-01', machineName: 'Brake Performance Tester', department: 'Quality', status: 'RUNNING', healthScore: 95, utilization: 70 },
  { machineCode: 'BRK-OVN-01', machineName: 'Brake Pad Curing Oven', department: 'Production', status: 'RUNNING', healthScore: 93, utilization: 90 },
  { machineCode: 'BRK-WLD-01', machineName: 'Caliper Welding Station', department: 'Fabrication', status: 'IDLE', healthScore: 78, utilization: 45 },
]

async function seedMachines() {
  console.log('Seeding 10 brake manufacturing machines...\n')

  const existing = await adminDb.collection('machines')
    .where('factoryId', '==', FACTORY_ID)
    .get()

  if (!existing.empty) {
    console.log(`Found ${existing.size} existing machines. Deleting...`)
    const batch = adminDb.batch()
    existing.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  for (const m of BRAKE_MACHINES) {
    await adminDb.collection('machines').add({
      factoryId: FACTORY_ID,
      ...m,
      lastMaintained: new Date().toISOString(),
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    })
    console.log(`  ✅ ${m.machineCode} - ${m.machineName}`)
  }

  console.log(`\n✅ ${BRAKE_MACHINES.length} brake machines seeded successfully!`)
  process.exit(0)
}

seedMachines().catch((err) => {
  console.error('Failed to seed machines:', err)
  process.exit(1)
})
