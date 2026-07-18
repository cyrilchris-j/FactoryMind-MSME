"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMachines = generateMachines;
exports.generateWorkers = generateWorkers;
exports.generateInventoryItems = generateInventoryItems;
exports.generateProductionOrders = generateProductionOrders;
exports.generateSalesOrders = generateSalesOrders;
exports.generateAllSampleData = generateAllSampleData;
exports.exportSampleData = exportSampleData;
// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};
// Data generators
function generateMachines(count = 50) {
    const types = ['CNC Machine', 'Lathe', 'Milling Machine', 'Drill Press', 'Grinder', 'HVAC System', 'Conveyor Belt'];
    const statuses = ['running', 'running', 'running', 'running', 'maintenance', 'warning', 'critical', 'offline'];
    return Array.from({ length: count }, (_, i) => {
        const status = randomChoice(statuses);
        const healthScore = status === 'running' ? randomInt(80, 100) :
            status === 'maintenance' ? randomInt(60, 79) :
                status === 'warning' ? randomInt(50, 69) :
                    status === 'critical' ? randomInt(30, 49) : randomInt(0, 29);
        const today = new Date();
        const lastMaintenance = randomDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000), today);
        const nextMaintenance = randomDate(today, new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
        return {
            id: `M-${String(i + 1).padStart(3, '0')}`,
            name: `${randomChoice(['CNC', 'LAT', 'MILL', 'DRILL', 'GRIND', 'HVAC', 'CONV'])}-${String(i + 1).padStart(2, '0')}`,
            type: randomChoice(types),
            healthScore,
            status,
            lastMaintenance,
            nextMaintenance,
            uptime: `${randomFloat(70, 99).toFixed(1)}%`,
        };
    });
}
function generateWorkers(count = 100) {
    const departments = ['Production', 'Maintenance', 'Quality Control', 'Inventory', 'Packaging'];
    const roles = ['Machine Operator', 'Technician', 'Inspector', 'Supervisor', 'Forklift Operator'];
    const shifts = ['Morning (6AM-2PM)', 'Day (8AM-4PM)', 'Evening (2PM-10PM)', 'Night (10PM-6AM)'];
    const statuses = ['present', 'present', 'present', 'absent', 'leave'];
    const firstNames = ['Ramesh', 'Suresh', 'Amit', 'Vijay', 'Rajesh', 'Sunil', 'Anil', 'Deepak', 'Sanjay', 'Prakash', 'Priya', 'Sunita', 'Anita', 'Kavita', 'Meena'];
    const lastNames = ['Kumar', 'Patel', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Malhotra', 'Reddy', 'Nair', 'Iyer'];
    return Array.from({ length: count }, (_, i) => ({
        id: `W-${String(i + 1).padStart(3, '0')}`,
        name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        department: randomChoice(departments),
        role: randomChoice(roles),
        attendance: randomInt(75, 100),
        productivity: randomInt(70, 98),
        overtime: randomInt(0, 30),
        status: randomChoice(statuses),
        shift: randomChoice(shifts),
    }));
}
function generateInventoryItems(count = 50) {
    const rawMaterials = [
        'Steel Sheets 2mm', 'Aluminum Rods 10mm', 'Copper Wire 5mm', 'Plastic Pellets',
        'Rubber Sheets', 'Brass Rods', 'Stainless Steel Pipes', 'Iron Ingots',
        'PVC Pipes', 'Carbon Fiber Sheets', 'Titanium Rods', 'Zinc Coils'
    ];
    const finishedGoods = [
        'Automotive Part A', 'Industrial Component B', 'Custom Assembly C',
        'Precision Part D', 'Standard Component E', 'Heavy Duty Fitting',
        'Electronic Module F', 'Hydraulic Part G', 'Pneumatic Component H'
    ];
    const suppliers = ['MetalCorp Ltd', 'AlumWorks', 'ElectroSupply', 'PolyTech', 'SteelMasters', 'Global Metals'];
    const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Storage Zone 1', 'Storage Zone 2'];
    return Array.from({ length: count }, (_, i) => {
        const isRawMaterial = Math.random() > 0.4;
        const name = isRawMaterial ? randomChoice(rawMaterials) : randomChoice(finishedGoods);
        const quantity = randomInt(50, 5000);
        const reorderLevel = Math.floor(quantity * 0.2);
        const status = quantity < reorderLevel * 0.5 ? 'critical' : quantity < reorderLevel ? 'low_stock' : 'in_stock';
        return {
            id: isRawMaterial ? `RM-${String(i + 1).padStart(3, '0')}` : `FG-${String(i + 1).padStart(3, '0')}`,
            name,
            category: isRawMaterial ? 'Raw Material' : 'Finished Goods',
            quantity,
            unit: isRawMaterial ? randomChoice(['kg', 'meters', 'sheets', 'rods']) : 'units',
            reorderLevel,
            supplier: isRawMaterial ? randomChoice(suppliers) : '-',
            location: randomChoice(locations),
            status,
        };
    });
}
function generateProductionOrders(count = 25) {
    const products = [
        'Automotive Part A', 'Industrial Component B', 'Custom Assembly C',
        'Precision Part D', 'Standard Component E', 'Heavy Duty Fitting'
    ];
    const statuses = ['completed', 'in_progress', 'in_progress', 'pending', 'delayed'];
    const priorities = ['low', 'medium', 'medium', 'high', 'critical'];
    return Array.from({ length: count }, (_, i) => {
        const target = randomInt(100, 1000);
        const status = randomChoice(statuses);
        const progress = status === 'completed' ? 1 :
            status === 'in_progress' ? randomFloat(0.3, 0.9) :
                status === 'delayed' ? randomFloat(0.1, 0.5) : 0;
        return {
            id: `PO-${String(i + 1).padStart(3, '0')}`,
            product: randomChoice(products),
            quantity: Math.floor(target * progress),
            target,
            status,
            priority: randomChoice(priorities),
            deadline: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            machine: `CNC-${String(randomInt(1, 10)).padStart(2, '0')}`,
        };
    });
}
function generateSalesOrders(count = 30) {
    const customers = [
        'Apex Industries Ltd', 'TechCorp Solutions', 'Global Manufacturing',
        'Precision Parts Inc', 'AutoParts Ltd', 'MegaCorp Industries',
        'FutureTech Systems', 'Prime Components', 'Elite Manufacturing'
    ];
    const products = [
        'Automotive Part A', 'Industrial Component B', 'Custom Assembly C',
        'Precision Part D', 'Standard Component E'
    ];
    const statuses = ['delivered', 'delivered', 'shipped', 'processing', 'pending'];
    return Array.from({ length: count }, (_, i) => {
        const quantity = randomInt(50, 800);
        const unitPrice = randomInt(300, 600);
        const revenue = quantity * unitPrice;
        const profitMargin = randomFloat(0.2, 0.3);
        return {
            id: `ORD-${String(i + 1).padStart(3, '0')}`,
            customer: randomChoice(customers),
            product: randomChoice(products),
            quantity,
            revenue,
            profit: Math.floor(revenue * profitMargin),
            status: randomChoice(statuses),
            date: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        };
    });
}
// Generate all sample data
function generateAllSampleData() {
    return {
        machines: generateMachines(50),
        workers: generateWorkers(100),
        inventory: generateInventoryItems(50),
        productionOrders: generateProductionOrders(25),
        salesOrders: generateSalesOrders(30),
    };
}
// Export data as JSON
function exportSampleData() {
    const data = generateAllSampleData();
    console.log(JSON.stringify(data, null, 2));
    return data;
}
