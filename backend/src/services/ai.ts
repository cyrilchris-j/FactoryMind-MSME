import { GoogleGenerativeAI } from '@google/generative-ai'
import { adminDb } from '../lib/firebase-admin'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

async function getTodayProductionContext(factoryId: string) {
  const today = new Date().toISOString().split('T')[0]
  const snap = await adminDb.collection('production')
    .where('factoryId', '==', factoryId)
    .where('date', '==', today)
    .get()

  if (snap.empty) return null

  const production = snap.docs.map(d => d.data())
  const totalTarget = production.reduce((acc: number, p: any) => acc + (p.targetQuantity || 0), 0)
  const totalActual = production.reduce((acc: number, p: any) => acc + (p.actualQuantity || 0), 0)
  const totalRejected = production.reduce((acc: number, p: any) => acc + (p.rejectedQuantity || 0), 0)
  const totalDowntime = production.reduce((acc: number, p: any) => acc + (p.downtimeMinutes || 0), 0)

  return {
    date: today,
    totalTarget,
    totalActual,
    totalRejected,
    totalDowntime,
    recordsCount: production.length,
    machineBreakdown: production.map((p: any) => ({
      machine: p.machineCode || 'Unknown',
      target: p.targetQuantity,
      actual: p.actualQuantity,
      downtime: p.downtimeMinutes,
    })),
  }
}

async function getInventoryContext(factoryId: string) {
  const snap = await adminDb.collection('inventory')
    .where('factoryId', '==', factoryId)
    .get()

  if (snap.empty) return null

  const data = snap.docs.map(d => d.data())
  const lowStockItems = data.filter((i: any) => i.currentStock <= i.minimumStock)

  return {
    totalItems: data.length,
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.map((i: any) => ({
      name: i.materialName,
      code: i.materialCode,
      stock: i.currentStock,
      min: i.minimumStock,
      unit: i.unit,
    })),
  }
}

async function getMaintenanceContext(factoryId: string) {
  const snap = await adminDb.collection('maintenance')
    .where('factoryId', '==', factoryId)
    .get()

  if (snap.empty) return null

  const data = snap.docs.map(d => d.data()).filter((i: any) => i.status !== 'COMPLETED')

  return {
    activeIssuesCount: data.length,
    criticalIssues: data.filter((i: any) => i.priority === 'CRITICAL').map((i: any) => ({
      machine: i.machineCode || 'Unknown',
      issue: i.issueType,
      desc: i.description,
    })),
    issues: data.map((i: any) => ({
      machine: i.machineCode || 'Unknown',
      issue: i.issueType,
      priority: i.priority,
      status: i.status,
    })),
  }
}

async function getEnergyContext(factoryId: string) {
  const today = new Date().toISOString().split('T')[0]
  const snap = await adminDb.collection('energy')
    .where('factoryId', '==', factoryId)
    .where('date', '==', today)
    .get()

  if (snap.empty) return null

  const data = snap.docs.map(d => d.data())
  const totalConsumption = data.reduce((acc: number, e: any) => acc + Number(e.energyConsumptionKwh || 0), 0)
  const totalCost = data.reduce((acc: number, e: any) => acc + Number(e.energyCost || 0), 0)

  return {
    date: today,
    totalConsumptionKwh: totalConsumption,
    totalCostInr: totalCost,
    machineBreakdown: data.map((e: any) => ({
      machine: e.machineCode || 'Unknown',
      kwh: e.energyConsumptionKwh,
      cost: e.energyCost,
      powerFactor: e.powerFactor,
    })),
  }
}

async function getSalesContext(factoryId: string) {
  const snap = await adminDb.collection('sales')
    .where('factoryId', '==', factoryId)
    .get()

  if (snap.empty) return null

  const data = snap.docs.map(d => d.data())
  const activeOrders = data.filter((s: any) => s.status !== 'DELIVERED')
  const totalValue = activeOrders.reduce((acc: number, s: any) => acc + Number(s.orderValue || 0), 0)

  return {
    activeOrdersCount: activeOrders.length,
    totalActiveValueInr: totalValue,
    orders: activeOrders.map((o: any) => ({
      orderNumber: o.orderNumber,
      customer: o.customerName,
      product: o.productName,
      value: o.orderValue,
      status: o.status,
    })),
  }
}

async function getWorkforceContext(factoryId: string) {
  const today = new Date().toISOString().split('T')[0]
  const snap = await adminDb.collection('workers')
    .where('factoryId', '==', factoryId)
    .get()

  if (snap.empty) return null

  const data = snap.docs.map(d => d.data())
  const total = data.length
  const present = data.filter((w: any) => w.status === 'present').length
  const absent = data.filter((w: any) => w.status === 'absent').length

  return {
    date: today,
    totalWorkers: total,
    presentWorkers: present,
    absentWorkers: absent,
    attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) + '%' : '0%',
  }
}

