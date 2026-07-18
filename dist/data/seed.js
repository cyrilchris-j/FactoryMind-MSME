"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.futureModules = exports.demoUsers = exports.notifications = exports.salesOrders = exports.energyRecords = exports.maintenanceRecords = exports.inventory = exports.productionOrders = exports.customers = exports.workers = exports.machines = exports.factory = void 0;
exports.getDashboardKPIs = getDashboardKPIs;
exports.getHeroMetrics = getHeroMetrics;
exports.getAnalyticsData = getAnalyticsData;
const MACHINE_TYPES = ['CNC Lathe', 'Milling Machine', 'Injection Molding', 'Press Brake', 'Welding Robot', 'Assembly Line', 'Packaging Unit', 'Quality Scanner', 'Conveyor System', 'Grinding Machine'];
const LOCATIONS = ['Bay A', 'Bay B', 'Bay C', 'Bay D', 'Bay E'];
const STATUSES = ['running', 'running', 'running', 'idle', 'maintenance', 'offline'];
const FIRST_NAMES = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Meera', 'Arun', 'Kavita', 'Ravi', 'Deepa', 'Manoj', 'Lakshmi', 'Ganesh', 'Pooja', 'Karthik', 'Divya', 'Sanjay', 'Nisha'];
const LAST_NAMES = ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Nair', 'Gupta', 'Iyer', 'Menon', 'Das', 'Rao', 'Joshi', 'Verma', 'Pillai', 'Chopra'];
const DEPARTMENTS = ['Production', 'Assembly', 'Quality', 'Maintenance', 'Packaging', 'Warehouse'];
const PRODUCTS = ['Steel Bracket A-100', 'Aluminum Housing B-200', 'Precision Gear C-300', 'Motor Mount D-400', 'Control Panel E-500', 'Hydraulic Valve F-600', 'Bearing Assembly G-700', 'Shaft Component H-800'];
const CUSTOMER_NAMES = ['Tata Motors', 'Mahindra & Mahindra', 'Bharat Forge', 'L&T Defence', 'Godrej Industries', 'Bosch India', 'Siemens India', 'ABB India', 'Schneider Electric', 'Honeywell', 'Maruti Suzuki', 'Ashok Leyland', 'TVS Motors', 'Bajaj Auto', 'Hero MotoCorp'];
const RAW_MATERIALS = ['Mild Steel Sheet', 'Aluminum Alloy 6061', 'Stainless Steel 304', 'Copper Wire', 'Hydraulic Oil', 'Cutting Fluid', 'Welding Electrodes', 'Rubber Gaskets', 'Ball Bearings', 'Hydraulic Seals'];
const SUPPLIERS = ['Steel Corp India', 'MetalWorks Ltd', 'Precision Parts Co', 'Industrial Supply Hub', 'Global Metals Inc', 'Tech Components Pvt Ltd'];
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
}
function generateSparkline(length = 7) {
    const base = randomBetween(60, 90);
    return Array.from({ length }, (_, i) => base + randomBetween(-10, 10) + i * randomBetween(-1, 2));
}
exports.factory = {
    id: 'factory-001',
    name: 'Kumar Precision Engineering',
    location: 'Pune, Maharashtra, India',
    industry: 'Precision Manufacturing',
    established: 1998,
    totalArea: 45000,
    employeeCount: 100,
    shiftCount: 3,
};
exports.machines = Array.from({ length: 50 }, (_, i) => {
    const status = STATUSES[i % STATUSES.length];
    return {
        id: `MCH-${String(i + 1).padStart(3, '0')}`,
        name: `${MACHINE_TYPES[i % MACHINE_TYPES.length]} #${i + 1}`,
        type: MACHINE_TYPES[i % MACHINE_TYPES.length],
        status,
        healthScore: status === 'maintenance' ? randomBetween(40, 65) : randomBetween(65, 98),
        utilization: status === 'running' ? randomBetween(55, 95) : status === 'idle' ? randomBetween(10, 30) : 0,
        lastMaintenance: randomDate(new Date('2025-01-01'), new Date('2026-06-01')),
        nextMaintenance: randomDate(new Date('2026-07-01'), new Date('2026-12-31')),
        location: LOCATIONS[i % LOCATIONS.length],
        energyConsumption: randomBetween(15, 85),
        productionRate: randomBetween(50, 200),
    };
});
exports.workers = Array.from({ length: 100 }, (_, i) => ({
    id: `WRK-${String(i + 1).padStart(3, '0')}`,
    name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
    role: i < 5 ? 'Supervisor' : i < 15 ? 'Technician' : 'Operator',
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    shift: ['morning', 'afternoon', 'night'][i % 3],
    attendance: Math.random() > 0.08 ? 'present' : Math.random() > 0.5 ? 'absent' : 'leave',
    performance: randomBetween(65, 98),
    skills: ['CNC Operation', 'Quality Control', 'Assembly', 'Welding', 'Maintenance'].slice(0, randomBetween(1, 3)),
    overtime: randomBetween(0, 12),
    productivity: randomBetween(70, 99),
}));
exports.customers = CUSTOMER_NAMES.map((name, i) => ({
    id: `CUST-${String(i + 1).padStart(3, '0')}`,
    name,
    industry: ['Automotive', 'Defence', 'Industrial', 'Electronics', 'Aerospace'][i % 5],
    totalOrders: randomBetween(15, 80),
    revenue: randomBetween(500000, 5000000),
    profit: randomBetween(50000, 800000),
    lastOrder: randomDate(new Date('2025-06-01'), new Date('2026-07-01')),
    rating: randomBetween(3, 5),
}));
exports.productionOrders = Array.from({ length: 500 }, (_, i) => {
    const qty = randomBetween(100, 5000);
    const completed = randomBetween(0, qty);
    const status = completed === qty ? 'completed' : completed === 0 ? 'pending' : Math.random() > 0.85 ? 'delayed' : 'in_progress';
    return {
        id: `PO-${String(i + 1).padStart(4, '0')}`,
        orderNumber: `PRD-2026-${String(i + 1).padStart(4, '0')}`,
        product: PRODUCTS[i % PRODUCTS.length],
        quantity: qty,
        completed,
        status,
        priority: ['low', 'medium', 'high', 'critical'][randomBetween(0, 3)],
        machineId: exports.machines[i % exports.machines.length].id,
        startDate: randomDate(new Date('2025-01-01'), new Date('2026-06-01')),
        dueDate: randomDate(new Date('2026-07-01'), new Date('2026-12-31')),
        customerId: exports.customers[i % exports.customers.length].id,
    };
});
exports.inventory = [
    ...RAW_MATERIALS.map((name, i) => ({
        id: `INV-RM-${String(i + 1).padStart(3, '0')}`,
        name,
        category: 'raw_material',
        quantity: randomBetween(50, 5000),
        unit: ['kg', 'liters', 'units', 'meters'][i % 4],
        reorderLevel: randomBetween(100, 500),
        supplier: SUPPLIERS[i % SUPPLIERS.length],
        unitCost: randomBetween(50, 5000),
        lastRestocked: randomDate(new Date('2025-06-01'), new Date('2026-07-01')),
        abcClass: ['A', 'B', 'C'][i % 3],
    })),
    ...PRODUCTS.map((name, i) => ({
        id: `INV-FG-${String(i + 1).padStart(3, '0')}`,
        name,
        category: 'finished_goods',
        quantity: randomBetween(20, 2000),
        unit: 'units',
        reorderLevel: randomBetween(50, 200),
        supplier: 'Internal Production',
        unitCost: randomBetween(500, 15000),
        lastRestocked: randomDate(new Date('2025-06-01'), new Date('2026-07-01')),
        abcClass: ['A', 'B', 'C'][i % 3],
    })),
];
exports.maintenanceRecords = Array.from({ length: 120 }, (_, i) => ({
    id: `MNT-${String(i + 1).padStart(4, '0')}`,
    machineId: exports.machines[i % exports.machines.length].id,
    type: ['preventive', 'corrective', 'predictive'][i % 3],
    status: ['scheduled', 'in_progress', 'completed'][i % 3],
    description: ['Bearing replacement', 'Oil change & calibration', 'Belt tension adjustment', 'Motor inspection', 'Sensor recalibration', 'Hydraulic system check'][i % 6],
    scheduledDate: randomDate(new Date('2025-01-01'), new Date('2026-12-31')),
    completedDate: i % 3 === 2 ? randomDate(new Date('2025-06-01'), new Date('2026-07-01')) : undefined,
    cost: randomBetween(2000, 50000),
    technician: exports.workers[randomBetween(0, 14)].name,
    downtime: randomBetween(1, 48),
}));
exports.energyRecords = Array.from({ length: 12 }, (_, i) => {
    const total = randomBetween(45000, 75000);
    return {
        id: `ENG-${String(i + 1).padStart(3, '0')}`,
        date: `2026-${String(i + 1).padStart(2, '0')}-01`,
        totalConsumption: total,
        peakConsumption: total * 1.3,
        cost: total * 8.5,
        machineBreakdown: exports.machines.slice(0, 10).map((m) => ({
            machineId: m.id,
            consumption: randomBetween(2000, 8000),
        })),
        carbonFootprint: total * 0.82,
    };
});
exports.salesOrders = Array.from({ length: 500 }, (_, i) => {
    const qty = randomBetween(10, 500);
    const unitPrice = randomBetween(500, 15000);
    return {
        id: `SO-${String(i + 1).padStart(4, '0')}`,
        orderNumber: `SLS-2026-${String(i + 1).padStart(4, '0')}`,
        customerId: exports.customers[i % exports.customers.length].id,
        product: PRODUCTS[i % PRODUCTS.length],
        quantity: qty,
        unitPrice,
        totalAmount: qty * unitPrice,
        status: ['pending', 'confirmed', 'shipped', 'delivered'][randomBetween(0, 3)],
        orderDate: randomDate(new Date('2025-01-01'), new Date('2026-07-01')),
        deliveryDate: randomDate(new Date('2026-07-01'), new Date('2026-12-31')),
    };
});
exports.notifications = [
    { id: 'notif-1', type: 'inventory', title: 'Low Stock Alert', message: 'Mild Steel Sheet below reorder level (85 kg remaining)', severity: 'warning', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'notif-2', type: 'maintenance', title: 'Maintenance Due', message: 'CNC Lathe #7 scheduled for preventive maintenance tomorrow', severity: 'info', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'notif-3', type: 'machine', title: 'Machine Failure Risk', message: 'Injection Molding #12 health score dropped to 52%', severity: 'critical', read: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 'notif-4', type: 'energy', title: 'Energy Spike Detected', message: 'Peak consumption 23% above average during 2-4 PM shift', severity: 'warning', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'notif-5', type: 'order', title: 'Delayed Order', message: 'Order PRD-2026-0087 is 3 days behind schedule', severity: 'critical', read: false, createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'notif-6', type: 'attendance', title: 'Attendance Issue', message: '8 workers absent in morning shift today', severity: 'warning', read: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
];
function getDashboardKPIs() {
    const runningMachines = exports.machines.filter((m) => m.status === 'running').length;
    const avgUtilization = Math.round(exports.machines.reduce((s, m) => s + m.utilization, 0) / exports.machines.length);
    const presentWorkers = exports.workers.filter((w) => w.attendance === 'present').length;
    const lowStock = exports.inventory.filter((i) => i.quantity <= i.reorderLevel).length;
    const todayProduction = exports.productionOrders.filter((o) => o.status === 'in_progress').reduce((s, o) => s + o.completed, 0);
    const totalRevenue = exports.salesOrders.reduce((s, o) => s + o.totalAmount, 0);
    const pendingMaintenance = exports.maintenanceRecords.filter((m) => m.status === 'scheduled').length;
    const avgHealth = Math.round(exports.machines.reduce((s, m) => s + m.healthScore, 0) / exports.machines.length);
    const energyCost = exports.energyRecords[exports.energyRecords.length - 1]?.cost || 0;
    return [
        { label: "Today's Production", value: todayProduction, unit: 'units', trend: 8.2, trendDirection: 'up', sparkline: generateSparkline() },
        { label: 'Machine Utilization', value: avgUtilization, unit: '%', trend: 3.1, trendDirection: 'up', sparkline: generateSparkline() },
        { label: 'Active Orders', value: exports.productionOrders.filter((o) => o.status === 'in_progress').length, trend: -2.4, trendDirection: 'down', sparkline: generateSparkline() },
        { label: 'Inventory Status', value: lowStock, unit: 'low items', trend: 12, trendDirection: 'down', sparkline: generateSparkline() },
        { label: 'Pending Maintenance', value: pendingMaintenance, trend: 5, trendDirection: 'up', sparkline: generateSparkline() },
        { label: 'Revenue', value: `₹${(totalRevenue / 10000000).toFixed(1)}Cr`, trend: 15.3, trendDirection: 'up', sparkline: generateSparkline() },
        { label: 'Profit Margin', value: 18.5, unit: '%', trend: 1.2, trendDirection: 'up', sparkline: generateSparkline() },
        { label: 'Energy Cost', value: `₹${(energyCost / 1000).toFixed(0)}K`, trend: -4.5, trendDirection: 'down', sparkline: generateSparkline() },
        { label: 'Worker Attendance', value: presentWorkers, unit: `/ ${exports.workers.length}`, trend: -3, trendDirection: 'down', sparkline: generateSparkline() },
        { label: 'Downtime', value: 4.2, unit: 'hrs', trend: -8.1, trendDirection: 'down', sparkline: generateSparkline() },
    ];
}
function getHeroMetrics() {
    const avgHealth = Math.round(exports.machines.reduce((s, m) => s + m.healthScore, 0) / exports.machines.length);
    const avgUtilization = Math.round(exports.machines.reduce((s, m) => s + m.utilization, 0) / exports.machines.length);
    const todayProduction = exports.productionOrders.filter((o) => o.status === 'in_progress').reduce((s, o) => s + Math.min(o.completed, o.quantity * 0.1), 0);
    const energyToday = Math.round(exports.energyRecords[exports.energyRecords.length - 1]?.totalConsumption / 30 || 2000);
    const targetProduction = 8500;
    const profitToday = randomBetween(180000, 350000);
    return {
        overallEfficiency: avgUtilization,
        machineHealthScore: avgHealth,
        profitToday,
        energyUsage: energyToday,
        productionTarget: { actual: Math.round(todayProduction), target: targetProduction },
        runningMachines: exports.machines.filter((m) => m.status === 'running').length,
        totalMachines: exports.machines.length,
    };
}
function getAnalyticsData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
        productionTrend: months.map((month, i) => ({
            month,
            actual: randomBetween(6000, 9000),
            target: 8500,
            forecast: randomBetween(6500, 9500),
        })),
        profitTrend: months.map((month) => ({
            month,
            revenue: randomBetween(3000000, 6000000),
            profit: randomBetween(500000, 1200000),
            cost: randomBetween(2000000, 4500000),
        })),
        energyTrend: months.map((month, i) => ({
            month,
            consumption: exports.energyRecords[i]?.totalConsumption || randomBetween(45000, 75000),
            cost: exports.energyRecords[i]?.cost || randomBetween(380000, 640000),
        })),
        downtimeTrend: months.map((month) => ({
            month,
            planned: randomBetween(20, 60),
            unplanned: randomBetween(10, 40),
        })),
        machineUtilization: exports.machines.slice(0, 15).map((m) => ({
            name: m.name.split(' #')[0],
            utilization: m.utilization,
            health: m.healthScore,
        })),
        workerProductivity: DEPARTMENTS.map((dept) => ({
            department: dept,
            productivity: randomBetween(70, 95),
            attendance: randomBetween(85, 98),
        })),
        inventoryTrend: months.map((month) => ({
            month,
            rawMaterials: randomBetween(50000, 120000),
            finishedGoods: randomBetween(30000, 80000),
        })),
        paretoData: PRODUCTS.map((product, i) => ({
            product,
            revenue: randomBetween(500000, 3000000),
            cumulative: 0,
        })).sort((a, b) => b.revenue - a.revenue).map((item, i, arr) => {
            const total = arr.reduce((s, a) => s + a.revenue, 0);
            const cumulative = arr.slice(0, i + 1).reduce((s, a) => s + a.revenue, 0);
            return { ...item, cumulative: Math.round((cumulative / total) * 100) };
        }),
    };
}
exports.demoUsers = [
    { id: 'user-1', email: 'owner@kumar-precision.com', password: 'demo123', name: 'Rajesh Kumar', role: 'factory_owner' },
    { id: 'user-2', email: 'production@kumar-precision.com', password: 'demo123', name: 'Priya Sharma', role: 'production_manager' },
    { id: 'user-3', email: 'maintenance@kumar-precision.com', password: 'demo123', name: 'Amit Patel', role: 'maintenance_engineer' },
    { id: 'user-4', email: 'inventory@kumar-precision.com', password: 'demo123', name: 'Sneha Reddy', role: 'inventory_manager' },
    { id: 'user-5', email: 'admin@kumar-precision.com', password: 'demo123', name: 'Admin User', role: 'admin' },
];
exports.futureModules = [
    { id: 'digital-twin', name: 'Digital Twin', description: 'Real-time virtual replica of factory floor', status: 'roadmap', icon: 'Box' },
    { id: 'iot', name: 'IoT Integration', description: 'Connect sensors and smart devices across the factory', status: 'roadmap', icon: 'Wifi' },
    { id: 'plc', name: 'PLC Integration', description: 'Direct integration with Programmable Logic Controllers', status: 'roadmap', icon: 'Cpu' },
    { id: 'scada', name: 'SCADA Integration', description: 'Supervisory control and data acquisition systems', status: 'roadmap', icon: 'Monitor' },
    { id: 'sensors', name: 'Machine Sensors', description: 'Real-time vibration, temperature, and pressure monitoring', status: 'roadmap', icon: 'Activity' },
    { id: 'vision', name: 'Camera Inspection', description: 'AI-powered visual quality inspection', status: 'roadmap', icon: 'Camera' },
    { id: 'rfid', name: 'RFID Tracking', description: 'Automated asset and inventory tracking', status: 'roadmap', icon: 'Radio' },
    { id: 'edge', name: 'Edge Computing', description: 'Local processing for real-time decision making', status: 'roadmap', icon: 'Server' },
    { id: 'robotics', name: 'Robotics Integration', description: 'Collaborative robot management and optimization', status: 'roadmap', icon: 'Bot' },
];
