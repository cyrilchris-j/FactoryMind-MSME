'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building2, Phone, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const Layout = user?.role === 'MANAGER' ? ManagerLayout : OwnerLayout;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;

    if (user?.id) {
      try {
        await updateDoc(doc(db, 'users', user.id), { name: fullName });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to update profile', err);
      }
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-1 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'User'}</h2>
              <p className="text-muted">{user.role}</p>
            </div>
            <div className="w-full pt-4 border-t border-border">
              <div className="flex items-center text-sm text-muted mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                {user.department || 'All Departments'}
              </div>
              <div className="flex items-center text-sm text-muted">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>

            {success && (
              <div className="mb-6 p-3 bg-green-50 text-green-700 flex items-center rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Profile updated successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <Input id="fullName" name="fullName" defaultValue={user?.name || ''} className="pl-9" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <Input id="email" defaultValue={user.email} className="pl-9 bg-gray-50 text-gray-500" disabled />
                  </div>
                  <p className="text-xs text-muted">Email cannot be changed.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <Input id="phone" defaultValue="+91 98765 43210" className="pl-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                    <Input id="department" defaultValue={user.department || 'All Departments'} className="pl-9 bg-gray-50 text-gray-500" disabled />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
