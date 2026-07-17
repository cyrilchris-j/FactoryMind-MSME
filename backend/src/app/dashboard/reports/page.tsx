'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  FileSpreadsheet,
  Printer,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';

const reportTemplates = [
  {
    id: 'RPT-001',
    name: 'Production Summary',
    description: 'Daily production output, efficiency, and machine utilization',
    category: 'Production',
    lastGenerated: '2024-01-15',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-002',
    name: 'Inventory Status',
    description: 'Current stock levels, reorder points, and supplier analysis',
    category: 'Inventory',
    lastGenerated: '2024-01-14',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-003',
    name: 'Maintenance Report',
    description: 'Machine health scores, upcoming maintenance, and downtime analysis',
    category: 'Maintenance',
    lastGenerated: '2024-01-15',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-004',
    name: 'Energy Consumption',
    description: 'Monthly energy usage, cost analysis, and carbon footprint',
    category: 'Energy',
    lastGenerated: '2024-01-10',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-005',
    name: 'Sales Performance',
    description: 'Revenue, profit margins, top customers, and order analysis',
    category: 'Sales',
    lastGenerated: '2024-01-15',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-006',
    name: 'Worker Productivity',
    description: 'Attendance, performance metrics, and overtime analysis',
    category: 'HR',
    lastGenerated: '2024-01-14',
    format: ['PDF', 'Excel'],
  },
  {
    id: 'RPT-007',
    name: 'AI Insights Report',
    description: 'AI-generated recommendations, predictions, and risk analysis',
    category: 'AI',
    lastGenerated: '2024-01-15',
    format: ['PDF'],
  },
  {
    id: 'RPT-008',
    name: 'Weekly Executive Summary',
    description: 'Comprehensive overview of all factory operations',
    category: 'Executive',
    lastGenerated: '2024-01-14',
    format: ['PDF'],
  },
];

const recentReports = [
  {
    id: 'RPT-001-2024-01-15',
    name: 'Production Summary',
    generatedBy: 'System',
    generatedAt: '2024-01-15 09:00',
    format: 'PDF',
    size: '2.4 MB',
  },
  {
    id: 'RPT-005-2024-01-15',
    name: 'Sales Performance',
    generatedBy: 'Mr. Kumar',
    generatedAt: '2024-01-15 10:30',
    format: 'Excel',
    size: '1.8 MB',
  },
  {
    id: 'RPT-007-2024-01-15',
    name: 'AI Insights Report',
    generatedBy: 'AI System',
    generatedAt: '2024-01-15 08:00',
    format: 'PDF',
    size: '3.2 MB',
  },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Reports</h1>
            <p className="text-[#6B7280]">Generate and download factory reports</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <FileText className="w-4 h-4 mr-2" />
            Create Custom Report
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#1F3A5F]/10 rounded-lg">
                <Download className="w-5 h-5 text-[#1F3A5F]" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A1A]">Download PDF</p>
                <p className="text-sm text-[#6B7280]">Export as PDF</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#2E8B57]/10 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-[#2E8B57]" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A1A]">Download Excel</p>
                <p className="text-sm text-[#6B7280]">Export as Excel</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#4F6D7A]/10 rounded-lg">
                <Printer className="w-5 h-5 text-[#4F6D7A]" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A1A]">Print Report</p>
                <p className="text-sm text-[#6B7280]">Print directly</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#F4B400]/10 rounded-lg">
                <Mail className="w-5 h-5 text-[#F4B400]" />
              </div>
              <div>
                <p className="font-medium text-[#1A1A1A]">Email Report</p>
                <p className="text-sm text-[#6B7280]">Send via email</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Report Templates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Report Templates</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-[#1F3A5F]/10 rounded-lg">
                    <FileText className="w-4 h-4 text-[#1F3A5F]" />
                  </div>
                  <span className="text-xs text-[#6B7280]">{template.category}</span>
                </div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">{template.name}</h3>
                <p className="text-sm text-[#6B7280] mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">Last: {template.lastGenerated}</span>
                  <div className="flex space-x-1">
                    {template.format.map((fmt) => (
                      <span key={fmt} className="text-xs px-2 py-1 bg-[#F8F9FA] rounded text-[#6B7280]">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Generate
                </Button>
              </Card>
            ))}
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Recent Reports</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Report ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Generated By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Generated At</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Format</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{report.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{report.name}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{report.generatedBy}</td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{report.generatedAt}</td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2 py-1 bg-[#F8F9FA] rounded text-[#6B7280]">
                        {report.format}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{report.size}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Schedule Report */}
        <Card className="p-6 bg-gradient-to-r from-[#1F3A5F]/5 to-[#4F6D7A]/5 border-l-4 border-l-[#1F3A5F]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#1F3A5F]/10 rounded-lg">
              <Calendar className="w-6 h-6 text-[#1F3A5F]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">Schedule Automated Reports</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Set up automatic report generation and delivery to your inbox daily, weekly, or monthly.
              </p>
              <Button variant="outline" size="sm">
                Configure Schedule
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
