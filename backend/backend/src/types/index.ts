export type UserRole =
  | 'factory_owner'
  | 'production_manager'
  | 'maintenance_engineer'
  | 'inventory_manager'
  | 'worker'
  | 'admin';

export interface Factory {
  id: string;
  name: string;
  location: string;
  industry: string;
  established: number;
  totalArea: number;
  employeeCount: number;
  shiftCount: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'offline';
  healthScore: number;
  utilization: number;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  energyConsumption: number;
  productionRate: number;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  attendance: 'present' | 'absent' | 'leave';
  performance: number;
  skills: string[];
  overtime: number;
  productivity: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  completed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  machineId: string;
  startDate: string;
  dueDate: string;
  customerId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'raw_material' | 'finished_goods' | 'spare_parts';
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  unitCost: number;
  lastRestocked: string;
  abcClass: 'A' | 'B' | 'C';
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  type: 'preventive' | 'corrective' | 'predictive';
  status: 'scheduled' | 'in_progress' | 'completed';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  technician: string;
  downtime: number;
}

export interface EnergyRecord {
  id: string;
  date: string;
  totalConsumption: number;
  peakConsumption: number;
  cost: number;
  machineBreakdown: { machineId: string; consumption: number }[];
  carbonFootprint: number;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  totalOrders: number;
  revenue: number;
  profit: number;
  lastOrder: string;
  rating: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: string;
  deliveryDate: string;
}

export interface Notification {
  id: string;
  type: 'inventory' | 'maintenance' | 'machine' | 'energy' | 'order' | 'attendance';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  unit?: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: string; metadata?: Record<string, unknown> }[];
  createdAt: string;
}