async function getProductAndBOMContext(factoryId: string) {
  const prodSnap = await adminDb.collection('products')
    .where('factoryId', '==', factoryId)
    .limit(5)
    .get()
  if (prodSnap.empty) return null

  const products = prodSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  const productIds = products.map((p: any) => p.id)

  const bomSnap = await adminDb.collection('bill_of_materials')
    .where('factoryId', '==', factoryId)
    .get()
  const bomItems = bomSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

  const componentIds = [...new Set(bomItems.map((b: any) => b.componentId))]
  const compSnap = componentIds.length > 0
    ? await adminDb.collection('components')
        .where('factoryId', '==', factoryId)
        .get()
    : { docs: [] }
  const componentMap: any = {}
  compSnap.docs.forEach((d: any) => { componentMap[d.id] = { id: d.id, ...d.data() } })

  const productBOMs = products.map((p: any) => {
    const productBOM = bomItems.filter((b: any) => b.productId === p.id)
    const compDetails = productBOM.map((b: any) => {
      const comp = componentMap[b.componentId]
      return {
        componentName: comp?.componentName || 'Unknown',
        requiredQty: b.quantityRequired,
        currentStock: comp?.currentStock || 0,
        reserved: comp?.reservedStock || 0,
      }
    })
    return {
      productName: p.productName,
      productCode: p.productCode,
      bomComponents: compDetails,
    }
  })

  return {
    products: productBOMs,
    totalProducts: products.length,
  }
}

async function getCustomerOrdersContext(factoryId: string) {
  const snap = await adminDb.collection('customer_orders')
    .where('factoryId', '==', factoryId)
    .get()
  if (snap.empty) return null

  const data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  return {
    totalOrders: data.length,
    activeOrders: data.filter((o: any) => o.status !== 'COMPLETED').length,
    orders: data.map((o: any) => ({
      orderNumber: o.orderNumber,
      customer: o.customerName,
      product: o.productName,
      quantity: o.quantity,
      completed: o.completedQuantity,
      status: o.status,
    })),
  }
}

async function gatherContext(prompt: string, factoryId: string) {
  const lowerPrompt = prompt.toLowerCase()
  const context: any = {}

  if (lowerPrompt.includes('production') || lowerPrompt.includes('target') || lowerPrompt.includes('output') || lowerPrompt.includes('produce')) {
    context.production = await getTodayProductionContext(factoryId)
  }

  if (lowerPrompt.includes('inventory') || lowerPrompt.includes('stock') || lowerPrompt.includes('material') || lowerPrompt.includes('supplier')) {
    context.inventory = await getInventoryContext(factoryId)
  }

  if (lowerPrompt.includes('maintenance') || lowerPrompt.includes('repair') || lowerPrompt.includes('breakdown') || lowerPrompt.includes('machine') || lowerPrompt.includes('failure')) {
    context.maintenance = await getMaintenanceContext(factoryId)
  }

  if (lowerPrompt.includes('energy') || lowerPrompt.includes('electricity') || lowerPrompt.includes('power') || lowerPrompt.includes('cost') || lowerPrompt.includes('consumption')) {
    context.energy = await getEnergyContext(factoryId)
  }

  if (lowerPrompt.includes('sales') || lowerPrompt.includes('order') || lowerPrompt.includes('revenue') || lowerPrompt.includes('customer') || lowerPrompt.includes('value')) {
    context.sales = await getSalesContext(factoryId)
  }

  if (lowerPrompt.includes('workforce') || lowerPrompt.includes('worker') || lowerPrompt.includes('attendance') || lowerPrompt.includes('shift') || lowerPrompt.includes('present')) {
    context.workforce = await getWorkforceContext(factoryId)
  }

  if (lowerPrompt.includes('bom') || lowerPrompt.includes('product') || lowerPrompt.includes('component') || lowerPrompt.includes('bill of material') || lowerPrompt.includes('brake') || lowerPrompt.includes('shortage') || lowerPrompt.includes('constraint') || lowerPrompt.includes('buildable') || lowerPrompt.includes('material')) {
    context.products = await getProductAndBOMContext(factoryId)
  }

  if (lowerPrompt.includes('order') || lowerPrompt.includes('customer') || lowerPrompt.includes('feasibility') || lowerPrompt.includes('fulfilment') || lowerPrompt.includes('delivery')) {
    context.customerOrders = await getCustomerOrdersContext(factoryId)
  }

  return context
}

