'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Users, Settings, Bell, Shield, Download, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <OwnerLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Factory Settings</h1>
          <p className="text-[#666666]">Manage users, roles, and factory preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 space-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users' ? 'bg-foreground text-white' : 'text-[#666666] hover:bg-background'
              }`}
            >
              <Users className="w-4 h-4" /> User Management
            </button>
            <button
              onClick={() => setActiveTab('factory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'factory' ? 'bg-foreground text-white' : 'text-[#666666] hover:bg-background'
              }`}
            >
              <Settings className="w-4 h-4" /> Factory Profile
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'alerts' ? 'bg-foreground text-white' : 'text-[#666666] hover:bg-background'
              }`}
            >
              <Bell className="w-4 h-4" /> Alert Thresholds
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'users' && (
              <Card className="p-6 border-0 shadow-sm rounded-xl bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Team Members</h2>
                    <p className="text-sm text-[#666666]">Invite users and assign role-based access.</p>
                  </div>
                  <Button className="bg-foreground hover:bg-[#333333] text-white">
                    + Invite User
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#666666] uppercase bg-background border-y border-[#E5E5E5]">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Department</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      <tr>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                              AK
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Arun Kumar</p>
                              <p className="text-xs text-[#666666]">arun@factorymind.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1 w-max">
                            <Shield className="w-3 h-3" /> OWNER
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#666666]">All Departments</td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-[#666666]">Edit</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                              SR
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Suresh Raj</p>
                              <p className="text-xs text-[#666666]">suresh@factorymind.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            MANAGER
                          </span>
                        </td>
                        <td className="px-4 py-4 text-foreground">Production</td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-[#666666]">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 border-t border-[#E5E5E5] pt-8">
                   <h3 className="text-md font-bold text-foreground mb-4">Export Factory Directory</h3>
                   <p className="text-sm text-[#666666] mb-4">Download a full CSV of all active employees and their role assignments.</p>
                   <Button variant="outline" className="border-[#E5E5E5] text-foreground">
                     <Download className="w-4 h-4 mr-2" /> Export to CSV
                   </Button>
                </div>
              </Card>
            )}

            {activeTab !== 'users' && (
              <Card className="p-12 border-0 shadow-sm rounded-xl bg-white text-center text-[#666666]">
                <p>This settings panel is coming soon.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
