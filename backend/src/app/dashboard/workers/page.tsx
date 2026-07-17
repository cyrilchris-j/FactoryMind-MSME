'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Award
} from 'lucide-react';

const workers = [
  {
    id: 'W-001',
    name: 'Ramesh Kumar',
    department: 'Production',
    role: 'Machine Operator',
    attendance: 95,
    productivity: 92,
    overtime: 14,
    status: 'present',
    shift: 'Morning (6AM-2PM)',
  },
  {
    id: 'W-002',
    name: 'Suresh Patel',
    department: 'Maintenance',
    role: 'Technician',
    attendance: 98,
    productivity: 88,
    overtime: 8,
    status: 'present',
    shift: 'Day (8AM-4PM)',
  },
  {
    id: 'W-003',
    name: 'Amit Singh',
    department: 'Production',
    role: 'Machine Operator',
    attendance: 92,
    productivity: 85,
    overtime: 20,
    status: 'present',
    shift: 'Evening (2PM-10PM)',
  },
  {
    id: 'W-004',
    name: 'Priya Sharma',
    department: 'Quality Control',
    role: 'Inspector',
    attendance: 96,
    productivity: 94,
    overtime: 5,
    status: 'leave',
    shift: 'Morning (6AM-2PM)',
  },
  {
    id: 'W-005',
    name: 'Vijay Kumar',
    department: 'Production',
    role: 'Machine Operator',
    attendance: 88,
    productivity: 78,
    overtime: 25,
    status: 'present',
    shift: 'Night (10PM-6AM)',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    present: 'bg-[#2E8B57]/10 text-[#2E8B57]',
    absent: 'bg-[#D93025]/10 text-[#D93025]',
    leave: 'bg-[#F4B400]/10 text-[#F4B400]',
  };
  return colors[status] || 'bg-[#4F6D7A]/10 text-[#4F6D7A]';
};

export default function WorkersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Workers</h1>
            <p className="text-[#6B7280]">Manage workforce and attendance</p>
          </div>
          <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
            <Users className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">100</p>
            <p className="text-sm text-[#6B7280]">Total Workers</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-[#2E8B57]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">94%</p>
            <p className="text-sm text-[#6B7280]">Attendance Today</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-[#1F3A5F]" />
              <span className="text-sm text-[#2E8B57] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">87.5%</p>
            <p className="text-sm text-[#6B7280]">Avg Productivity</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[#F4B400]" />
              <span className="text-sm text-[#D93025] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A] font-numbers">145</p>
            <p className="text-sm text-[#6B7280]">Overtime Hours</p>
          </Card>
        </div>

        {/* Workers Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Worker Directory</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Worker ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Productivity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Overtime</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Shift</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA]">
                    <td className="py-4 px-4 text-sm font-medium text-[#1A1A1A]">{worker.id}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{worker.name}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{worker.department}</td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A]">{worker.role}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#E5E7EB] rounded-full h-2 w-16">
                          <div
                            className="bg-[#2E8B57] h-2 rounded-full"
                            style={{ width: `${worker.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#6B7280] font-numbers">{worker.attendance}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#E5E7EB] rounded-full h-2 w-16">
                          <div
                            className="bg-[#1F3A5F] h-2 rounded-full"
                            style={{ width: `${worker.productivity}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#6B7280] font-numbers">{worker.productivity}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#1A1A1A] font-numbers">{worker.overtime}h</td>
                    <td className="py-4 px-4 text-sm text-[#6B7280]">{worker.shift}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(worker.status)}>
                        {worker.status}
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

        {/* AI Alert Card */}
        <Card className="p-6 bg-gradient-to-r from-[#F4B400]/5 to-[#D93025]/5 border-l-4 border-l-[#F4B400]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#F4B400]/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#F4B400]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">AI Workload Alert</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                <strong>Vijay Kumar (W-005)</strong> is overloaded with 25 overtime hours this week. Risk of fatigue-related errors increased by 35%.
              </p>
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-[#6B7280]">Recommendation:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A]">Redistribute 3 tasks to available workers</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Take Action
            </Button>
          </div>
        </Card>

        {/* Shift Planning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Morning Shift (6AM-2PM)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Scheduled</span>
                <span className="font-medium text-[#1A1A1A]">35 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Present</span>
                <span className="font-medium text-[#2E8B57]">34 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Absent</span>
                <span className="font-medium text-[#D93025]">1 worker</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Day Shift (8AM-4PM)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Scheduled</span>
                <span className="font-medium text-[#1A1A1A]">40 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Present</span>
                <span className="font-medium text-[#2E8B57]">38 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">On Leave</span>
                <span className="font-medium text-[#F4B400]">2 workers</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Night Shift (10PM-6AM)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Scheduled</span>
                <span className="font-medium text-[#1A1A1A]">25 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Present</span>
                <span className="font-medium text-[#2E8B57]">23 workers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B7280]">Absent</span>
                <span className="font-medium text-[#D93025]">2 workers</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