export async function chatWithAI(
  prompt: string,
  history: { role: string; content: string }[],
  factoryId: string = '',
  onChunk?: (chunk: string) => void
) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.')
  }

  const factoryContext = await gatherContext(prompt, factoryId)

  const systemPrompt = `You are FactoryMind AI, a manufacturing decision-support assistant for an automotive component MSME called Prime Auto Components.

The factory manufactures Automotive Brake Assemblies.

IMPORTANT RULES:
- Analyze ONLY the factory data provided below. Do NOT invent any operational facts, numbers, or metrics.
- Math, calculations, and quantitative analysis should come from the application logic, not from AI inference.
- If data is insufficient, state that clearly.
- For causality, use wording like "likely contributing factors include..." when causality is inferred.
- Keep explanations practical and actionable for a factory owner.

Current Factory Data Context:
${JSON.stringify(factoryContext, null, 2)}

Provide your response in strict JSON format with these keys:
{
  "summary": "Direct, practical answer to the owner's question based on data.",
  "key_findings": ["Finding 1", "Finding 2"],
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "recommended_actions": ["Action 1", "Action 2"],
  "data_sources": ["Data Source 1", "Data Source 2"],
  "confidence": 85
}
Ensure output is ONLY valid JSON. No markdown backticks.`

  const tools: any = [{
    functionDeclarations: [{
      name: "getMachineStatus",
      description: "Get the current running status and health score of a machine",
      parameters: {
        type: "OBJECT",
        properties: {
          machineCode: { type: "STRING", description: "The ID or code of the machine" }
        },
        required: ["machineCode"]
      }
    }]
  }];

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    tools,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  })

  try {
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(systemPrompt + '\n\nUser Question: ' + prompt)
    const text = result.response.text()

    const parsed = JSON.parse(text)
    return {
      structured: true,
      data: parsed,
    }
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { error: 'Failed to generate AI response. ' + error.message }
  }
}

export async function getDailyBriefing(factoryId: string) {
  const context = {
    production: await getTodayProductionContext(factoryId),
    inventory: await getInventoryContext(factoryId),
    maintenance: await getMaintenanceContext(factoryId),
    energy: await getEnergyContext(factoryId),
    sales: await getSalesContext(factoryId),
    workforce: await getWorkforceContext(factoryId),
  }

  const hasData = Object.values(context).some(v => v !== null)
  if (!hasData) {
    return { text: 'No factory data available for today. Start by adding production records.' }
  }

  if (genAI) {
    const systemPrompt = `You are FactoryMind AI. Generate a concise daily briefing for a factory owner based on the data below.
Keep it to 3-5 bullet points covering key metrics, risks, and recommendations.
Use plain text, no markdown.

Current Factory Data:
${JSON.stringify(context, null, 2)}`

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: { temperature: 0.2 },
      })
      const result = await model.generateContent(systemPrompt)
      return { text: result.response.text() }
    } catch (err) {
      console.error('Briefing generation failed:', err)
    }
  }

  const parts: string[] = []
  if (context.production) {
    const p = context.production
    parts.push(`Production: ${p.totalActual}/${p.totalTarget} units (${Math.round(p.totalActual / p.totalTarget * 100)}% achievement, ${p.totalRejected} rejected, ${p.totalDowntime}min downtime)`)
  }
  if (context.inventory) {
    parts.push(`Inventory: ${context.inventory.lowStockCount} low-stock items out of ${context.inventory.totalItems}`)
  }
  if (context.maintenance) {
    parts.push(`Maintenance: ${context.maintenance.activeIssuesCount} active issues${context.maintenance.criticalIssues.length > 0 ? ` (${context.maintenance.criticalIssues.length} critical)` : ''}`)
  }
  if (context.energy) {
    const e = context.energy
    parts.push(`Energy: ${e.totalConsumptionKwh}kWh consumed today at ₹${e.totalCostInr}`)
  }
  if (context.sales) {
    parts.push(`Sales: ${context.sales.activeOrdersCount} active orders worth ₹${context.sales.totalActiveValueInr}`)
  }
  if (context.workforce) {
    parts.push(`Workforce: ${context.workforce.attendanceRate} attendance (${context.workforce.presentWorkers}/${context.workforce.totalWorkers})`)
  }

  return { text: parts.length > 0 ? parts.join('\n') : 'No significant data to report for today.' }
}

export async function getWeeklySummary(factoryId: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const prodSnap = await adminDb.collection('production')
    .where('factoryId', '==', factoryId)
    .where('date', '>=', weekAgo.toISOString().split('T')[0])
    .get()
  const weeklyProd = prodSnap.docs.map((d: any) => d.data())
  const totalActual = weeklyProd.reduce((s: number, p: any) => s + (p.actualQuantity || 0), 0)
  const totalTarget = weeklyProd.reduce((s: number, p: any) => s + (p.targetQuantity || 0), 0)

  const maintSnap = await adminDb.collection('maintenance')
    .where('factoryId', '==', factoryId)
    .where('reportedDate', '>=', weekAgo.toISOString().split('T')[0])
    .get()
  const weeklyMaint = maintSnap.docs.map((d: any) => d.data())

  if (genAI) {
    const systemPrompt = `You are FactoryMind AI. Generate a weekly summary for the past 7 days based on the data below.
Include production totals, trends, and recommendations.
Use plain text, no markdown.

Past 7 Days:
- Production: ${totalActual}/${totalTarget} units achieved
- ${weeklyMaint.length} maintenance issues reported
- ${weeklyProd.length} production records logged`

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: { temperature: 0.2 },
      })
      const result = await model.generateContent(systemPrompt)
      return { text: result.response.text() }
    } catch (err) {
      console.error('Weekly summary generation failed:', err)
    }
  }

  return {
    text: `Past 7 Days:\n- Production: ${totalActual}/${totalTarget} units\n- Maintenance issues: ${weeklyMaint.length}\n- Production records: ${weeklyProd.length}`,
  }
}
