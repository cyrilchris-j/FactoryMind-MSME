'use client';

import { ManagerLayout } from '@/components/layout/manager-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/auth-provider';
import {
  Package, AlertTriangle, CheckCircle2, RefreshCw,
  Plus, Loader2, TrendingUp, ArrowUpCircle, Target
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

const COMPONENT_NAMES: Record<string, string> = {
  BRAKE_DISC: 'Brake Disc',
  BRAKE_CALIPER: 'Brake Caliper',
  BRAKE_PAD: 'Brake Pad',
  PISTON: 'Piston',
  CALIPER_BRACKET: 'Caliper Bracket',
  GUIDE_PIN: 'Guide Pin',
  SEAL_RING: 'Seal Ring',
  DUST_BOOT: 'Dust Boot',
  BOLT_KIT: 'Bolt Kit',
  WEAR_SENSOR: 'Wear Sensor',
};

const BOM_QTY: Record<string, number> = {
  BRAKE_DISC: 1,
  BRAKE_CALIPER: 1,
  BRAKE_PAD: 2,
  PISTON: 1,
  CALIPER_BRACKET: 1,
  GUIDE_PIN: 2,
  SEAL_RING: 1,
  DUST_BOOT: 1,
  BOLT_KIT: 1,
  WEAR_SENSOR: 1,
};

interface ComponentData {
  id: string;
  componentCode: string;
  componentName: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  category: string;
}

export default function MyComponentPage() {
  const { user } = useAuth();
  const componentCode = user?.componentCode || '';

  const [component, setComponent] = useState<ComponentData | null>(null);
  const [allComponents, setAllComponents] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addQty, setAddQty] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const componentName = COMPONENT_NAMES[componentCode] || componentCode;
  const bomQty = BOM_QTY[componentCode] || 1;

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/components');
      const all = (res?.data ?? []).map((c: any) => ({
        id: c.id || '',
        componentCode: c.componentCode || c.materialCode || '',
        componentName: c.componentName || c.materialName || '',
        currentStock: Number(c.currentStock || c.availableQuantity || 0),
        minimumStock: Number(c.minimumStock || c.minStock || 10),
        unit: c.unit || 'pcs',
        category: c.category || '',
      }));
      setAllComponents(all);
      const mine = all.find((c: any) =>
        c.componentCode === componentCode ||
        c.componentName?.toUpperCase().replace(/\s+/g, '_') === componentCode ||
        c.componentName === componentName
      );
      setComponent(mine || null);
    } catch {
      showToast('error', 'Failed to load component data');
    }
    setLoading(false);
  }, [componentCode, componentName]);

  useEffect(() => {
    if (componentCode) fetchData();
  }, [componentCode, fetchData]);

  const handleAddStock = async () => {
    const qty = parseInt(addQty);
    if (!qty || qty <= 0) return;
    setAdding(true);
    try {
      await apiPost('/api/components/batch-update', {
        records: [{
          component_code: componentCode,
          component_name: componentName,
          current_stock: (component?.currentStock || 0) + qty,
          incoming_quantity: qty,
        }]
      });
      showToast('success', `Added ${qty} ${component?.unit || 'pcs'} to ${componentName}`);
      setAddQty('');
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add stock');
    }
    setAdding(false);
  };

  if (!componentCode) {
    return (
      <ManagerLayout>
        <div className="p-6 text-center text-muted">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
          <p>No component assigned to your account. Contact the factory owner.</p>
        </div>
      </ManagerLayout>
    );
  }

  const shortage = component ? Math.max(0, bomQty - component.currentStock) : 0;
  const isReady = component ? component.currentStock >= bomQty : false;
  const maxBuildable = component ? Math.floor(component.currentStock / bomQty) : 0;

  return (
    <ManagerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{componentName}</h1>
            </div>
            <p className="text-sm text-muted mt-1">Component Code: {componentCode} · BOM Qty: ×{bomQty} per assembly</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading component data...
          </div>
        ) : !component ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">Component Not Found</p>
            <p className="text-sm text-muted mt-1">No data found for {componentName} in the database.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-2xl font-bold font-numbers text-foreground">{component.currentStock}</p>
                <p className="text-xs text-muted">Current Stock ({component.unit})</p>
              </Card>
              <Card className="p-4">
                <p className={`text-2xl font-bold font-numbers ${isReady ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isReady ? 'Ready' : shortage}
                </p>
                <p className="text-xs text-muted">{isReady ? 'Sufficient Stock' : 'Shortage (pcs)'}</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold font-numbers text-primary">{maxBuildable}</p>
                <p className="text-xs text-muted">Max Buildable Assemblies</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold font-numbers text-amber-600">{component.minimumStock}</p>
                <p className="text-xs text-muted">Reorder Level</p>
              </Card>
            </div>

            <Card className="p-5">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-primary" /> Add Stock
              </h2>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Quantity to add ({component.unit})</label>
                  <Input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={e => setAddQty(e.target.value)}
                    placeholder="Enter quantity..."
                  />
                </div>
                <Button onClick={handleAddStock} disabled={adding || !addQty || parseInt(addQty) <= 0}
                  className="bg-primary text-white">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Stock
                </Button>
              </div>
            </Card>

            {/* All components reference */}
            <Card className="p-5">
              <h2 className="text-base font-bold text-foreground mb-4">All BOM Components</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {allComponents.map(c => {
                  const isMine = c.componentCode === componentCode;
                  return (
                    <div key={c.id || c.componentCode}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isMine ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/30' : 'bg-gray-50 border-border'
                      }`}>
                      <p className="text-xs font-semibold text-foreground truncate">{c.componentName}</p>
                      <p className={`text-lg font-bold font-numbers ${isMine ? 'text-primary' : 'text-muted'}`}>
                        {c.currentStock}
                      </p>
                      <p className="text-[10px] text-muted">{c.unit}</p>
                      {isMine && <span className="text-[10px] text-primary font-semibold">Your Component</span>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </ManagerLayout>
  );
}
