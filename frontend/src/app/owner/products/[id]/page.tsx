'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, ArrowLeft, RefreshCw, Loader2, AlertTriangle, CheckCircle2, XCircle, TrendingDown
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BOMCalcItem {
  componentId: string;
  componentName: string;
  componentCode: string;
  requiredPerProduct: number;
  totalRequired: number;
  currentStock: number;
  reservedStock: number;
  availableForProduction: number;
  shortage: number;
  possibleWithCurrent: number;
  status: string;
  unit: string;
  supplier: string;
  leadTimeDays: number;
}

interface BOMIntelligence {
  orderQuantity: number;
  maxBuildable: number;
  shortfall: number;
  primaryConstraint: string;
  constraintComponentCode: string;
  overallStatus: string;
  calculations: BOMCalcItem[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [bomIntelligence, setBomIntelligence] = useState<BOMIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQty, setOrderQty] = useState(250);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, bomRes] = await Promise.all([
        apiGet(`/api/products/${productId}`) as any,
        apiGet(`/api/bom-intelligence/${productId}?orderQty=${orderQty}`) as any,
      ]);
      setProduct(prodRes);
      setBomIntelligence(bomRes);
    } catch (err) {
      console.error('Failed to fetch product', err);
    }
    setLoading(false);
  }, [productId, orderQty]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      READY: 'bg-accent/10 text-accent',
      LOW: 'bg-warning/10 text-warning',
      CRITICAL: 'bg-[#D93025]/10 text-danger',
      'OUT OF STOCK': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-muted/10 text-muted';
  };

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      READY: 'text-accent bg-accent/10',
      PARTIAL: 'text-warning bg-warning/10',
      CRITICAL: 'text-danger bg-[#D93025]/10',
    };
    return colors[status] || 'text-muted bg-muted/10';
  };

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/owner/products">
              <Button variant="outline" size="icon" className="border-border">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {loading ? 'Loading...' : product?.product?.productName}
                </h1>
              </div>
              <p className="text-muted">{product?.product?.productCode || 'Loading...'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading product data...
          </div>
        ) : !product ? (
          <div className="py-20 text-center text-muted">Product not found.</div>
        ) : (
          <>
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <p className="text-xs text-muted mb-1">Product Code</p>
                <p className="text-lg font-bold text-foreground">{product.product?.productCode || '-'}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-muted mb-1">Category</p>
                <p className="text-lg font-bold text-foreground">{product.product?.category || '-'}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-muted mb-1">Status</p>
                <Badge className={product.product?.isActive ? 'bg-accent/10 text-accent' : 'bg-muted/10 text-muted'}>
                  {product.product?.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-muted mb-1">Unit</p>
                <p className="text-lg font-bold text-foreground">{product.product?.unit || '-'}</p>
              </Card>
            </div>

            {/* BOM Intelligence */}
            {bomIntelligence && (
              <>
                {/* Order Quantity Input */}
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-foreground">Calculate for Order Quantity:</label>
                    <input
                      type="number"
                      value={orderQty}
                      onChange={(e) => setOrderQty(parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min={0}
                    />
                    <Button variant="outline" size="sm" onClick={fetchData} className="border-border">
                      Calculate
                    </Button>
                  </div>
                </Card>

                {/* Production Readiness */}
                <Card className="p-6 border-2 border-warning/30 bg-warning/[0.02]">
                  <h2 className="text-lg font-semibold text-foreground mb-4">PRODUCTION READINESS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted mb-1">Order Quantity</p>
                      <p className="text-2xl font-bold text-foreground">{bomIntelligence.orderQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Buildable Now</p>
                      <p className={`text-2xl font-bold ${bomIntelligence.maxBuildable >= bomIntelligence.orderQuantity ? 'text-accent' : 'text-danger'}`}>
                        {bomIntelligence.maxBuildable}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Shortfall</p>
                      <p className="text-2xl font-bold text-danger">{bomIntelligence.shortfall}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Primary Constraint</p>
                      <p className="text-lg font-bold text-warning">{bomIntelligence.primaryConstraint}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-sm text-muted">Overall Status:</p>
                    <Badge className={getOrderStatusColor(bomIntelligence.overallStatus)}>
                      {bomIntelligence.overallStatus === 'PARTIAL' ? 'PARTIALLY AVAILABLE' : bomIntelligence.overallStatus}
                    </Badge>
                  </div>
                </Card>

                {/* Maximum Buildable Card */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">MATERIAL READINESS</h2>
                  <p className="text-sm text-muted mb-4">
                    Based on current inventory of {bomIntelligence.orderQuantity} ordered units:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-background">
                          <th className="text-left py-3 px-3 font-medium text-muted">Component</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Required / Product</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Total Required</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Available Stock</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Reserved</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Available for Production</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Shortage</th>
                          <th className="text-right py-3 px-3 font-medium text-muted">Possible Units</th>
                          <th className="text-left py-3 px-3 font-medium text-muted">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bomIntelligence.calculations.map((calc, idx) => (
                          <tr key={idx} className={`border-b border-border hover:bg-background ${
                            calc.possibleWithCurrent === bomIntelligence.maxBuildable && calc.shortage > 0
                              ? 'bg-red-50'
                              : ''
                          }`}>
                            <td className="py-3 px-3 font-medium text-foreground">{calc.componentName}</td>
                            <td className="py-3 px-3 text-right font-numbers">{calc.requiredPerProduct}</td>
                            <td className="py-3 px-3 text-right font-numbers">{calc.totalRequired.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-numbers">{calc.currentStock.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-numbers">{calc.reservedStock.toLocaleString()}</td>
                            <td className={`py-3 px-3 text-right font-numbers ${
                              calc.availableForProduction < calc.totalRequired ? 'text-danger' : 'text-accent'
                            }`}>
                              {calc.availableForProduction.toLocaleString()}
                            </td>
                            <td className={`py-3 px-3 text-right font-numbers ${
                              calc.shortage > 0 ? 'text-danger font-bold' : 'text-accent'
                            }`}>
                              {calc.shortage > 0 ? calc.shortage.toLocaleString() : '0'}
                            </td>
                            <td className="py-3 px-3 text-right font-numbers">{calc.possibleWithCurrent.toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <Badge className={getStatusColor(calc.status)}>{calc.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Constraint Warning */}
                {bomIntelligence.shortfall > 0 && (
                  <Card className="p-5 border-2 border-danger/30 bg-danger/[0.02]">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground">Material Constraint Detected</h3>
                        <p className="text-sm text-muted mt-1">
                          <strong>{bomIntelligence.primaryConstraint}</strong> is the primary production constraint.
                          Currently {bomIntelligence.maxBuildable} units can be built out of {bomIntelligence.orderQuantity} required.
                          A shortfall of <strong>{bomIntelligence.shortfall} units</strong> exists.
                          Recommend prioritizing replenishment of {bomIntelligence.primaryConstraint}.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
