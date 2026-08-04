'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Mail,
  Building2,
  MoreVertical,
  Loader2,
  RefreshCw,
  Search,
  Cpu,
  KeyRound,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

interface Manager {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  machineNumber: number | null;
  created_at: string;
}

type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toast
  const [toast, setToast] = useState<ToastState>(null);

  // Add Manager State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    machineNumber: '',
  });
  const [formError, setFormError] = useState('');

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<Manager | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Password Modal
  const [pwTarget, setPwTarget] = useState<Manager | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      await apiPost('/api/managers', formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', password: '', department: '', machineNumber: '' });
      showToast('success', 'Manager added successfully!');
      fetchManagers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/managers/${deleteTarget.id}`);
      setDeleteTarget(null);
      showToast('success', `${deleteTarget.full_name} has been removed.`);
      fetchManagers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove manager');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTarget) return;
    setPwError('');
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    setIsChangingPw(true);
    try {
      await apiPatch(`/api/managers/${pwTarget.id}/password`, { password: newPassword });
      setPwTarget(null);
      setNewPassword('');
      showToast('success', `Password changed for ${pwTarget.full_name}`);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
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
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Manager
            </Button>
          </div>
        </div>

        {/* Search */}
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
        </div>

        {/* Manager Grid */}
        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            Loading managers...
          </div>
        ) : managers.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <Users className="w-12 h-12 mx-auto mb-4 text-border" />
            <h3 className="text-lg font-medium text-foreground">No Managers Found</h3>
            <p>You haven&apos;t added any managers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managers.map((manager) => (
              <Card key={manager.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {manager.full_name.charAt(0)}
                  </div>
                  {/* Dropdown Menu */}
                  <div className="relative" ref={openMenuId === manager.id ? menuRef : undefined}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted"
                      onClick={() => setOpenMenuId(openMenuId === manager.id ? null : manager.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    {openMenuId === manager.id && (
                      <div className="absolute right-0 top-9 z-50 w-48 bg-white border border-border rounded-xl shadow-lg py-1 text-sm">
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-background text-foreground"
                          onClick={() => { setPwTarget(manager); setOpenMenuId(null); }}
                        >
                          <KeyRound className="w-4 h-4 text-blue-500" />
                          Change Password
                        </button>
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                          onClick={() => { setDeleteTarget(manager); setOpenMenuId(null); }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Manager
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {manager.full_name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted mb-4 flex-wrap">
                  {manager.department && manager.department !== 'Unassigned' && (
                    <div className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      {manager.department} Department
                    </div>
                  )}
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
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => setPwTarget(manager)}
                    >
                      <KeyRound className="w-3 h-3 mr-1" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setDeleteTarget(manager)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-muted hover:text-foreground"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Manager</h2>
            {formError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{formError}</div>}

            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text" required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email" required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password" required minLength={6}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text" required
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
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Manager'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Remove Manager</h2>
              <p className="text-sm text-muted mb-1">
                Are you sure you want to remove <strong>{deleteTarget.full_name}</strong>?
              </p>
              <p className="text-xs text-red-500 mb-6">
                This will permanently delete their account and revoke all access.
              </p>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteManager}
                  disabled={isDeleting}
                >
                  {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removing...</> : 'Yes, Remove'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              className="absolute top-4 right-4 text-muted hover:text-foreground"
              onClick={() => { setPwTarget(null); setNewPassword(''); setPwError(''); }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Change Password</h2>
                <p className="text-xs text-muted">{pwTarget.full_name}</p>
              </div>
            </div>
            {pwError && <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded">{pwError}</div>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setPwTarget(null); setNewPassword(''); setPwError(''); }}
                  disabled={isChangingPw}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isChangingPw}
                >
                  {isChangingPw ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
