"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = chatWithAI;
exports.getWeeklySummary = getWeeklySummary;
exports.getDailyBriefing = getDailyBriefing;
const generative_ai_1 = require("@google/generative-ai");
const seed_1 = require("../data/seed");
const genAI = process.env.GEMINI_API_KEY
    ? new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;
function buildFactoryContext() {
    const kpis = (0, seed_1.getDashboardKPIs)();
    const hero = (0, seed_1.getHeroMetrics)();
    const lowStock = seed_1.inventory.filter((i) => i.quantity <= i.reorderLevel);
    const underutilized = seed_1.machines.filter((m) => m.utilization < 50 && m.status === 'running');
    const atRisk = seed_1.machines.filter((m) => m.healthScore < 60);
    const topCustomers = [...seed_1.customers].sort((a, b) => b.profit - a.profit).slice(0, 5);
    const overloadedWorkers = seed_1.workers.filter((w) => w.overtime > 8);
    return `
FACTORY: ${seed_1.factory.name}, ${seed_1.factory.location}
Industry: ${seed_1.factory.industry} | Employees: ${seed_1.factory.employeeCount} | Machines: ${seed_1.machines.length}

CURRENT METRICS:
- Overall Efficiency: ${hero.overallEfficiency}%
- Machine Health Score: ${hero.machineHealthScore}%
- Profit Today: ₹${hero.profitToday.toLocaleString('en-IN')}
- Energy Usage Today: ${hero.energyUsage} kWh
- Production: ${hero.productionTarget.actual}/${hero.productionTarget.target} units
- Running Machines: ${hero.runningMachines}/${hero.totalMachines}

KPIs: ${kpis.map((k) => `${k.label}: ${k.value}${k.unit ? ' ' + k.unit : ''}`).join(', ')}

MACHINES (${seed_1.machines.length} total):
${seed_1.machines.slice(0, 20).map((m) => `${m.name}: ${m.status}, ${m.utilization}% util, health ${m.healthScore}%`).join('\n')}
Underutilized (<50%): ${underutilized.map((m) => m.name).join(', ') || 'None'}
At Risk (health<60%): ${atRisk.map((m) => `${m.name} (${m.healthScore}%)`).join(', ') || 'None'}

INVENTORY:
Low Stock Items: ${lowStock.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ') || 'None'}

WORKERS (${seed_1.workers.length} total):
Present: ${seed_1.workers.filter((w) => w.attendance === 'present').length}
Overloaded (>8hr OT): ${overloadedWorkers.map((w) => w.name).join(', ') || 'None'}

TOP CUSTOMERS BY PROFIT:
${topCustomers.map((c) => `${c.name}: ₹${c.profit.toLocaleString('en-IN')}`).join('\n')}

ENERGY (Latest Month):
Consumption: ${seed_1.energyRecords[seed_1.energyRecords.length - 1]?.totalConsumption} kWh
Cost: ₹${seed_1.energyRecords[seed_1.energyRecords.length - 1]?.cost.toLocaleString('en-IN')}

PRODUCTION ORDERS:
Active: ${seed_1.productionOrders.filter((o) => o.status === 'in_progress').length}
Delayed: ${seed_1.productionOrders.filter((o) => o.status === 'delayed').length}
Completed: ${seed_1.productionOrders.filter((o) => o.status === 'completed').length}
`.trim();
}
const SYSTEM_PROMPT = `You are FactoryMind AI, an intelligent factory copilot for MSME manufacturing enterprises.
You help factory owners and managers make smarter operational decisions.

Always respond in a structured, professional manner with:
1. A clear natural language answer
2. Key insights and data points
3. Actionable recommendations with priority levels (High/Medium/Low)
4. Risk assessment when relevant
5. Estimated savings or impact when possible

Use Indian Rupees (₹) for currency. Be specific with machine names, worker names, and numbers from the factory data.
Format numbers with Indian locale. Keep responses concise but comprehensive.
When suggesting actions, be practical for MSME factories.`;
function generateMockResponse(query) {
    const q = query.toLowerCase();
    const hero = (0, seed_1.getHeroMetrics)();
    const underutilized = seed_1.machines.filter((m) => m.utilization < 50);
    const atRisk = seed_1.machines.filter((m) => m.healthScore < 60);
    const lowStock = seed_1.inventory.filter((i) => i.quantity <= i.reorderLevel);
    const topCustomer = [...seed_1.customers].sort((a, b) => b.profit - a.profit)[0];
    const overloaded = seed_1.workers.filter((w) => w.overtime > 8);
    if (q.includes('underutiliz')) {
        return `## Machine Utilization Analysis

**Underutilized Machines (<50% utilization):**
${underutilized.slice(0, 5).map((m) => `- **${m.name}**: ${m.utilization}% utilization, ${m.status} status in ${m.location}`).join('\n')}

**Recommendations:**
| Priority | Action | Impact |
|----------|--------|--------|
| High | Reallocate production orders to ${underutilized[0]?.name || 'idle machines'} | +15% throughput |
| Medium | Cross-train operators for flexible machine assignment | Reduce idle time by 20% |
| Low | Review shift scheduling for Bay C machines | Better load balancing |

**Estimated Savings:** ₹2.4L/month by optimizing machine allocation
**Risk Level:** Medium — Current idle capacity is costing ~₹45K/day`;
    }
    if (q.includes('predict') && q.includes('production')) {
        return `## Production Forecast — Tomorrow

Based on current orders, machine availability, and historical patterns:

| Metric | Prediction | Confidence |
|--------|-----------|------------|
| Expected Output | 8,200 units | 87% |
| Machine Utilization | 78% | 82% |
| Completion Rate | 94% | 85% |

**Key Factors:**
- 3 machines scheduled for maintenance (CNC Lathe #7, Milling #14, Press Brake #22)
- 2 delayed orders need priority allocation
- Morning shift fully staffed, afternoon shift 8% short

**Priority Actions:**
1. **High:** Pre-position materials for high-priority order PRD-2026-0087
2. **Medium:** Assign backup operator to Assembly Line #3
3. **Low:** Schedule overtime for afternoon shift if needed`;
    }
    if (q.includes('electric') || q.includes('energy')) {
        const latest = seed_1.energyRecords[seed_1.energyRecords.length - 1];
        return `## Energy Consumption Analysis

**Current Status:** ${hero.energyUsage} kWh today (${((hero.energyUsage / 2500) * 100).toFixed(0)}% of daily average)

**Peak Hour Detection:**
- Peak consumption: 2:00 PM - 4:00 PM (23% above average)
- Top consumers: Injection Molding units in Bay B

**Root Causes:**
1. All 3 injection molding machines running simultaneously during peak
2. HVAC system not optimized for afternoon heat
3. 2 machines running idle (no load) consuming 15% baseline power

**Recommendations:**
| Priority | Action | Savings |
|----------|--------|---------|
| High | Stagger injection molding schedules | ₹18K/month |
| High | Install auto-shutdown for idle machines | ₹12K/month |
| Medium | Shift heavy production to off-peak hours | ₹8K/month |

**Total Estimated Savings:** ₹38K/month | **Risk Level:** Low`;
    }
    if (q.includes('customer') && q.includes('profit')) {
        return `## Customer Profitability Analysis

**Top 5 Customers by Profit:**

| Customer | Revenue | Profit | Margin |
|----------|---------|--------|--------|
${[...seed_1.customers].sort((a, b) => b.profit - a.profit).slice(0, 5).map((c) => `| ${c.name} | ₹${(c.revenue / 100000).toFixed(1)}L | ₹${(c.profit / 100000).toFixed(1)}L | ${((c.profit / c.revenue) * 100).toFixed(1)}% |`).join('\n')}

**Highest Profit Customer:** ${topCustomer.name} with ₹${topCustomer.profit.toLocaleString('en-IN')} profit (${((topCustomer.profit / topCustomer.revenue) * 100).toFixed(1)}% margin)

**Recommendation:** Focus retention efforts on top 3 customers — they contribute 62% of total profit.`;
    }
    if (q.includes('worker') && q.includes('overload')) {
        return `## Worker Workload Analysis

**Overloaded Workers (>8 hours overtime this week):**
${overloaded.slice(0, 5).map((w) => `- **${w.name}** (${w.department}): ${w.overtime}hrs OT, Productivity: ${w.productivity}%`).join('\n')}

**Department Workload:**
${['Production', 'Assembly', 'Quality', 'Maintenance'].map((d) => {
            const deptWorkers = seed_1.workers.filter((w) => w.department === d);
            const avgProd = Math.round(deptWorkers.reduce((s, w) => s + w.productivity, 0) / deptWorkers.length);
            return `- ${d}: ${deptWorkers.length} workers, avg productivity ${avgProd}%`;
        }).join('\n')}

**Priority Actions:**
1. **High:** Redistribute ${overloaded[0]?.name}'s overtime across 2 trained operators
2. **Medium:** Hire 2 temporary workers for Production department
3. **Low:** Review skill matrix for cross-department flexibility`;
    }
    if (q.includes('cost') || q.includes('reduce')) {
        return `## Cost Reduction Opportunities

**Total Identified Savings: ₹4.8L/month**

| Area | Action | Savings | Priority |
|------|--------|---------|----------|
| Energy | Stagger peak-hour machine usage | ₹38K/mo | High |
| Inventory | Optimize reorder quantities (ABC analysis) | ₹1.2L/mo | High |
| Maintenance | Predictive vs reactive maintenance shift | ₹85K/mo | Medium |
| Labor | Optimize shift scheduling | ₹65K/mo | Medium |
| Raw Materials | Negotiate bulk pricing with Steel Corp | ₹1.5L/mo | High |
| Downtime | Reduce unplanned downtime by 30% | ₹92K/mo | High |

**Quick Wins (implement this week):**
1. Auto-shutdown idle machines → ₹12K/month
2. Consolidate material orders → ₹25K/month
3. Reschedule 2 maintenance tasks to low-production days`;
    }
    return `## Factory Overview

**${seed_1.factory.name}** is operating at **${hero.overallEfficiency}% efficiency** today.

**Key Highlights:**
- Machine Health: ${hero.machineHealthScore}% average across ${seed_1.machines.length} machines
- Production: ${hero.productionTarget.actual}/${hero.productionTarget.target} units (${Math.round((hero.productionTarget.actual / hero.productionTarget.target) * 100)}% of target)
- Profit Today: ₹${hero.profitToday.toLocaleString('en-IN')}
- ${lowStock.length} inventory items below reorder level
- ${atRisk.length} machines at risk (health < 60%)
- ${seed_1.productionOrders.filter((o) => o.status === 'delayed').length} delayed production orders

**Suggested Queries:**
- "Which machine is underutilized?"
- "Predict tomorrow's production"
- "Why is electricity consumption high?"
- "How can I reduce production costs?"

How can I help you optimize your factory operations today?`;
}
async function chatWithAI(message, history = []) {
    const context = buildFactoryContext();
    if (!genAI) {
        return {
            response: generateMockResponse(message),
            metadata: {
                source: 'demo',
                contextUsed: true,
                recommendations: true,
            },
        };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood. I am FactoryMind AI, ready to help with factory operations.' }] },
                { role: 'user', parts: [{ text: `Factory Data Context:\n${context}` }] },
                { role: 'model', parts: [{ text: 'I have analyzed the factory data. Ready to assist.' }] },
                ...history.map((h) => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })),
            ],
        });
        const result = await chat.sendMessage(message);
        const response = result.response.text();
        return {
            response,
            metadata: {
                source: 'gemini',
                contextUsed: true,
                recommendations: true,
            },
        };
    }
    catch {
        return {
            response: generateMockResponse(message),
            metadata: {
                source: 'demo-fallback',
                contextUsed: true,
                recommendations: true,
            },
        };
    }
}
function getWeeklySummary() {
    const hero = (0, seed_1.getHeroMetrics)();
    const analytics = (0, seed_1.getAnalyticsData)();
    return {
        title: 'Weekly Factory Summary',
        period: 'July 1-7, 2026',
        highlights: [
            `Production output averaged 7,850 units/day (${Math.round((7850 / 8500) * 100)}% of target)`,
            `Machine utilization improved by 3.1% to ${hero.overallEfficiency}%`,
            `Energy costs reduced by 4.5% through peak-hour optimization`,
            `${seed_1.maintenanceRecords.filter((m) => m.status === 'completed').length} maintenance tasks completed on schedule`,
            `Revenue grew 15.3% with ${seed_1.salesOrders.filter((o) => o.status === 'delivered').length} orders delivered`,
        ],
        concerns: [
            `${seed_1.inventory.filter((i) => i.quantity <= i.reorderLevel).length} inventory items below reorder level`,
            `${seed_1.machines.filter((m) => m.healthScore < 60).length} machines showing declining health scores`,
            `${seed_1.workers.filter((w) => w.attendance === 'absent').length} attendance issues this week`,
        ],
        productionTrend: analytics.productionTrend.slice(-4),
        aiRecommendations: [
            { priority: 'High', action: 'Restock critical raw materials (Mild Steel Sheet, Ball Bearings)', impact: 'Prevent production halt' },
            { priority: 'High', action: 'Schedule predictive maintenance for Injection Molding #12', impact: 'Avoid ₹2L failure cost' },
            { priority: 'Medium', action: 'Optimize afternoon shift staffing', impact: 'Improve output by 8%' },
            { priority: 'Low', action: 'Review supplier contracts for bulk discounts', impact: 'Save ₹1.5L/month' },
        ],
    };
}
function getDailyBriefing() {
    const hero = (0, seed_1.getHeroMetrics)();
    return {
        title: 'Daily Factory Briefing',
        date: new Date().toISOString().split('T')[0],
        greeting: 'Good Morning, Mr. Kumar',
        factoryHealth: hero.overallEfficiency >= 80 ? 'Good' : hero.overallEfficiency >= 60 ? 'Fair' : 'Needs Attention',
        metrics: hero,
        topPriorities: [
            { task: 'Complete order PRD-2026-0087 (delayed 3 days)', priority: 'critical' },
            { task: 'Restock Mild Steel Sheet (85 kg remaining)', priority: 'high' },
            { task: 'CNC Lathe #7 preventive maintenance', priority: 'medium' },
            { task: 'Review afternoon shift attendance (8 absent)', priority: 'medium' },
        ],
        aiInsight: `Factory is operating at ${hero.overallEfficiency}% efficiency. Focus on completing delayed orders and addressing ${seed_1.inventory.filter((i) => i.quantity <= i.reorderLevel).length} low-stock items to maintain production flow.`,
    };
}
