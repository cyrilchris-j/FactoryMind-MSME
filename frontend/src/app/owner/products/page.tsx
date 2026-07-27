'use client';

import { OwnerLayout } from '@/components/layout/owner-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, Layers, RefreshCw, Search, Loader2, ArrowRight, TrendingUp, TrendingDown
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  category: string;
  unit: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiGet('/api/products');
      const data = res.data ?? [];
      const filtered = search
        ? data.filter((p: any) =>
            p.productName.toLowerCase().includes(search.toLowerCase()) ||
            p.productCode.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setProducts(filtered);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <OwnerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products & BOM</h1>
            <p className="text-muted">Manage products and Bill of Materials</p>
          </div>
          <Button variant="outline" onClick={fetchProducts} disabled={loading} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : products.length}</p>
            <p className="text-sm text-muted">Total Products</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : products.filter(p => p.isActive).length}</p>
            <p className="text-sm text-muted">Active Products</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : 'Configurable'}</p>
            <p className="text-sm text-muted">BOM Structure</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">All Products</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center text-muted">
              No products found. Add a product to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/owner/products/${product.id}`}
                  className="block p-4 border border-border rounded-xl hover:bg-background hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{product.productName}</h3>
                        <p className="text-sm text-muted">{product.productCode}</p>
                        {product.description && (
                          <p className="text-xs text-muted mt-0.5">{product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={product.isActive ? 'bg-accent/10 text-accent' : 'bg-muted/10 text-muted'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
