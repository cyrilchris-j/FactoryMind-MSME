'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

const machines = [
  {
    id: 'M-001',
    name: 'CNC-01',
    type: 'CNC Machine',
    healthScore: 92,
    status: 'running',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-02-10',
    uptime: '98.5%',
  },
  {
    id: 'M-002',
    name: 'CNC-02',
    type: 'CNC Machine',
    healthScore: 88,
    status: 'running',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    uptime: '96.2%',
  },
  {
    id: 'M-003',
    name: 'CNC-03',
    type: 'CNC Machine',
    healthScore: 75,
    status: 'maintenance',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-01-20',
    uptime: '89.1%',
  },
  {
    id: 'M-004',
    name: 'CNC-04',
    type: 'CNC Machine',
    healthScore: 65,
    status: 'warning',
    lastMaintenance: '2023-12-20',
    nextMaintenance: '2024-01-18',
    uptime: '82.3%',
  },
  {
    id: 'M-005',
    name: 'HVAC-02',
    type: 'HVAC System',
    healthScore: 45,
    status: 'critical',
    lastMaintenance: '2023-11-15',
    nextMaintenance: '2024-01-16',
    uptime: '78.5%',
  },
];

const maintenanceSchedule = [
  {
    id: 'MS-001',
    machine: 'CNC-04',
    type: 'Preventive',
    priority: 'high',
    scheduledDate: '2024-01-18',
    technician: 'Rajesh Kumar',
    estimatedDuration: '4 hours',
  },
  {
    id: 'MS-002',
    machine: 'HVAC-02',
    type: 'Emergency',
    priority: 'critical',
    scheduledDate: '2024-01-16',
    technician: 'Suresh Patel',
    estimatedDuration: '6 hours',
  },
  {
    id: 'MS-003',
    machine: 'CNC-03',
    type: 'Corrective',
    priority: 'medium',
    scheduledDate: '2024-01-20',
    technician: 'Amit Singh',
    estimatedDuration: '3 hours',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    running: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    maintenance: 'bg-[#F4B400]/10 text-[#F4B400]',
    warning: 'bg-[#F4B400]/10 text-[#F4B400]',
    critical: 'bg-[#D93025]/10 text-[#D93025]',
    offline: 'bg-[#6B7280]/10 text-[#6B7280]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-[#2E8B57]';
  if (score >= 60) return 'text-[#F4B400]';
  return 'text-[#D93025]';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-[#D93025]/10 text-[#D93025]',
    high: 'bg-[#F4B400]/10 text-[#F4B400]',
    medium: 'bg-[#4F6D7A]/10 text-[#4F6D7A]',
    low: 'bg-[#2E8B57]/10 text-[#2E8B57]',
  };
  return colors[priority] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function MaintenancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Maintenance</h1>
            <p className="text-[#6B7280]">Monitor machine health and schedule maintenance</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73] w-full sm:w-auto">
            <Wrench className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">89/100</p>
            <p className="text-sm text-[#6B7280]">Average Health Score</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-[#D93025]" />
              <span className="text-sm text-[#D93025] flex items-center">
                2
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">2</p>
            <p className="text-sm text-[#6B7280]">Critical Issues</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-[#4F6D7A]" />
              <span className="text-sm text-[#4F6D7A]">
                This Week
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">5</p>
            <p className="text-sm text-[#6B7280]">Scheduled Maintenance</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">91.2%</p>
            <p className="text-sm text-[#6B7280]">Overall Uptime</p>
          </Card>
        </div>

        {/* Machines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => (
            <Card key={machine.id} className="p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{machine.name}</h3>
                  <p className="text-sm text-[#6B7280]">{machine.type}</p>
                </div>
                <Badge className={getStatusColor(machine.status)}>
                  {machine.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Health Score</span>
                  <span className={`text-lg font-bold font-numbers ${getHealthScoreColor(machine.healthScore)}`}>
                    {machine.healthScore}/100
                  </span>
                </div>
                
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      machine.healthScore >= 80 ? 'bg-[#2E8B57]' :
                      machine.healthScore >= 60 ? 'bg-[#F4B400]' : 'bg-[#D93025]'
                    }`}
                    style={{ width: `${machine.healthScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#6B7280]">Uptime:</span>
                    <span className="ml-1 font-medium text-[#1A1A1A]">{machine.uptime}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Next:</span>
                    <span className="ml-1 font-medium text-[#1A1A1A]">{machine.nextMaintenance}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </Card>
          ))}
        </div>

        {/* Maintenance Schedule */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Upcoming Maintenance</h2>
            <Button variant="outline" size="sm">
              View Calendar
            </Button>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Schedule ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Machine</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Scheduled Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Technician</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceSchedule.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{schedule.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{schedule.machine}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{schedule.type}</td>
                    <td className="py-4 px-4">
                      <Badge className={getPriorityColor(schedule.priority)}>
                        {schedule.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{schedule.scheduledDate}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{schedule.technician}</td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{schedule.estimatedDuration}</td>
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
        <Card className="p-6 bg-gradient-to-r from-[#D93025]/5 to-[#F4B400]/5 border-l-4 border-l-[#D93025]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#D93025]/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#D93025]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Failure Prediction</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                <strong>HVAC-02</strong> has a 78% probability of failure within the next 48 hours. Immediate maintenance recommended.
              </p>
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Risk Level:</span>
                  <span className="ml-2 font-medium text-[#D93025]">Critical</span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Estimated Cost:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A]">₹25,000</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-[#D93025] text-[#D93025] hover:bg-[#D93025] hover:text-white">
              Schedule Now
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
