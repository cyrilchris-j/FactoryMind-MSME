'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2, 
  Users, 
  Bot, 
  Key,
  Database,
  Bell,
  Shield,
  Save,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Settings</h1>
            <p className="text-[#6B7280]">Manage your factory and account settings</p>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-2 border-b border-[#E5E7EB] pb-4">
          <Button variant="outline" size="sm" className="bg-[#1F3A5F] text-white border-[#1F3A5F]">
            <Building2 className="w-4 h-4 mr-2" />
            Company Profile
          </Button>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Users & Roles
          </Button>
          <Button variant="outline" size="sm">
            <Bot className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
          <Button variant="outline" size="sm">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>

        {/* Company Profile */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Company Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Kumar Manufacturing Ltd." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" defaultValue="Automotive Components" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Industrial Area, Chennai, Tamil Nadu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="contact@kumarmfg.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" defaultValue="33AAAAA0000A1Z5" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Factory Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Factory Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalMachines">Total Machines</Label>
              <Input id="totalMachines" defaultValue="50" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalWorkers">Total Workers</Label>
              <Input id="totalWorkers" defaultValue="100" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shiftsPerDay">Shifts Per Day</Label>
              <Input id="shiftsPerDay" defaultValue="3" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours">Working Hours/Shift</Label>
              <Input id="workingHours" defaultValue="8" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Daily Capacity (units)</Label>
              <Input id="capacity" defaultValue="3000" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Kolkata" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* AI Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bot className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">AI Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="aiModel">AI Model</Label              >
              <select id="aiModel" className="w-full mt-2 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                <option>Gemini Pro</option>
                <option>Gemini Ultra</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
              <div>
                <p className="font-medium text-[#1A1A1A]">Auto-generate Insights</p>
                <p className="text-sm text-[#6B7280]">Automatically generate AI insights daily</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#E5E7EB]" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
              <div>
                <p className="font-medium text-[#1A1A1A]">Predictive Alerts</p>
                <p className="text-sm text-[#6B7280]">Send alerts for predicted issues</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#E5E7EB]" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
              <div>
                <p className="font-medium text-[#1A1A1A]">Natural Language Queries</p>
                <p className="text-sm text-[#6B7280]">Enable AI Copilot chat interface</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[#E5E7EB]" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-[#1F3A5F] hover:bg-[#2A4A73]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Data Export */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Database className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Data Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#E5E7EB] rounded-lg">
              <h3 className="font-medium text-[#1A1A1A] mb-2">Export All Data</h3>
              <p className="text-sm text-[#6B7280] mb-4">Download all factory data in JSON format</p>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
            <div className="p-4 border border-[#E5E7EB] rounded-lg">
              <h3 className="font-medium text-[#1A1A1A] mb-2">Clear Cache</h3>
              <p className="text-sm text-[#6B7280] mb-4">Clear application cache and temporary files</p>
              <Button variant="outline" size="sm">
                Clear Cache
              </Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-[#1F3A5F]" />
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
              <div>
                <p className="font-medium text-[#1A1A1A]">Two-Factor Authentication</p>
                <p className="text-sm text-[#6B7280]">Add an extra layer of security</p>
              </div>
              <Badge className="bg-[#F4B400]/10 text-[#F4B400]">Disabled</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg">
              <div>
                <p className="font-medium text-[#1A1A1A]">Active Sessions</p>
                <p className="text-sm text-[#6B7280]">Manage your active login sessions</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#D93025]/5 border border-[#D93025]/20 rounded-lg">
              <div>
                <p className="font-medium text-[#D93025]">Danger Zone</p>
                <p className="text-sm text-[#6B7280]">Permanently delete your account and data</p>
              </div>
              <Button variant="outline" size="sm" className="border-[#D93025] text-[#D93025] hover:bg-[#D93025] hover:text-white">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="font-medium text-[#1A1A1A]">Sign Out</p>
                <p className="text-sm text-[#6B7280]">Sign out of your account</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#D93025] text-[#D93025] hover:bg-[#D93025] hover:text-white">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
