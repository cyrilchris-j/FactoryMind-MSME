'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Save, Loader2, CheckCircle2, AlertCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/components/auth/auth-provider';

export default function OrdersManagerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const qty = parseInt(form.get('quantity') as string) || 0;
    const payload = {
      orderNumber: form.get('orderNumber'),
      customerName: form.get('customerName'),
      productId: form.get('productId') || '',
      productName: 'Automotive Brake Assembly',
      quantity: qty,
      dueDate: form.get('dueDate'),
      priority: form.get('priority'),
      notes: form.get('notes') || '',
    };
    try {
      await apiPost('/api/customer-orders', payload);
      showToast('success', `Order ${payload.orderNumber} created for ${qty} Brake Assemblies!`);
      formRef.current?.reset();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create order');
    }
    setLoading(false);
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="outline" size="icon" className="border-border"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Entry</h1>
            <p className="text-sm text-muted">Create customer orders for Brake Assemblies</p>
          </div>
        </div>

        <Card className="p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-foreground">New Customer Order</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Order Number</Label>
                <Input name="orderNumber" placeholder="e.g. ORD-2026-004" required />
              </div>
              <div className="space-y-1.5">
                <Label>Customer Name</Label>
                <Input name="customerName" placeholder="e.g. Apex Mobility Systems" required />
              </div>
              <div className="space-y-1.5">
                <Label>Product</Label>
                <Input value="Automotive Brake Assembly" disabled className="bg-gray-50" />
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" name="quantity" min="1" placeholder="e.g. 250" required />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" name="dueDate" required />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select name="priority" required>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="LOW">Low</option>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <textarea name="notes" rows={2}
                  className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  placeholder="Order notes..." />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" disabled={loading} className="bg-primary text-white px-8">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Save className="w-4 h-4 mr-2" /> Create Order</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
