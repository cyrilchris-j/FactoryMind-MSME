'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Cpu
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Manager {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  machineNumber: number | null;
  created_at: string;
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Manager State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    machineNumber: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/managers');
      const data = (res?.data ?? []).map((d: any) => ({
        id: d.id,
        full_name: d.name || '',
        email: d.email || '',
        role: d.role || '',
        department: d.department || 'Unassigned',
        machineNumber: d.machineNumber ?? null,
        created_at: d.createdAt || '',
      }));
      const filtered = search
        ? data.filter((m: any) => m.full_name.toLowerCase().includes(search.toLowerCase()))
        : data;
      setManagers(filtered);
    } catch (err) {
      console.error('Failed to fetch managers', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await apiPost('/api/managers', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', department: '', machineNumber: '' });
      fetchManagers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Managers</h1>
            <p className="text-muted">Manage department heads and their access</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchManagers} disabled={loading} className="border-border">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Manager
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="search"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="border-border h-10">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            Loading managers...
          </div>
        ) : managers.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <Users className="w-12 h-12 mx-auto mb-4 text-border" />
            <h3 className="text-lg font-medium text-foreground">No Managers Found</h3>
            <p>You haven't added any managers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((manager) => (
              <Card key={manager.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {manager.full_name.charAt(0)}
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {manager.full_name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" />
                    {manager.department} Department
                  </div>
                  {manager.machineNumber && (
                    <div className="flex items-center">
                      <Cpu className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                      Machine {manager.machineNumber}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted">
                    <Mail className="w-4 h-4 mr-2 text-secondary" />
                    {manager.email}
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <Phone className="w-4 h-4 mr-2 text-secondary" />
                    +91 98765 43210
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">Add New Manager</h2>
            {errorMsg && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Machine Number</label>
                  <input
                    type="number"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.machineNumber}
                    onChange={e => setFormData({ ...formData, machineNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Manager'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
