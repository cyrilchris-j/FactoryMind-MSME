import { adminDb } from '../lib/firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

async function seedDatabase() {
  const factoryId = 'demo-factory-123'; // Standard test factory ID

  const machines = [
    { factoryId, machineCode: 'CNC-001', status: 'RUNNING', healthScore: 95 },
    { factoryId, machineCode: 'Milling-02', status: 'MAINTENANCE', healthScore: 60 }
  ];

  console.log('🌱 Seeding machines...');
  for (const machine of machines) {
    await adminDb.collection('machines').add(machine);
  }
  
  console.log('✅ Seeding complete!');
}

seedDatabase().catch(console.error);
