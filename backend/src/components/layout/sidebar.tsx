'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bot, 
  Factory as FactoryIcon, 
  Package, 
  Wrench, 
  Zap, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Copilot', href: '/dashboard/ai-copilot', icon: Bot },
  { name: 'Production', href: '/dashboard/production', icon: FactoryIcon },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Energy', href: '/dashboard/energy', icon: Zap },
  { name: 'Sales', href: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Workers', href: '/dashboard/workers', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, isMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#1F3A5F] rounded-lg flex items-center justify-center">
              <FactoryIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1F3A5F]">FactoryMind</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-[#F8F9FA] text-[#6B7280]"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => isMobile && onCloseMobile?.()}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#1F3A5F] text-white"
                      : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#E5E7EB]">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1F3A5F] rounded-full flex items-center justify-center text-white font-semibold">
              MK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">Mr. Kumar</p>
              <p className="text-xs text-[#6B7280] truncate">Factory Owner</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-[#1F3A5F] rounded-full flex items-center justify-center text-white font-semibold mx-auto">
            MK
          </div>
        )}
      </div>
    </div>
  );
}
