'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react';

const inventoryItems = [
  {
    id: 'RM-001',
    name: 'Steel Sheets 2mm',
    category: 'Raw Material',
    quantity: 2500,
    unit: 'sheets',
    reorderLevel: 500,
    supplier: 'MetalCorp Ltd',
    location: 'Warehouse A',
    status: 'in_stock',
  },
  {
    id: 'RM-002',
    name: 'Aluminum Rods 10mm',
    category: 'Raw Material',
    quantity: 150,
    unit: 'rods',
    reorderLevel: 200,
    supplier: 'AlumWorks',
    location: 'Warehouse A',
    status: 'low_stock',
  },
  {
    id: 'RM-003',
    name: 'Copper Wire 5mm',
    category: 'Raw Material',
    quantity: 5000,
    unit: 'meters',
    reorderLevel: 1000,
    supplier: 'ElectroSupply',
    location: 'Warehouse B',
    status: 'in_stock',
  },
  {
    id: 'FG-001',
    name: 'Automotive Part A',
    category: 'Finished Goods',
    quantity: 450,
    unit: 'units',
    reorderLevel: 100,
    supplier: '-',
    location: 'Warehouse C',
    status: 'in_stock',
  },
  {
    id: 'FG-002',
    name: 'Industrial Component B',
    category: 'Finished Goods',
    quantity: 80,
    unit: 'units',
    reorderLevel: 50,
    supplier: '-',
    location: 'Warehouse C',
    status: 'in_stock',
  },
  {
    id: 'RM-004',
    name: 'Plastic Pellets',
    category: 'Raw Material',
    quantity: 45,
    unit: 'kg',
    reorderLevel: 100,
    supplier: 'PolyTech',
    location: 'Warehouse A',
    status: 'critical',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_stock: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    low_stock: 'bg-[#F4B400]/10 text-[#F4B400]',
    critical: 'bg-[#D93025]/10 text-[#D93025]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Raw Material': 'bg-[#1F3A5F]/10 text-[#1F3A5F]',
    'Finished Goods': 'bg-[#2E8B57]/10 text-[#2E8B57]',
  };
  return colors[category] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventory</h1>
            <p className="text-[#6B7280]">Manage raw materials and finished goods</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <Package className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">8,225</p>
            <p className="text-sm text-[#6B7280]">Total Items</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-[#D93025]" />
              <span className="text-sm text-[#D93025] flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                2
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">3</p>
            <p className="text-sm text-[#6B7280]">Low Stock Alerts</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">92%</p>
            <p className="text-sm text-[#6B7280]">Stock Accuracy</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownRight className="w-5 h-5 text-[#4F6D7A]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -12%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">₹4.2L</p>
            <p className="text-sm text-[#6B7280]">Inventory Value</p>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Inventory Items</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search items..."
                  className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Item ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Supplier</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{item.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{item.name}</td>
                    <td className="py-4 px-4">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#6B7280] font-numbers">
                      {item.reorderLevel} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{item.supplier}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{item.location}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AI Prediction Card */}
        <Card className="p-6 bg-gradient-to-r from-[#1F3A5F]/5 to-[#4F6D7A]/5 border-l-4 border-l-[#1F3A5F]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#1F3A5F]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#1F3A5F]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Demand Forecast</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Steel Sheets 2mm demand expected to increase by 25% next week. Recommended to order additional 500 sheets.
              </p>
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Confidence:</span>
                  <span className="ml-2 font-medium text-[#2E8B57]">87%</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Suggested Order:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A]">500 sheets</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Place Order
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
